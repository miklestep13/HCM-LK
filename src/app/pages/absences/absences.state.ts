import { Injectable, computed, inject, signal } from '@angular/core';
import { AbsenceStore, absDate } from '../../core/demo/absence-store.service';
import { ABS_APPLY, ABS_VAC_TYPES } from '../../data/absence.data';
import { AbsEntry, AbsKind, AbsPerson } from '../../interface/absence';
import { DateRange, TODAY } from '../../shared/ui/date-range/date-range';

/** Состояние страницы «График отсутствий»: вид (месяц / год), период, поиск и фильтры, открытые сайдбары */
@Injectable()
export class AbsencesState {
  readonly store = inject(AbsenceStore);
  readonly view = signal<'month' | 'year'>('year');
  /** вид страницы: календарь (диаграмма) или таблица заявок */
  readonly mode = signal<'cal' | 'table'>('cal');
  /** таблица: фильтр «Период» — по умолчанию текущий год (ключи «ГГГГММДД»); панель фильтров скрыта по умолчанию */
  readonly tper = signal<DateRange>({ a: TODAY.getFullYear() + '0101', b: TODAY.getFullYear() + '1231' });
  readonly ftOpen = signal(false);
  readonly year = signal(TODAY.getFullYear());
  readonly month = signal(TODAY.getMonth());
  readonly q = signal('');
  /** вид отсутствия (подпись); пусто — все */
  readonly kind = signal('');
  /** тип отпуска (подпись); пусто — все */
  readonly vtype = signal('');
  readonly status = signal('');
  readonly teamOpen = signal(true);
  /** сайдбары: отсутствие, заявка */
  readonly entry = signal<{ p: AbsPerson; x: AbsEntry; mine: boolean } | null>(null);
  readonly planOpen = signal(false);
  /** редактируемая своя заявка (форма заявки открывается заполненной) */
  readonly editing = signal<AbsEntry | null>(null);
  /** вид отсутствия, выбранный в «Оформить ▾» */
  readonly planKind = signal<AbsKind>('vac');

  /** заявка на отсутствие выбранного вида */
  add(kind: AbsKind): void {
    this.editing.set(null);
    this.planKind.set(kind);
    this.planOpen.set(true);
  }
  /** «Редактировать» в карточке: та же форма, поля заполнены заявкой */
  edit(x: AbsEntry): void {
    this.entry.set(null);
    this.editing.set(x);
    this.planKind.set(x.kind);
    this.planOpen.set(true);
  }

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
    // вид: «Отпуск» — любой из типов отпуска; тип отпуска — уточняет
    const K = ABS_APPLY.find((k) => k.label === this.kind())?.k, T = ABS_VAC_TYPES.find((t) => t.label === this.vtype())?.k, st = this.status(), { a, b } = table ? this.tableRange() : this.range();
    const kindOk = (k: AbsKind) => (!K || (K === 'add' ? ABS_VAC_TYPES.some((t) => t.k === k) : k === K)) && (!T || k === T);
    return p.items.filter((x) => kindOk(x.kind) && (!st || x.status === st) && absDate(x.from)! <= b && absDate(x.to)! >= a);
  }
  match(p: AbsPerson): boolean {
    const q = this.q().trim().toLowerCase();
    return !q || (p.n + ' ' + p.pos).toLowerCase().includes(q);
  }
}
