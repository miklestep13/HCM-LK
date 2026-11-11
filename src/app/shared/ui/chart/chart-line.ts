import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * Линия с заливкой (динамика по дням): ось Y — значения, ось X — подписи (каждая n-я), при наведении — вертикаль, точка и подсказка.
 *   <app-chart-line [data]="[['01.09', 4], ['02.09', 12]]" unit="завершили" />
 */
@Component({
  selector: 'app-chart-line',
  template: `
    <div class="chl" (mouseleave)="hov.set(-1)">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" preserveAspectRatio="none" class="chls">
        @for (t of ticks(); track t) {
          <line class="chgrid" x1="0" [attr.x2]="W" [attr.y1]="y(t)" [attr.y2]="y(t)" />
        }
        <path class="charea" [attr.d]="area()" />
        <path class="chline" [attr.d]="line()" />
        @if (hov() >= 0) {
          <line class="chcross" [attr.x1]="x(hov())" [attr.x2]="x(hov())" y1="0" [attr.y2]="H" />
        }
      </svg>
      @if (hov() >= 0) {
        @let d = data()[hov()];
        <i class="chdot" [style.left.%]="(x(hov()) / W) * 100" [style.top.%]="(y(d[1]) / H) * 100"></i>
        <div class="chtip" [style.left.%]="(x(hov()) / W) * 100"><b>{{ d[1] }}</b> {{ unit() }}<small>{{ d[0] }}</small></div>
      }
      <div class="chhit">
        @for (d of data(); track $index; let i = $index) {
          <span (mouseenter)="hov.set(i)"></span>
        }
      </div>
      <div class="chay">
        @for (t of ticks(); track t) {
          <span [style.top.%]="(y(t) / H) * 100">{{ t }}</span>
        }
      </div>
    </div>
    <div class="chax">
      @for (d of data(); track $index; let i = $index) {
        <span [style.left.%]="(x(i) / W) * 100" [class.hide]="!shown(i)">{{ d[0] }}</span>
      }
    </div>
  `,
  host: { class: 'chart-line' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLine {
  readonly data = input.required<[string, number][]>();
  /** что считаем (в подсказке): «завершили» */
  readonly unit = input('');
  protected readonly W = 600;
  protected readonly H = 200;
  protected readonly hov = signal(-1);
  private readonly top = computed(() => {
    const m = Math.max(1, ...this.data().map((d) => d[1]));
    const p = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / p) * p;
  });
  protected readonly ticks = computed(() => [0, 1, 2, 3, 4].map((i) => Math.round((this.top() / 4) * i)));
  protected readonly every = computed(() => Math.max(1, Math.ceil(this.data().length / 8)));
  /** подпись оси X: каждая n-я и последняя; соседняя с последней — скрыта, если не помещается */
  protected shown(i: number): boolean {
    const last = this.data().length - 1;
    if (i === last) return true;
    return i % this.every() === 0 && last - i >= this.every() / 2;
  }
  protected x(i: number): number {
    return this.data().length < 2 ? 0 : (i / (this.data().length - 1)) * this.W;
  }
  protected y(v: number): number {
    return this.H - (v / this.top()) * (this.H - 8) - 4;
  }
  protected readonly line = computed(() => this.data().map((d, i) => (i ? 'L' : 'M') + this.x(i) + ' ' + this.y(d[1])).join(' '));
  protected readonly area = computed(() => this.line() + ' L' + this.W + ' ' + this.H + ' L0 ' + this.H + ' Z');
}
