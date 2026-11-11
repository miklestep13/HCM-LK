import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BarItem, ChartBars } from '../../../shared/ui/chart/chart-bars';
import { ChartCols } from '../../../shared/ui/chart/chart-cols';
import { ChartDonut, DonutSeg } from '../../../shared/ui/chart/chart-donut';
import { ChartLine } from '../../../shared/ui/chart/chart-line';
import { ChartStack } from '../../../shared/ui/chart/chart-stack';
import { PollstatsState } from '../pollstats.state';

/**
 * Сводка по участникам: плитки (участников, завершили, средний результат или время, попыток), динамика прохождения (линия),
 * вовлеченность (ожидает / в работе / завершен), этапы прохождения (воронка), результаты (тест — сдали / не сдали и распределение баллов,
 * опрос — время прохождения), лучшие подразделения (тест — по среднему баллу, опрос — по доле завершивших).
 */
@Component({
  selector: '[pollstats-summary]',
  imports: [ChartLine, ChartStack, ChartBars, ChartDonut, ChartCols],
  template: `
    @let st = s.stats()!;
    <div class="pskpi">
      <div class="rst"><div class="l">Участников</div><div class="v">{{ st.parts.length }}</div><div class="d">назначено</div></div>
      <div class="rst"><div class="l">Завершили</div><div class="v">{{ s.done().length }}</div><div class="d">{{ pct(s.done().length, st.parts.length) }}% участников</div></div>
      @if (s.test()) {
        <div class="rst"><div class="l">Средний результат</div><div class="v" [class.rd]="s.avgScore() < s.pass()">{{ s.avgScore() }}%</div><div class="d">проходной — {{ s.pass() }}%</div></div>
        <div class="rst"><div class="l">Среднее число попыток</div><div class="v">{{ fmt(s.avgTries()) }}</div><div class="d">из 3 доступных</div></div>
      } @else {
        <div class="rst"><div class="l">Среднее время</div><div class="v">{{ s.avgMin() }} мин</div><div class="d">на прохождение</div></div>
        <div class="rst"><div class="l">Не начали</div><div class="v">{{ waiting() }}</div><div class="d">{{ pct(waiting(), st.parts.length) }}% участников</div></div>
      }
    </div>

    <div class="c psdyn">
      <div class="ch"><h3>Динамика прохождения</h3><span class="pshint">завершили нарастающим итогом</span></div>
      <div class="cb"><app-chart-line [data]="st.days" unit="завершили" /></div>
    </div>
    <div class="psgrid">
      <div class="pscol">
        <div class="c">
          <div class="ch"><h3>Вовлеченность</h3></div>
          <div class="cb"><app-chart-stack [segs]="engage()" /></div>
          <div class="ch psch2"><h3>Этапы прохождения</h3></div>
          <div class="cb"><app-chart-bars [items]="funnel()" [max]="st.parts.length" /></div>
        </div>
        <div class="c">
          <div class="ch"><h3>Лучшие подразделения</h3><span class="pshint">{{ s.test() ? 'по среднему баллу' : 'по доле завершивших' }}</span></div>
          <div class="cb"><app-chart-bars [items]="deps()" [max]="100" suffix="%" /></div>
        </div>
      </div>
      <div class="c">
        <div class="ch"><h3>{{ s.test() ? 'Результаты прохождения' : 'Время прохождения' }}</h3></div>
        <div class="cb">
          @if (s.test()) {
            <app-chart-donut [segs]="result()" [center]="pct(s.passed(), s.done().length) + '%'" centerSub="сдали" />
            <div class="pssub">Распределение баллов</div>
            <app-chart-cols [data]="scores()" [tones]="scoreTones()" unit="чел." />
          } @else {
            <app-chart-cols [data]="minutes()" unit="чел." />
          }
        </div>
      </div>
    </div>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollstatsSummary {
  protected readonly s = inject(PollstatsState);
  protected pct(a: number, b: number): number {
    return b ? Math.round((a / b) * 100) : 0;
  }
  protected fmt(n: number): string {
    return String(n).replace('.', ',');
  }
  protected readonly waiting = computed(() => this.s.stats()!.parts.filter((p) => p.st === 'Ожидает').length);
  protected readonly engage = computed<DonutSeg[]>(() => {
    const p = this.s.stats()!.parts;
    return [
      { l: 'Завершен', v: p.filter((x) => x.st === 'Завершен').length, c: 's1' },
      { l: 'В работе', v: p.filter((x) => x.st === 'В работе').length, c: 'd4' },
      { l: 'Ожидает', v: p.filter((x) => x.st === 'Ожидает').length, c: 'mute' },
    ];
  });
  protected readonly funnel = computed<BarItem[]>(() => {
    const f = this.s.stats()!.funnel, n = f[0][1] || 1;
    return f.map(([l, v]) => ({ l, v, sub: Math.round((v / n) * 100) + '%' }));
  });
  protected readonly result = computed<DonutSeg[]>(() => [
    { l: 'Сдали', v: this.s.passed(), c: 'ok' },
    { l: 'Не сдали', v: this.s.done().length - this.s.passed(), c: 'dg' },
  ]);
  private readonly bins: [string, number, number][] = [
    ['до 60', 0, 59],
    ['60–69', 60, 69],
    ['70–79', 70, 79],
    ['80–89', 80, 89],
    ['90–100', 90, 100],
  ];
  protected readonly scores = computed<[string, number][]>(() => this.bins.map(([l, a, b]) => [l, this.s.done().filter((p) => (p.score ?? 0) >= a && (p.score ?? 0) <= b).length]));
  /** ниже проходного — красные, выше — зеленые */
  protected readonly scoreTones = computed(() => this.bins.map(([, a]) => (a >= this.s.pass() ? 'ok' : 'dg')));
  protected readonly minutes = computed<[string, number][]>(() =>
    [
      ['до 8', 0, 8],
      ['8–11', 9, 11],
      ['12–15', 12, 15],
      ['16+', 16, 99],
    ].map(([l, a, b]) => [l as string, this.s.done().filter((p) => p.min >= +a && p.min <= +b).length]),
  );
  protected readonly deps = computed<BarItem[]>(() => this.s.stats()!.deps.slice(0, 6).map(([l, v, n]) => ({ l, v, sub: n + ' чел.' })));
}
