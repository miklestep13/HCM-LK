import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { POLL_QICON, POLL_QNAME } from '../../../data/polls.data';
import { PollQStat } from '../../../interface/poll-stats';
import { BarItem, ChartBars } from '../../../shared/ui/chart/chart-bars';
import { ChartCols } from '../../../shared/ui/chart/chart-cols';
import { ChartDonut, DonutSeg } from '../../../shared/ui/chart/chart-donut';
import { ChartStack } from '../../../shared/ui/chart/chart-stack';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { PollstatsState } from '../pollstats.state';

/**
 * Детализация вопроса: выбор вопроса (список с иконками типов, ← →), плитки (ответили, пропустили, у теста — доля верных,
 * у шкал — среднее, у текста — уникальных) и распределение по типу:
 * единичный выбор, список, «Да / Нет» — кольцо и полосы (верный вариант отмечен); множественный — доля выбравших и ответы «Другое»;
 * рейтинг, ползунок, дата — столбцы; eNPS — индекс, критики / нейтральные / промоутеры; матрица — полоса долей по каждому утверждению;
 * ранжирование — средняя позиция и доля первых мест; текст — частые ответы и список с поиском; файлы — список.
 */
@Component({
  selector: '[pollstats-answer]',
  imports: [ChartBars, ChartCols, ChartDonut, ChartStack, Icon, Select, NgTemplateOutlet],
  template: `
    @let x = cur();
    <div class="c psans">
      <div class="ch psansh">
        <span class="pnhico"><app-icon [name]="qicon[x.q.t]" /></span>
        <h3>Вопрос {{ x.num }}</h3>
        <span class="bdg">{{ qname[x.q.t] }}</span>
        <span class="psnav">
          <button class="ib" title="Предыдущий вопрос" [disabled]="s.qi() === 0" (click)="s.qi.set(s.qi() - 1)"><app-icon name="pgPrev" /></button>
          <app-select class="psqsel" [options]="labels()" [icons]="icons()" [search]="true" [value]="labels()[s.qi()]" (valueChange)="pick($event)" />
          <button class="ib" title="Следующий вопрос" [disabled]="s.qi() >= list().length - 1" (click)="s.qi.set(s.qi() + 1)"><app-icon name="pgNext" /></button>
        </span>
      </div>
      <div class="cb">
        <p class="psqq">{{ x.q.n }}@if (x.q.req) {<span class="psreq">*</span>}</p>
        @if (x.q.d) {
          <p class="pshint">{{ x.q.d }}</p>
        }
        <div class="pskpi">
          <div class="rst"><div class="l">Ответили</div><div class="v">{{ x.answered }}</div><div class="d">{{ pct(x.answered, s.done().length) }}% завершивших</div></div>
          <div class="rst"><div class="l">Пропустили</div><div class="v">{{ x.skipped }}</div><div class="d">{{ x.q.req ? 'обязательный вопрос' : 'необязательный вопрос' }}</div></div>
          @if (x.right != null) {
            <div class="rst"><div class="l">Доля верных</div><div class="v" [class.rd]="x.right < 50">{{ x.right }}%</div><div class="d">{{ x.right >= 80 ? 'вопрос понятен' : x.right < 50 ? 'стоит разобрать с сотрудниками' : 'средний уровень' }}</div></div>
          }
          @if (x.avg != null) {
            <div class="rst"><div class="l">Среднее</div><div class="v">{{ fmt(x.avg) }}{{ x.q.t === 'slider' && x.q.unit ? ' ' + x.q.unit : '' }}</div><div class="d">{{ scaleText(x) }}</div></div>
          }
          @if (x.q.t === 'enps') {
            <div class="rst"><div class="l">Индекс eNPS</div><div class="v" [class.rd]="enps().idx < 0">{{ enps().idx > 0 ? '+' : '' }}{{ enps().idx }}</div><div class="d">% промоутеров − % критиков</div></div>
          }
          @if (x.texts && (x.q.t === 'short' || x.q.t === 'long')) {
            <div class="rst"><div class="l">Уникальных ответов</div><div class="v">{{ uniq().length }}</div><div class="d">из {{ x.texts.length }} в выборке</div></div>
          }
          @if (x.q.t === 'file') {
            <div class="rst"><div class="l">Файлов</div><div class="v">{{ x.texts?.length || 0 }}</div><div class="d">приложили участники</div></div>
          }
        </div>

        @switch (x.q.t) {
          @case ('multi') {
            <div class="pssub">Сколько участников выбрали вариант <small>можно выбрать несколько</small></div>
            <app-chart-bars [items]="bars(true)" [max]="100" suffix="%" />
            <ng-container *ngTemplateOutlet="other" />
          }
          @case ('rating') {
            <div class="pssub">Распределение оценок</div>
            <app-chart-cols [data]="x.dist" unit="ответов" />
            @if (x.q.lo || x.q.hi) {
              <div class="sclh"><span>{{ x.q.lo }}</span><span>{{ x.q.hi }}</span></div>
            }
          }
          @case ('enps') {
            <div class="pssub">Критики, нейтральные, промоутеры</div>
            <app-chart-stack [segs]="enps().segs" />
            <div class="pssub">Распределение оценок</div>
            <app-chart-cols [data]="x.dist" [tones]="npsTones" unit="ответов" />
          }
          @case ('slider') {
            <div class="pssub">Распределение значений{{ x.q.unit ? ', ' + x.q.unit : '' }}</div>
            <app-chart-cols [data]="x.dist" unit="ответов" />
          }
          @case ('date') {
            <div class="pssub">Распределение по месяцам</div>
            <app-chart-cols [data]="x.dist" unit="ответов" />
          }
          @case ('matrix') {
            <div class="pssub">Ответы по утверждениям</div>
            <div class="psmx">
              @for (r of x.rows!; track r[0]) {
                <div class="psmxr"><span>{{ r[0] }}</span><app-chart-stack [segs]="matrixSegs(r[1])" [compact]="true" /></div>
              }
            </div>
            <div class="chart-stack"><div class="chsl">
              @for (o of x.q.opts; track $index; let i = $index) {
                <span><i [class]="mcls(i)"></i>{{ o }}</span>
              }
            </div></div>
          }
          @case ('rank') {
            <div class="pssub">Порядок по ответам <small>средняя позиция, меньше — важнее</small></div>
            <div class="psrk">
              @for (r of x.rank!; track r[0]; let i = $index) {
                <div class="psrki">
                  <b>{{ i + 1 }}</b>
                  <span>{{ r[0] }}@if (s.test() && x.q.opts.indexOf(r[0]) === i) {<em class="chok">верная позиция</em>}</span>
                  <small>ср. место {{ fmt(r[1]) }}</small>
                  <span class="chbt"><i [style.width.%]="r[2]"></i></span>
                  <small>первое место — {{ r[2] }}%</small>
                </div>
              }
            </div>
          }
          @case ('short') {
            <ng-container *ngTemplateOutlet="texts" />
          }
          @case ('long') {
            <ng-container *ngTemplateOutlet="texts" />
          }
          @case ('file') {
            <div class="pssub">Файлы участников</div>
            <div class="psfiles">
              @for (f of x.texts; track $index) {
                <span class="psfile"><app-icon name="fileDoc" />{{ f }}</span>
              }
            </div>
          }
          @default {
            <!-- единичный выбор, выпадающий список, «Да / Нет» -->
            <div class="psdist">
              <app-chart-donut [segs]="donut()" [center]="x.answered + ''" centerSub="ответов" />
              <div><app-chart-bars [items]="bars(false)" [max]="100" suffix="%" /></div>
            </div>
            <ng-container *ngTemplateOutlet="other" />
          }
        }
      </div>
    </div>

    <ng-template #other>
      @if (x.texts?.length && x.q.other) {
        <div class="pssub">Ответы «Другое»</div>
        <div class="pstexts">
          @for (t of x.texts; track $index) {
            <span>{{ t }}</span>
          }
        </div>
      }
    </ng-template>
    <ng-template #texts>
      <div class="psgrid psgridt">
        <div>
          <div class="pssub">Частые ответы</div>
          <app-chart-bars [items]="top()" />
        </div>
        <div>
          <div class="pssub">Все ответы</div>
          <input class="fin psq" placeholder="Поиск по ответам" [value]="tq()" (input)="tq.set($any($event.target).value)" />
          <div class="pstexts col">
            @for (t of shown(); track $index) {
              <span>{{ t }}</span>
            } @empty {
              <small class="gr">Ничего не нашли</small>
            }
          </div>
        </div>
      </div>
    </ng-template>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollstatsAnswer {
  protected readonly s = inject(PollstatsState);
  protected readonly qname = POLL_QNAME;
  protected readonly qicon = POLL_QICON;
  protected readonly npsTones = Array.from({ length: 11 }, (_, i) => (i <= 6 ? 'dg' : i <= 8 ? 'mute' : 'ok'));
  protected readonly tq = signal('');
  protected readonly list = computed(() => this.s.stats()!.questions);
  protected readonly cur = computed(() => this.list()[Math.min(this.s.qi(), this.list().length - 1)]);
  protected readonly labels = computed(() => this.list().map((x) => x.num + ' · ' + x.q.n));
  protected readonly icons = computed(() => Object.fromEntries(this.list().map((x, i) => [this.labels()[i], POLL_QICON[x.q.t]])));

  protected pick(l: string): void {
    const i = this.labels().indexOf(l);
    if (i >= 0) this.s.qi.set(i);
    this.tq.set('');
  }
  protected pct(a: number, b: number): number {
    return b ? Math.round((a / b) * 100) : 0;
  }
  protected fmt(n: number): string {
    return String(n).replace('.', ',');
  }
  protected scaleText(x: PollQStat): string {
    if (x.q.t === 'slider') return 'от ' + (x.q.mn || 0) + ' до ' + (x.q.mx || 100);
    if (x.q.t === 'enps' || x.q.scale === 11) return 'по шкале 0–10';
    return 'по шкале 1–' + x.q.scale;
  }
  /** варианты: доля от ответивших (multi — от ответивших, сумма больше 100%) */
  protected bars(multi: boolean): BarItem[] {
    const x = this.cur(), n = x.answered || 1, ok = x.q.ok ?? [];
    return x.dist.map(([l, v], i) => ({ l, v: Math.round((v / n) * 100), sub: v + ' чел.', mark: this.s.test() && ok.includes(i), c: multi ? '' : i < 4 || x.dist.length <= 5 ? 's' + (i + 1) : 'mute' }));
  }
  protected readonly donut = computed<DonutSeg[]>(() => this.cur().dist.map(([l, v]) => ({ l, v })));
  protected readonly enps = computed(() => {
    const d = this.cur().dist, n = d.reduce((a, x) => a + x[1], 0) || 1;
    const crit = d.filter((x) => +x[0] <= 6).reduce((a, x) => a + x[1], 0);
    const neu = d.filter((x) => +x[0] === 7 || +x[0] === 8).reduce((a, x) => a + x[1], 0);
    const pro = d.filter((x) => +x[0] >= 9).reduce((a, x) => a + x[1], 0);
    return {
      idx: Math.round(((pro - crit) / n) * 100),
      segs: [
        { l: 'Критики 0–6', v: crit, c: 'dg' },
        { l: 'Нейтральные 7–8', v: neu, c: 'mute' },
        { l: 'Промоутеры 9–10', v: pro, c: 'ok' },
      ] as DonutSeg[],
    };
  });
  /** матрица: 5 столбцов — расходящаяся шкала (несогласие → согласие), иначе — категориальные цвета */
  protected mcls(i: number): string {
    const n = this.cur().q.opts.length;
    return n === 5 ? 'd' + (i + 1) : n === 3 ? ['s4', 'd3', 's5'][i] : 's' + ((i % 5) + 1);
  }
  protected matrixSegs(c: number[]): DonutSeg[] {
    return this.cur().q.opts.map((l, i) => ({ l, v: c[i], c: this.mcls(i) }));
  }
  protected readonly uniq = computed(() => [...new Set(this.cur().texts ?? [])]);
  protected readonly top = computed<BarItem[]>(() => {
    const m = new Map<string, number>();
    (this.cur().texts ?? []).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1));
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([l, v]) => ({ l, v, sub: 'раз' }));
  });
  protected readonly shown = computed(() => {
    const q = this.tq().trim().toLowerCase();
    return (this.cur().texts ?? []).filter((t) => !q || t.toLowerCase().includes(q));
  });
}
