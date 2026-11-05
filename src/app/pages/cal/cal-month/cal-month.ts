import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, output, signal } from '@angular/core';
import { CAL_WDF } from '../../../data/cal.data';
import { CalEvent } from '../../../interface/cal';
import { CalQuick } from '../cal-quick/cal-quick';
import { CalTime, calTime } from '../cal-time/cal-time';
import { CalState } from '../cal.state';
import { CAL_TODAY, cAdd, cKey } from '../cal.utils';

/** Месяц: 6 недель, в дне — до трех встреч и «еще N»; клик по числу или «еще» открывает день. Клик по встрече — краткая информация, двойной — полная форма на просмотр; клик по дню — быстрое создание. */
@Component({
  selector: '[cal-month]',
  imports: [CalTime, CalQuick],
  template: `
    <div class="calmhd">
      @for (w of wdf; track w) {
        <span>{{ w }}</span>
      }
    </div>
    <div class="calmb">
      @for (c of cells(); track c.key) {
        <div class="calmc" [class.out]="c.out" [class.tdy]="c.key === todayKey" [class.we]="c.d.getDay() % 6 === 0" [class.sel]="s.quick() && cell() && c.key === key(s.quick()!.d)" (click)="onCell(c.d, $event)">
          <button class="calmn" (click)="openDay(c.d, $event)">{{ c.d.getDate() }}</button>
          @for (o of c.L.slice(0, 3); track o.ev.id) {
            <button class="cle mc" [class]="o.ev.my" [class.on]="s.sel() === o.ev.id" [class.hit]="s.hit() === o.ev.id" [title]="o.ev.t + ', ' + time(o.ev)" (click)="onEvent(o.ev, c.d, $event)" (dblclick)="onFull(o.ev, c.d, $event)">
              <span cal-time [ev]="o.ev"></span><b>{{ o.ev.t }}</b>
            </button>
          }
          @if (c.L.length > 3) {
            <button class="calmore" (click)="openDay(c.d, $event)">еще {{ c.L.length - 3 }}</button>
          }
        </div>
      }
    </div>
    @if (s.quick() && cell(); as el) {
      <app-cal-quick [anchor]="el" />
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'calm' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalMonth {
  protected readonly s = inject(CalState);
  readonly pick = output<{ ev: CalEvent; d: Date; el: HTMLElement }>();
  protected readonly wdf = CAL_WDF;
  protected readonly key = cKey;
  protected readonly time = calTime;
  /** день, по которому кликнули, — якорь быстрого создания */
  protected readonly cell = signal<HTMLElement | null>(null);
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
  /** клик — выделить встречу и показать краткую информацию */
  protected onEvent(ev: CalEvent, d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.s.quick.set(null);
    this.s.sel.set(ev.id);
    this.pick.emit({ ev, d, el: e.currentTarget as HTMLElement });
  }
  /** двойной клик — полная форма встречи на просмотр */
  protected onFull(ev: CalEvent, d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.s.preview(ev, d);
  }
  /** клик по дню — быстрое создание на 10:00 */
  protected onCell(d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.s.sel.set(null);
    this.cell.set(e.currentTarget as HTMLElement);
    this.s.quick.set({ d, s: 600, e: 630 });
  }
}
