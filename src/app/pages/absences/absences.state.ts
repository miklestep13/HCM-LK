import { Injectable, computed, inject, signal } from '@angular/core';
import { AbsenceStore, absDate } from '../../core/demo/absence-store.service';
import { ABS_HIDDEN_DEFAULT, ABS_KINDS, ABS_KIND_GROUP } from '../../data/absence.data';
import { AbsEntry, AbsPerson } from '../../interface/absence';
import { DateRange, TODAY } from '../../shared/ui/date-range/date-range';

/** Состояние страницы «График отсутствий»: вид (дни / год), период, поиск и фильтры, открытая карточка, чей график смотрит руководитель */
@Injectable()
export class AbsencesState {
  readonly store = inject(AbsenceStore);
  /** шкала по умолчанию — дни */
  readonly view = signal<'month' | 'year'>('month');
  /** вид страницы: календарь (диаграмма) или таблица заявок */
  readonly mode = signal<'cal' | 'table'>('cal');
  /** таблица: фильтр «Период» — по умолчанию текущий год (ключи «ГГГГММДД»); панель фильтров скрыта по умолчанию */
  readonly tper = signal<DateRange>({ a: TODAY.getFullYear() + '0101', b: TODAY.getFullYear() + '1231' });
  readonly ftOpen = signal(false);
  readonly year = signal(TODAY.getFullYear());
  readonly month = signal(TODAY.getMonth());
  readonly q = signal('');
  /** «Вид отсутствия»: показываемые виды (подписи, галочки в списке); по умолчанию все, кроме ABS_HIDDEN_DEFAULT */
  readonly kinds = signal<string[]>(ABS_KINDS.filter((k) => !ABS_HIDDEN_DEFAULT.includes(k.k)).map((k) => k.label));
  readonly status = signal('');
  /** свернутые группы подразделений (по названию) */
  readonly teamClosed = signal(new Set<string>());
  toggleTeam(dep: string): void {
    this.teamClosed.update((x) => { const n = new Set(x); n.has(dep) ? n.delete(dep) : n.add(dep); return n; });
  }
  /** карточка отсутствия */
  readonly entry = signal<{ p: AbsPerson; x: AbsEntry; mine: boolean } | null>(null);
  /** руководитель смотрит график сотрудника: статистика наверху — его; null — свой */
  readonly who = signal<AbsPerson | null>(null);
  /** чья статистика наверху */
  readonly person = computed(() => this.who() ?? this.store.me());

/** текущий период (подпись, «Сегодня», стрелки) */
  readonly focus = computed(() => {
    const y = this.year();
    return this.view() === 'year' ? { a: new Date(y, 0, 1), b: new Date(y, 11, 31) } : { a: new Date(y, this.month(), 1), b: new Date(y, this.month() + 1, 0) };
  });
  /** нарисованная лента: прошлый, текущий и следующий период — прокрутка в соседний идет без упора */
  readonly range = computed(() => {
    const y = this.year(), m = this.month();
    return this.view() === 'year' ? { a: new Date(y - 1, 0, 1), b: new Date(y + 1, 11, 31) } : { a: new Date(y, m - 1, 1), b: new Date(y, m + 2, 0) };
  });
  /** период таблицы из фильтра; не задан — без ограничения */
  private tableRange(): { a: Date; b: Date } {
    const { a, b } = this.tper(), d = (k: string) => new Date(+k.slice(0, 4), +k.slice(4, 6) - 1, +k.slice(6, 8));
    return a ? { a: d(a), b: d(b || a) } : { a: new Date(1900, 0, 1), b: new Date(2100, 0, 1) };
  }
  shift(n: number): void {
    if (this.view() === 'year') return this.year.update((y) => y + n);
    const m = this.month() + n;
    this.year.update((y) => y + Math.floor(m / 12));
    this.month.set(((m % 12) + 12) % 12);
  }
  toToday(): void {
    this.year.set(TODAY.getFullYear());
    this.month.set(TODAY.getMonth());
  }
  /** отсутствия по фильтрам и на ленте (календарь) или в периоде фильтра (таблица) */
  visible(p: AbsPerson, table = false): AbsEntry[] {
    const K = new Set(ABS_KINDS.filter((k) => this.kinds().includes(k.label)).map((k) => k.k)), st = this.status(), { a, b } = table ? this.tableRange() : this.range();
    // фильтр по виду в легенде: за свой счет и учебный идут вместе с дополнительным отпуском
    return p.items.filter((x) => K.has(ABS_KIND_GROUP(x.kind)) && (!st || x.status === st) && absDate(x.from)! <= b && absDate(x.to)! >= a);
  }
  match(p: AbsPerson): boolean {
    const q = this.q().trim().toLowerCase();
    return !q || (p.n + ' ' + p.pos).toLowerCase().includes(q);
  }
}
