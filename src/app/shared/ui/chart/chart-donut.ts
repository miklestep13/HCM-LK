import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/** сегмент кольца: подпись, значение, цвет (класс .s1–.s5 — категориальные, .ok / .dg / .mute — статусы) */
export interface DonutSeg {
  l: string;
  v: number;
  c?: string;
}

/**
 * Кольцо с числом в центре и легендой справа (подпись, число, доля). Больше 5 сегментов — остальные сворачиваются в «Другие».
 *   <app-chart-donut [segs]="[{ l: 'Сдали', v: 112, c: 'ok' }]" center="79%" centerSub="сдали" />
 */
@Component({
  selector: 'app-chart-donut',
  template: `
    <div class="chd" (mouseleave)="hov.set(-1)">
      <svg viewBox="0 0 120 120" class="chds">
        @for (a of arcs(); track $index; let i = $index) {
          <circle cx="60" cy="60" r="48" [class]="'chdseg ' + a.c" [class.dim]="hov() >= 0 && hov() !== i" [attr.stroke-dasharray]="a.len + ' ' + (C - a.len)" [attr.stroke-dashoffset]="-a.off" (mouseenter)="hov.set(i)" />
        }
      </svg>
      <div class="chdc">
        @if (hov() >= 0) {
          <b>{{ pct(arcs()[hov()].v) }}%</b><small>{{ arcs()[hov()].l }}</small>
        } @else {
          <b>{{ center() }}</b><small>{{ centerSub() }}</small>
        }
      </div>
    </div>
    <div class="chdl">
      @for (a of arcs(); track $index; let i = $index) {
        <div class="chdli" [class.on]="hov() === i" (mouseenter)="hov.set(i)" (mouseleave)="hov.set(-1)">
          <i [class]="a.c"></i><span>{{ a.l }}</span><b>{{ a.v }}</b><small>{{ pct(a.v) }}%</small>
        </div>
      }
    </div>
  `,
  host: { class: 'chart-donut' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartDonut {
  readonly segs = input.required<DonutSeg[]>();
  readonly center = input('');
  readonly centerSub = input('');
  protected readonly C = 2 * Math.PI * 48;
  protected readonly hov = signal(-1);
  /** до 5 сегментов, остальные — «Другие» (серый) */
  private readonly list = computed(() => {
    const s = this.segs().map((x, i) => ({ ...x, c: x.c || 's' + (i + 1) }));
    if (s.length <= 5) return s;
    const rest = s.slice(4).reduce((a, x) => a + x.v, 0);
    return [...s.slice(0, 4), { l: 'Другие', v: rest, c: 'mute' }];
  });
  private readonly sum = computed(() => this.list().reduce((a, x) => a + x.v, 0) || 1);
  /** дуги с зазором 2px между сегментами */
  protected readonly arcs = computed(() => {
    let off = 0;
    return this.list().map((x) => {
      const full = (x.v / this.sum()) * this.C;
      const a = { ...x, len: Math.max(0, full - 2), off };
      off += full;
      return a;
    });
  });
  protected pct(v: number): number {
    return Math.round((v / this.sum()) * 100);
  }
}
