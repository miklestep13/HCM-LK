import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { GROWTH_360, GROWTH_360_SOURCES } from '../../../data/growth.data';
import { Growth360Row } from '../../../interface/growth';

/** среднее внешних оценок (руководитель, коллеги, подчиненные) */
export const growthOther = (c: Growth360Row) => Math.round((c.v[1] + c.v[2] + c.v[3]) / 3);
/** разрыв: самооценка минус среднее внешних */
export const growthGap = (c: Growth360Row) => c.v[0] - growthOther(c);

const N = GROWTH_360.length,
  CX = 210,
  CY = 200,
  R = 130;
const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
const pt = (i: number, r: number) => [CX + r * Math.cos(ang(i)), CY + r * Math.sin(ang(i))];
const pts = (f: (i: number) => number) => GROWTH_360.map((_, i) => pt(i, f(i)).map((v) => v.toFixed(1)).join(',')).join(' ');

/** Радар оценки 360: сетка, серии источников (выключенные — бледно), подписи и подсказка по сектору */
@Component({
  selector: '[a360-radar]',
  template: `
    <div>
      <svg viewBox="-135 14 690 374" style="width: 100%; height: auto; display: block">
        @for (f of grid; track f) {
          <polygon [attr.points]="f" fill="none" stroke="var(--q-content-border-secondary)" stroke-width="1" />
        }
        @for (l of axes; track $index) {
          <line [attr.x1]="cx" [attr.y1]="cy" [attr.x2]="l[0]" [attr.y2]="l[1]" stroke="var(--q-content-border-secondary)" stroke-width="1" />
        }
        @for (s of series(); track s.k) {
          <polygon
            [attr.points]="s.pts"
            [attr.fill]="s.color"
            [attr.fill-opacity]="s.on ? '.08' : '0'"
            [attr.stroke]="s.color"
            [attr.stroke-width]="s.on ? 2 : 1.2"
            [attr.stroke-opacity]="s.on ? 1 : 0.18"
            stroke-linejoin="round"
          />
          @if (s.on) {
            @for (d of s.dots; track $index) {
              <circle [attr.cx]="d[0]" [attr.cy]="d[1]" r="3.4" [attr.fill]="s.color" />
            }
          }
        }
        @for (t of labels; track $index) {
          <text [attr.x]="t.x" [attr.y]="t.y" [attr.text-anchor]="t.an" font-family="Open Sans,Segoe UI,system-ui,sans-serif" font-size="14" fill="var(--q-base-500)">
            {{ t.l1 }}
            @if (t.l2) {
              <tspan [attr.x]="t.x" dy="16">{{ t.l2 }}</tspan>
            }
          </text>
        }
        @for (z of zones; track $index) {
          <polygon [attr.points]="z" fill="transparent" style="cursor: pointer" (mousemove)="move($event, $index)" (mouseleave)="tip.set(null)" />
        }
      </svg>
    </div>
    @if (tipRow(); as t) {
      <div class="grtip" [style.left.px]="t.x" [style.top.px]="t.y">
        <b>{{ t.c.name }}</b>
        @for (s of sources; track s[0]; let k = $index) {
          <span class="gtr" [class.off]="!on().has(k)"><i [style.background]="s[1]"></i>{{ s[0] }}<b>{{ t.c.v[k] }}%</b></span>
        }
        <span class="gtg"
          >Разрыв с внешней оценкой: <b [class.dg]="t.gap > 5" [class.ok]="t.gap < -5">{{ t.gap > 0 ? '+' : '' }}{{ t.gap }} п. п.</b
          >{{ t.gap > 5 ? ' · вы оцениваете себя выше коллег' : t.gap < -5 ? ' · коллеги оценивают вас выше' : ' · оценки совпадают' }}</span
        >
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360Radar {
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly on = input.required<Set<number>>();
  protected readonly sources = GROWTH_360_SOURCES;
  protected readonly cx = CX;
  protected readonly cy = CY;
  protected readonly grid = [0.25, 0.5, 0.75, 1].map((f) => pts(() => R * f));
  protected readonly axes = GROWTH_360.map((_, i) => pt(i, R).map((v) => v.toFixed(1)));
  /** сначала выключенные серии, поверх — включенные */
  protected readonly series = computed(() => {
    const on = this.on(),
      all = GROWTH_360_SOURCES.map((s, k) => ({
        k,
        color: s[1],
        on: on.has(k),
        pts: pts((i) => (R * GROWTH_360[i].v[k]) / 100),
        dots: GROWTH_360.map((c, i) => pt(i, (R * c.v[k]) / 100).map((v) => v.toFixed(1))),
      }));
    return [...all.filter((s) => !s.on), ...all.filter((s) => s.on)];
  });
  protected readonly labels = GROWTH_360.map((c, i) => {
    const p = pt(i, R + 26),
      cos = Math.cos(ang(i)),
      an = Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end',
      w = c.name.split(' '),
      half = Math.ceil(w.length / 2),
      l1 = w.length > 2 ? w.slice(0, half).join(' ') : c.name,
      l2 = w.length > 2 ? w.slice(half).join(' ') : '';
    return { x: p[0].toFixed(1), y: (p[1] - (l2 ? 7 : 0)).toFixed(1), an, l1, l2 };
  });
  /** прозрачные секторы для наведения */
  protected readonly zones = GROWTH_360.map((_, i) => {
    const a1 = -Math.PI / 2 + ((i - 0.5) * 2 * Math.PI) / N,
      a2 = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / N,
      r = R + 34;
    return `${CX},${CY} ${(CX + r * Math.cos(a1)).toFixed(1)},${(CY + r * Math.sin(a1)).toFixed(1)} ${(CX + r * Math.cos(a2)).toFixed(1)},${(CY + r * Math.sin(a2)).toFixed(1)}`;
  });
  protected readonly tip = signal<{ i: number; x: number; y: number } | null>(null);
  protected readonly tipRow = computed(() => {
    const t = this.tip();
    if (!t) return null;
    const c = GROWTH_360[t.i];
    return { ...t, c, gap: growthGap(c) };
  });

  protected move(e: MouseEvent, i: number): void {
    const r = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    this.tip.set({ i, x: Math.min(Math.max(e.clientX - r.left + 14, 8), r.width - 264), y: Math.max(e.clientY - r.top - 10, 8) });
  }
}
