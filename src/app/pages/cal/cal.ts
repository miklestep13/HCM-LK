import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, inject, signal } from '@angular/core';
import { CAL_MONTHS_GEN, CAL_WD } from '../../data/cal.data';
import { CalEvent } from '../../interface/cal';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../shared/ui/float/float';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { CalForm } from './cal-form/cal-form';
import { CalGrid } from './cal-grid/cal-grid';
import { CalMonth } from './cal-month/cal-month';
import { CalPop } from './cal-pop/cal-pop';
import { CalToolbar } from './cal-toolbar/cal-toolbar';
import { CalState } from './cal.state';
import { CAL_TODAY, cAdd, cHM, cWd } from './cal.utils';

const STATUSES: [string, string][] = [['yes', 'Принято'], ['maybe', 'Под вопросом'], ['none', 'Нет ответа'], ['no', 'Отклонено']];

/**
 * «Мой кабинет → Встречи»: поиск встречи (подсказки), фильтр по ответу, панель периода и вида, сетка дня / недели или месяц.
 * Клик по встрече — карточка встречи; по пустому месту или «Добавить встречу» — форма встречи.
 */
@Component({
  selector: 'app-cal',
  imports: [PageHead, FilterBar, Float, CalToolbar, CalGrid, CalMonth, CalPop, CalForm],
  templateUrl: './cal.html',
  styleUrl: './cal.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-cal', '(document:click)': 'closeFloats()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cal {
  protected readonly s = inject(CalState);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly statuses = STATUSES;
  protected readonly q = signal('');
  protected readonly pop = signal<{ ev: CalEvent; d: Date; el: HTMLElement } | null>(null);
  /** подсказки поиска */
  protected readonly hits = signal<{ ev: CalEvent; d: Date }[] | null>(null);
  protected readonly cur = signal(0);
  protected searchEl: HTMLElement | null = null;
  protected readonly hm = cHM;

  toggleSt(k: string): void {
    this.s.st.update((x) => ({ ...x, [k]: x[k] === false }));
  }
  protected openEvent(p: { ev: CalEvent; d: Date; el: HTMLElement }): void {
    this.hits.set(null);
    this.pop.set(this.pop()?.el === p.el ? null : p);
  }
  protected create(p?: { d: Date; s: number }): void {
    this.pop.set(null);
    this.s.form.set(p ? { d: p.d, s: p.s } : {});
  }
  closeFloats(): void {
    this.pop.set(null);
    this.hits.set(null);
  }

  // ——— поиск: ближайшие встречи за 3 недели назад и 6,5 вперед ———
  protected search(v: string): void {
    this.q.set(v);
    this.pop.set(null);
    const s = v.trim().toLowerCase();
    this.searchEl = this.el.querySelector('.calq');
    if (s.length < 2) return this.hits.set(null);
    const hits: { ev: CalEvent; d: Date }[] = [];
    for (let d = cAdd(CAL_TODAY, -21); d <= cAdd(CAL_TODAY, 45) && hits.length < 8; d = cAdd(d, 1))
      this.s.day(d).forEach((o) => {
        if (hits.length < 8 && (o.ev.t + ' ' + (o.ev.loc || '') + ' ' + o.ev.ppl.join(' ')).toLowerCase().includes(s) && !(o.ev.rep && hits.some((h) => h.ev === o.ev && h.d >= CAL_TODAY))) hits.push(o);
      });
    hits.sort((x, y) => Math.abs(+x.d - +CAL_TODAY) - Math.abs(+y.d - +CAL_TODAY));
    this.cur.set(0);
    this.hits.set(hits);
  }
  protected hitText(o: { ev: CalEvent; d: Date }): string {
    const e = o.ev, d = o.d;
    return CAL_WD[cWd(d)] + ', ' + d.getDate() + ' ' + CAL_MONTHS_GEN[d.getMonth()] + (e.all ? ' · весь день' : ' · ' + cHM(e.s) + '–' + cHM(e.e)) + (e.loc ? ' · ' + e.loc : '');
  }
  protected key(e: KeyboardEvent): void {
    const H = this.hits();
    if (!H?.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.cur.update((c) => (c + (e.key === 'ArrowDown' ? 1 : H.length - 1)) % H.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.pick(this.cur());
    }
    if (e.key === 'Escape') this.hits.set(null);
  }
  /** перейти к найденной встрече и подсветить ее */
  protected pick(i: number): void {
    const h = this.hits()![i];
    this.hits.set(null);
    this.s.d.set(h.d);
    if (this.s.view() === 'month') this.s.view.set('wweek');
    if (h.d.getDay() % 6 === 0 && this.s.view() === 'wweek') this.s.view.set('week');
    this.q.set('');
    const inp = this.searchEl as HTMLInputElement | null;
    if (inp) inp.value = '';
    this.s.flash(h.ev.id);
  }
}
