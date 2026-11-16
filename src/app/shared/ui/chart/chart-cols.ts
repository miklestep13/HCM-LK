import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * Вертикальные столбцы (распределение по шкале: 1–5, 0–10, интервалы): значение над столбцом, подпись под ним, подсказка при наведении.
 * tones — цвет столбца по индексу ('dg' | 'warn' | 'ok', для eNPS), иначе синий.
 *   <app-chart-cols [data]="[['1', 4], ['2', 9]]" unit="ответов" />
 */
@Component({
  selector: 'app-chart-cols',
  template: `
    <div class="chc" (mouseleave)="hov.set(-1)">
      @for (d of data(); track $index; let i = $index) {
        <div class="chcc" [class.on]="hov() === i" (mouseenter)="hov.set(i)">
          <small class="chcv">{{ d[1] }}</small>
          <i [class]="tones()[i] || ''" [style.height.%]="(d[1] / top()) * 100"></i>
          <span class="chcl">{{ d[0] }}</span>
          @if (hov() === i) {
            <div class="chtip"><b>{{ d[1] }}</b> {{ unit() }}<small>{{ d[0] }} · {{ pct(d[1]) }}%</small></div>
          }
        </div>
      }
    </div>
  `,
  host: { class: 'chart-cols' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCols {
  readonly data = input.required<[string, number][]>();
  readonly unit = input('');
  readonly tones = input<string[]>([]);
  protected readonly hov = signal(-1);
  protected readonly top = computed(() => Math.max(1, ...this.data().map((d) => d[1])));
  private readonly sum = computed(() => this.data().reduce((a, d) => a + d[1], 0) || 1);
  protected pct(v: number): number {
    return Math.round((v / this.sum()) * 100);
  }
}
