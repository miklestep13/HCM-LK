import { Injectable, signal } from '@angular/core';
import { EventForm, emptyEvent, parseDT } from '../../core/demo/events-store.service';

const z = (n: number) => String(n).padStart(2, '0');
const DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const TIME = /^\d{1,2}:\d{2}$/;

/** Состояние формы мероприятия: поля, редактируемое мероприятие, ошибка */
@Injectable()
export class EventnewState {
  readonly id = signal('');
  readonly f = signal<EventForm>(emptyEvent());
  readonly err = signal('');
  /** поле с ошибкой */
  readonly bad = signal('');

  /** поле формы; окончание подставляется само: тот же день, на час позже начала */
  set<K extends keyof EventForm>(k: K, v: EventForm[K]): void {
    this.f.update((x) => {
      const n = { ...x, [k]: v };
      if (k === 'date' && DATE.test(String(v)) && !x.endDate) n.endDate = String(v);
      if (k === 'time' && TIME.test(String(v)) && !x.endTime) {
        const [h, m] = String(v).split(':').map(Number);
        n.endTime = z(Math.min(h + 1, 23)) + ':' + z(m);
      }
      return n;
    });
    this.err.set('');
    this.bad.set('');
  }

  /** проверка обязательных полей; текст ошибки или '' */
  check(): string {
    const f = this.f();
    const fail = (k: string, m: string) => (this.bad.set(k), m);
    const okDate = (d: string) => {
      const a = DATE.exec(d.trim());
      return !!a && +a[2] >= 1 && +a[2] <= 12 && +a[1] >= 1 && +a[1] <= 31;
    };
    if (!f.type) return fail('type', 'Выберите тип встречи.');
    if (!f.title.trim()) return fail('title', 'Укажите наименование мероприятия.');
    if (!okDate(f.date)) return fail('date', 'Укажите дату начала в формате дд.мм.гггг.');
    if (!TIME.test(f.time.trim())) return fail('time', 'Укажите время начала в формате чч:мм.');
    if (!okDate(f.endDate)) return fail('endDate', 'Укажите дату окончания в формате дд.мм.гггг.');
    if (!TIME.test(f.endTime.trim())) return fail('endTime', 'Укажите время окончания в формате чч:мм.');
    const a = parseDT(f.date, f.time), b = parseDT(f.endDate, f.endTime);
    if (!a || !b || b <= a) return fail('endTime', 'Окончание должно быть позже начала.');
    if (!f.place.trim()) return fail('place', 'Укажите место проведения или сгенерируйте ссылку встречи.');
    if (f.repKind !== 'Не повторять' && f.repEnd === 'date') {
      const t = parseDT(f.repTo, '');
      if (!okDate(f.repTo) || !t || t < parseDT(f.date, '')!) return fail('repTo', 'Укажите дату завершения повторений не раньше даты начала.');
    }
    if (f.people.some((p) => !p.n)) return fail('people', 'Выберите сотрудника в каждой строке участников или уберите пустую строку.');
    return '';
  }
}
