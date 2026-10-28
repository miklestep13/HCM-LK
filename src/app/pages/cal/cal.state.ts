import { Injectable, computed, signal } from '@angular/core';
import { CAL_EVENTS } from '../../data/cal.data';
import { CalEvent } from '../../interface/cal';
import { CAL_TODAY, cAdd, cMon, calHits } from './cal.utils';

export type CalView = 'day' | 'wweek' | 'week' | 'month';

/**
 * Календарь «Мои встречи»: встречи, вид (день, рабочая неделя, неделя, месяц), текущая дата, фильтр по ответу.
 * Живет все время работы прототипа — созданные встречи и выбранный вид сохраняются при переходах.
 */
@Injectable({ providedIn: 'root' })
export class CalState {
  readonly events = signal<CalEvent[]>(CAL_EVENTS.map((e) => ({ ...e, ppl: [...e.ppl] })));
  readonly view = signal<CalView>('wweek');
  readonly d = signal(new Date(CAL_TODAY));
  /** подсвеченная встреча (после поиска или сохранения) */
  readonly hit = signal<string | null>(null);
  /** фильтр по ответу: отклоненные по умолчанию скрыты */
  readonly st = signal<Record<string, boolean>>({ yes: true, maybe: true, none: true, no: false });
  readonly opened = signal(false);
  /** форма встречи: null — закрыта; event — правка; иначе новая на дату и время */
  readonly form = signal<{ ev?: CalEvent; d?: Date; s?: number } | null>(null);

  /** границы видимого периода */
  readonly range = computed<[Date, Date]>(() => {
    const d = this.d(), v = this.view();
    if (v === 'day') return [d, d];
    if (v === 'month') {
      const s = cMon(new Date(d.getFullYear(), d.getMonth(), 1));
      return [s, cAdd(s, 41)];
    }
    const m = cMon(d);
    return [m, cAdd(m, v === 'wweek' ? 4 : 6)];
  });

  /** встречи дня (без скрытых фильтром ответов) */
  day(d: Date): { ev: CalEvent; d: Date }[] {
    const st = this.st();
    return this.events()
      .filter((e) => calHits(e, d) && st[e.my || 'none'] !== false)
      .map((ev) => ({ ev, d }));
  }
  shift(n: number): void {
    const d = this.d(), v = this.view();
    this.d.set(v === 'day' ? cAdd(d, n) : v === 'month' ? new Date(d.getFullYear(), d.getMonth() + n, 1) : cAdd(d, 7 * n));
  }
  /** подсветить встречу на 2,6 с */
  flash(id: string): void {
    this.hit.set(id);
    setTimeout(() => this.hit() === id && this.hit.set(null), 2600);
  }
  update(id: string, patch: Partial<CalEvent>): void {
    this.events.update((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
}
