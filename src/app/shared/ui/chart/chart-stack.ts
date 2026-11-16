import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DonutSeg } from './chart-donut';

/**
 * Полоса из долей (100%) с легендой под ней: подпись, число, доля. Цвет сегмента — класс (.s1–.s5, .ok, .warn, .mute, .d1–.d5 — расходящаяся шкала).
 *   <app-chart-stack [segs]="[{ l: 'Завершен', v: 142, c: 'ok' }]" />
 * compact — без легенды (строки матрицы).
 */
@Component({
  selector: 'app-chart-stack',
  template: `
    <div class="chs">
      @for (s of segs(); track $index) {
        @if (s.v) {
          <i [class]="s.c || ''" [style.flex-grow]="s.v" [title]="s.l + ': ' + s.v + ' · ' + pct(s.v) + '%'">@if (pct(s.v) >= 8) {<small>{{ pct(s.v) }}%</small>}</i>
        }
      }
    </div>
    @if (!compact()) {
      <div class="chsl">
        @for (s of segs(); track $index) {
          <span><i [class]="s.c || ''"></i>{{ s.l }} <b>{{ s.v }}</b> <small>{{ pct(s.v) }}%</small></span>
        }
      </div>
    }
  `,
  host: { class: 'chart-stack' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartStack {
  readonly segs = input.required<DonutSeg[]>();
  readonly compact = input(false);
  private readonly sum = computed(() => this.segs().reduce((a, x) => a + x.v, 0) || 1);
  protected pct(v: number): number {
    return Math.round((v / this.sum()) * 100);
  }
}
