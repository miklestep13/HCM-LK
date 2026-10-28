import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, output } from '@angular/core';
import { CAL_WDF } from '../../../data/cal.data';
import { CalEvent } from '../../../interface/cal';
import { CalState } from '../cal.state';
import { CAL_TODAY, cAdd, cHM, cKey } from '../cal.utils';

/** Месяц: 6 недель, в дне — до трех встреч и «еще N»; клик по числу или «еще» открывает день. */
@Component({
  selector: '[cal-month]',
  template: `
    <div class="calmhd">
      @for (w of wdf; track w) {
        <span>{{ w }}</span>
      }
    </div>
    <div class="calmb">
      @for (c of cells(); track c.key) {
        <div class="calmc" [class.out]="c.out" [class.tdy]="c.key === todayKey" [class.we]="c.d.getDay() % 6 === 0" (click)="onCell(c.d, $event)">
          <button class="calmn" (click)="openDay(c.d, $event)">{{ c.d.getDate() }}</button>
          @for (o of c.L.slice(0, 3); track o.ev.id) {
            <button class="cle mc" [class]="o.ev.my" [class.priv]="o.ev.priv" [class.hit]="s.hit() === o.ev.id" style="--cc: var(--q-primary-500); --ct: var(--q-primary-50)" (click)="onEvent(o.ev, c.d, $event)">
              @if (!o.ev.all) {<span>{{ hm(o.ev.s) }}</span>}<b>{{ o.ev.t }}</b>
            </button>
          }
          @if (c.L.length > 3) {
            <button class="calmore" (click)="openDay(c.d, $event)">еще {{ c.L.length - 3 }}</button>
          }
        </div>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'calm' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalMonth {
  protected readonly s = inject(CalState);
  readonly pick = output<{ ev: CalEvent; d: Date; el: HTMLElement }>();
  readonly create = output<{ d: Date; s: number }>();
  protected readonly wdf = CAL_WDF;
  protected readonly hm = cHM;
  protected readonly todayKey = cKey(CAL_TODAY);
  protected readonly cells = computed(() => {
    const [a] = this.s.range(), m = this.s.d().getMonth();
    return Array.from({ length: 42 }, (_, i) => {
      const d = cAdd(a, i);
      const L = this.s.day(d).sort((x, y) => (y.ev.all || 0) - (x.ev.all || 0) || x.ev.s - y.ev.s);
      return { d, key: cKey(d), out: d.getMonth() !== m, L };
    });
  });
  protected openDay(d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.s.d.set(d);
    this.s.view.set('day');
  }
  protected onEvent(ev: CalEvent, d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.pick.emit({ ev, d, el: e.currentTarget as HTMLElement });
  }
  protected onCell(d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.create.emit({ d, s: 600 });
  }
}
