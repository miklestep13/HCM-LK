import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CAL_MONTHS, CAL_MONTHS_GEN, CAL_WD, CAL_WDF } from '../../../data/cal.data';
import { Float } from '../../../shared/ui/float/float';
import { CalState, CalView } from '../cal.state';
import { CAL_TODAY, cAdd, cKey, cMon, cWd } from '../cal.utils';

const PREV = 'M10 3.6 5.6 8l4.4 4.4';

/** Панель календаря: «Сегодня», назад / вперед, период (по клику — мини-календарь), вид: день, рабочая неделя, неделя, месяц. */
@Component({
  selector: '[cal-toolbar]',
  imports: [Float],
  template: `
    <button class="btn raised" (click)="s.d.set(today())">Сегодня</button>
    <div class="ctnav">
      <button class="ib3 ibsq" title="Назад" (click)="s.shift(-1)"><svg viewBox="0 0 16 16" fill="none"><path [attr.d]="prev" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
      <button class="ib3 ibsq nx" title="Вперед" (click)="s.shift(1)"><svg viewBox="0 0 16 16" fill="none"><path [attr.d]="prev" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
    </div>
    <button class="callbl" title="Выбрать период" (click)="togglePk($event)">
      {{ label() }}<svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <span class="bkgap"></span>
    <div class="seg">
      @for (v of views; track v[0]) {
        <span [class.on]="s.view() === v[0]" (click)="s.view.set(v[0])">{{ v[1] }}</span>
      }
    </div>
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
  host: { class: 'tbar calbar', '(document:click)': 'pk.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalToolbar {
  protected readonly s = inject(CalState);
  protected readonly prev = PREV;
  protected readonly wd = CAL_WD;
  protected readonly months = CAL_MONTHS;
  protected readonly views: [CalView, string][] = [['day', 'День'], ['wweek', 'Раб. неделя'], ['week', 'Неделя'], ['month', 'Месяц']];
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

  protected togglePk(e: MouseEvent): void {
    e.stopPropagation();
    if (this.pk()) return this.pk.set(null);
    const d = this.s.d();
    this.mm.set(new Date(d.getFullYear(), d.getMonth(), 1));
    this.pk.set(e.currentTarget as HTMLElement);
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
