import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CAL_MONTHS, CAL_MONTHS_GEN, CAL_WD, CAL_WDF } from '../../../data/cal.data';
import { Float } from '../../../shared/ui/float/float';
import { PeriodBar } from '../../../shared/ui/period-bar/period-bar';
import { CalState, CalView } from '../cal.state';
import { CAL_TODAY, cAdd, cKey, cMon, cWd } from '../cal.utils';

const PREV = 'M10 3.6 5.6 8l4.4 4.4';

/** Панель календаря (общая app-period-bar): «Сегодня», назад / вперед, период (по клику — мини-календарь), вид: день, рабочая неделя, неделя, месяц. */
@Component({
  selector: '[cal-toolbar]',
  imports: [Float, PeriodBar],
  template: `
    <div app-period-bar picker [label]="label()" [views]="views" [value]="s.view()" (valueChange)="s.view.set($any($event))" (shift)="s.shift($event)" (today)="s.d.set(today())" (pick)="togglePk($event)"></div>
    @if (pk(); as a) {
      <div class="fpop calpk" [appFloat]="a" (click)="$event.stopPropagation()">
        <div class="calmh">
          <b>{{ months[mm().getMonth()] }} {{ mm().getFullYear() }}</b>
          <button class="ib3" title="Предыдущий месяц" (click)="moveMm(-1)"><svg viewBox="0 0 16 16" fill="none"><path [attr.d]="prev" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
          <button class="ib3 nx" title="Следующий месяц" (click)="moveMm(1)"><svg viewBox="0 0 16 16" fill="none"><path [attr.d]="prev" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
        </div>
        <div class="calmg">
          @for (w of wd; track w) {
            <span class="calmw">{{ w }}</span>
          }
          @for (c of cells(); track c.key) {
            <button class="calmd" [class.out]="c.out" [class.tdy]="c.tdy" [class.inr]="c.inr" [class.sel]="c.sel" (click)="pick(c.d)">{{ c.d.getDate() }}@if (c.has) {<i></i>}</button>
          }
        </div>
        <div class="calpkf"><button class="lnk" (click)="pick(today())">Сегодня</button></div>
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { '(document:click)': 'pk.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalToolbar {
  protected readonly s = inject(CalState);
  protected readonly prev = PREV;
  protected readonly wd = CAL_WD;
  protected readonly months = CAL_MONTHS;
  protected readonly views: { value: CalView; label: string }[] = [
    { value: 'day', label: 'День' },
    { value: 'wweek', label: 'Раб. неделя' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
  ];
  protected readonly pk = signal<HTMLElement | null>(null);
  protected readonly mm = signal(new Date(CAL_TODAY.getFullYear(), CAL_TODAY.getMonth(), 1));
  protected today = () => new Date(CAL_TODAY);

  protected readonly label = computed(() => {
    const d = this.s.d(), [a, z] = this.s.range(), G = CAL_MONTHS_GEN;
    if (this.s.view() === 'day') return CAL_WDF[cWd(d)] + ', ' + d.getDate() + ' ' + G[d.getMonth()] + ' ' + d.getFullYear();
    if (this.s.view() === 'month') return CAL_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    return a.getMonth() === z.getMonth()
      ? a.getDate() + ' – ' + z.getDate() + ' ' + G[z.getMonth()] + ' ' + z.getFullYear()
      : a.getDate() + ' ' + G[a.getMonth()] + ' – ' + z.getDate() + ' ' + G[z.getMonth()] + ' ' + z.getFullYear();
  });
  protected readonly cells = computed(() => {
    const m = this.mm(), st = cMon(m), [a, z] = this.s.range(), month = this.s.view() === 'month';
    return Array.from({ length: 42 }, (_, i) => {
      const d = cAdd(st, i);
      return {
        d, key: cKey(d), out: d.getMonth() !== m.getMonth(), tdy: cKey(d) === cKey(CAL_TODAY),
        inr: d >= a && d <= z && !month, sel: cKey(d) === cKey(this.s.d()), has: this.s.day(d).length > 0,
      };
    });
  });

  protected togglePk(btn: HTMLElement): void {
    if (this.pk()) return this.pk.set(null);
    const d = this.s.d();
    this.mm.set(new Date(d.getFullYear(), d.getMonth(), 1));
    this.pk.set(btn);
  }
  protected moveMm(n: number): void {
    const m = this.mm();
    this.mm.set(new Date(m.getFullYear(), m.getMonth() + n, 1));
  }
  protected pick(d: Date): void {
    this.s.d.set(d);
    this.pk.set(null);
  }
}
