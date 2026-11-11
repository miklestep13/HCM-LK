import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { POLL_QICON, POLL_QNAME } from '../../../data/polls.data';
import { pollSections } from '../../../data/poll-stats.data';
import { BarItem, ChartBars } from '../../../shared/ui/chart/chart-bars';
import { Icon } from '../../../shared/ui/icon/icon';
import { PollstatsState } from '../pollstats.state';

/**
 * Информация по вопросам: плитки (вопросов, разделов, обязательных, у теста — средняя доля верных), распределение по типам и по разделам,
 * таблица вопросов (номер, вопрос с иконкой типа, раздел, ответили, у теста — доля верных); клик по строке — детализация ответов.
 */
@Component({
  selector: '[pollstats-questions]',
  imports: [ChartBars, Icon],
  template: `
    @let qs = s.stats()!.questions;
    <div class="pskpi">
      <div class="rst"><div class="l">Вопросов</div><div class="v">{{ qs.length }}</div><div class="d">в {{ secs().length }} {{ secs().length === 1 ? 'разделе' : 'разделах' }}</div></div>
      <div class="rst"><div class="l">Обязательных</div><div class="v">{{ req() }}</div><div class="d">{{ qs.length - req() }} необязательных</div></div>
      <div class="rst"><div class="l">Ответов в среднем</div><div class="v">{{ answeredPct() }}%</div><div class="d">от завершивших</div></div>
      @if (s.test()) {
        <div class="rst"><div class="l">Доля верных ответов</div><div class="v" [class.rd]="rightAvg() < s.pass()">{{ rightAvg() }}%</div><div class="d">по вопросам с верным ответом</div></div>
      } @else {
        <div class="rst"><div class="l">Открытых вопросов</div><div class="v">{{ open() }}</div><div class="d">текст и файлы</div></div>
      }
    </div>
    <div class="psgrid">
      <div class="c">
        <div class="ch"><h3>Распределение по типам</h3></div>
        <div class="cb"><app-chart-bars [items]="types()" suffix="" /></div>
      </div>
      <div class="c">
        <div class="ch"><h3>Распределение по разделам</h3></div>
        <div class="cb"><app-chart-bars [items]="secs()" /></div>
      </div>
    </div>
    <div class="c">
      <div class="ch"><h3>Вопросы</h3><span class="pshint">нажмите на вопрос, чтобы посмотреть ответы</span></div>
      <div class="cb">
        <div class="tw">
          <table class="tbl rtbl pstbl psqtbl">
            <thead>
              <tr>
                <th style="width: 64px">№</th>
                <th>Вопрос</th>
                <th style="width: 200px">Тип</th>
                <th style="width: 200px">Раздел</th>
                <th style="width: 150px">Ответили</th>
                @if (s.test()) {
                  <th style="width: 150px">Доля верных</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (x of qs; track x.num; let i = $index) {
                <tr (click)="s.showQ(i)">
                  <td class="gr">{{ x.num }}</td>
                  <td><b class="psqt">{{ x.q.n }}</b>@if (x.q.req) {<span class="psreq">*</span>}</td>
                  <td><span class="psty"><app-icon [name]="qicon[x.q.t]" />{{ qname[x.q.t] }}</span></td>
                  <td class="gr">{{ x.sec }}</td>
                  <td>{{ x.answered }}<small class="gr"> · {{ pct(x.answered) }}%</small></td>
                  @if (s.test()) {
                    <td>@if (x.right != null) {<b [class.dgt]="x.right < 50" [class.okt]="x.right >= 80">{{ x.right }}%</b>} @else {<span class="gr">—</span>}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollstatsQuestions {
  protected readonly s = inject(PollstatsState);
  protected readonly qname = POLL_QNAME;
  protected readonly qicon = POLL_QICON;
  private readonly qs = computed(() => this.s.stats()!.questions);
  protected readonly req = computed(() => this.qs().filter((x) => x.q.req).length);
  protected readonly open = computed(() => this.qs().filter((x) => ['short', 'long', 'file'].includes(x.q.t)).length);
  protected pct(n: number): number {
    const d = this.s.done().length;
    return d ? Math.round((n / d) * 100) : 0;
  }
  protected readonly answeredPct = computed(() => {
    const q = this.qs();
    return q.length ? Math.round(q.reduce((a, x) => a + this.pct(x.answered), 0) / q.length) : 0;
  });
  protected readonly rightAvg = computed(() => {
    const r = this.qs().filter((x) => x.right != null);
    return r.length ? Math.round(r.reduce((a, x) => a + x.right!, 0) / r.length) : 0;
  });
  protected readonly types = computed<BarItem[]>(() => {
    const m = new Map<string, number>();
    this.qs().forEach((x) => m.set(this.qname[x.q.t], (m.get(this.qname[x.q.t]) ?? 0) + 1));
    return [...m].sort((a, b) => b[1] - a[1]).map(([l, v]) => ({ l, v }));
  });
  protected readonly secs = computed<BarItem[]>(() => pollSections(this.s.poll()!).map((x) => ({ l: x.name, v: x.q.length })));
}
