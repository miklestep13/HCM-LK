import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { IprStore } from '../../core/demo/ipr-store.service';
import { LearnStore } from '../../core/demo/learn-store.service';
import { COMMUNITIES, COMM_POOL } from '../../data/comm.data';
import { EVENT_GROUPS } from '../../data/events.data';
import { NEWS } from '../../data/news.data';
import { EMPLOYEES } from '../../data/people.data';
import { PRODUCT_CHAT } from '../../data/shop.data';
import { WIDGETS, WIDGET_ACTIONS, WIDGET_BUSY, WIDGET_PEOPLE, WIDGET_PLAN, WIDGET_ROLES, WIDGET_EVENT } from '../../data/widgets.data';
import { Member } from '../../interface/member';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { BusyChart } from '../../widgets/busy-chart/busy-chart';
import { CommCover } from '../../widgets/comm-cover/comm-cover';
import { CommentItem, Comments } from '../../widgets/comments/comments';
import { CoverUpload } from '../../widgets/cover-upload/cover-upload';
import { EmployeeCard } from '../../widgets/employee-card/employee-card';
import { Events } from '../../widgets/events/events';
import { IprComps } from '../../widgets/ipr-comps/ipr-comps';
import { IprTaskCard } from '../../widgets/ipr-task-card/ipr-task-card';
import { LearnActionButton } from '../../widgets/learn-action/learn-action';
import { LearnCard } from '../../widgets/learn-card/learn-card';
import { Members } from '../../widgets/members/members';
import { NewsPost } from '../../widgets/news-post/news-post';
import { PlanSummary } from '../../widgets/plan-summary/plan-summary';
import { Poll } from '../../widgets/poll/poll';
import { PplCard } from '../../widgets/ppl-card/ppl-card';
import { EventHead } from '../../widgets/event-head/event-head';
import { WalletSendService } from '../../widgets/wallet-send/wallet-send.service';

/**
 * «Профиль → Виджеты»: витрина общих виджетов (src/app/widgets) — у каждого название, папка, как подключить,
 * где используется и живой пример на демо-данных. Новый виджет — добавить в WIDGETS (data/widgets.data.ts) и пример в @switch.
 */
@Component({
  selector: 'app-widgets',
  imports: [
    PageHead,
    PlanSummary,
    EmployeeCard,
    NewsPost,
    CommCover,
    LearnCard,
    LearnActionButton,
    Events,
    Poll,
    Comments,
    Members,
    PplCard,
    EventHead,
    CoverUpload,
    IprTaskCard,
    IprComps,
    BusyChart,
  ],
  template: `
    <app-page-head title="Виджеты" [noBack]="true" />
    <div class="c mb wgnav">
      @for (w of list; track w.key) {
        <a class="chip" (click)="go(w.key)">{{ w.title }}</a>
      }
    </div>
    @for (w of list; track w.key) {
      <section class="wgs" [id]="'wg-' + w.key">
        <div class="c mb wgi">
          <div class="wgh">
            <h3>{{ w.title }}</h3>
            <code class="wgk">widgets/{{ w.key }}</code>
          </div>
          <p class="wgd">{{ w.desc }}</p>
          <code class="wgu">{{ w.use }}</code>
          <div class="wgp"><span class="gr">Где используется:</span> {{ w.pages.join(' · ') }}</div>
        </div>
        <div class="wgx">
          @switch (w.key) {
            @case ('plan-summary') {
              <div class="c wgbox">
                <app-plan-summary [title]="plan.title" [status]="plan.status" statusTone="info" [date]="plan.date" [progress]="plan.progress" [caption]="plan.caption" />
              </div>
            }
            @case ('employee-card') {
              <div class="wgrow">
                @for (e of emps; track $index) {
                  <app-employee-card [card]="e" />
                }
              </div>
            }
            @case ('news-post') {
              <div class="wgw">
                <app-news-post [post]="news" />
              </div>
            }
            @case ('comm-cover') {
              <div class="wgrow">
                @for (c of comms; track c.id) {
                  <div class="wgcov" app-comm-cover [comm]="c"></div>
                }
              </div>
            }
            @case ('learn-card') {
              <div class="vgrid wgrow3">
                @if (crs(); as c) {
                  <div learn-card [card]="c" kind="crs"></div>
                }
                @if (prog(); as c) {
                  <div learn-card [card]="c" kind="prog"></div>
                }
                @if (ev(); as c) {
                  <div learn-card [card]="c" kind="ev"></div>
                }
              </div>
            }
            @case ('learn-action') {
              <div class="c wgbox wgacts">
                @for (a of actions; track $index) {
                  <div learn-action [action]="a" (act)="toast.show('Действие', $event)"></div>
                }
              </div>
            }
            @case ('events') {
              <div class="wgw"><div class="c" app-events></div></div>
            }
            @case ('poll') {
              <div class="wgw"><div class="c"><app-poll class="cb" /></div></div>
            }
            @case ('comments') {
              <div class="c wgbox">
                <app-comments [items]="chat()" (send)="send($event)" (like)="todo()" (remove)="todo()" (todo)="todo()" />
              </div>
            }
            @case ('members') {
              <div class="c wgbox">
                <app-members [(people)]="people" view="both" [roles]="roles" />
              </div>
            }
            @case ('event-head') {
              <div event-head [title]="evh.title" [status]="evh.status" [when]="evh.when" [dur]="evh.dur" [place]="evh.place" [desc]="evh.desc" [invited]="evh.invited"></div>
            }
            @case ('ppl-card') {
              <div ppl-card [(people)]="ppl" [roles]="roles" [pool]="pool"></div>
              <div ppl-card ro title="Участники · просмотр" [people]="ppl()" [roles]="roles" [pool]="pool"></div>
            }
            @case ('cover-upload') {
              <div class="c wgbox wgw"><div cover-upload [(value)]="cover"></div></div>
            }
            @case ('busy-chart') {
              <div class="c" busy-chart [(people)]="people" [pool]="busyPool" [roles]="roles" [date]="busyAt.date" [t1]="busyT().t1" [t2]="busyT().t2" (move)="busyT.set($event)"></div>
            }
            @case ('ipr-task-card') {
              <div class="afipr wgbox c"><div class="iplist ipcards">
                @for (t of ipr.plan().tasks.slice(0, 2); track $index) {
                  <div ipr-task-card [task]="t" [index]="$index" [status]="ipr.st()" [open]="open() === $index" (act)="$event.a === 'open' ? open.set(open() === $index ? -1 : $index) : todo()"></div>
                }
              </div></div>
            }
            @case ('ipr-comps') {
              <div class="afipr"><div ipr-comps [comps]="ipr.comps()" [tasks]="ipr.plan().tasks" (tasksOf)="todo()"></div></div>
            }
            @case ('wallet-send') {
              <div class="c wgbox"><button class="btn pri" (click)="wallet.open()">Перечислить валюту</button></div>
            }
          }
        </div>
      </section>
    }
  `,
  styleUrl: './widgets.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-widgets' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Widgets {
  protected readonly toast = inject(ToastService);
  protected readonly wallet = inject(WalletSendService);
  protected readonly ipr = inject(IprStore);
  private readonly learn = inject(LearnStore);

  protected readonly list = WIDGETS;
  protected readonly plan = WIDGET_PLAN;
  protected readonly actions = WIDGET_ACTIONS;
  protected readonly roles = WIDGET_ROLES;
  protected readonly pool = WIDGET_PEOPLE;
  protected readonly evh = WIDGET_EVENT;
  protected readonly emps = EMPLOYEES.slice(0, 3);
  protected readonly news = NEWS[0];
  protected readonly comms = COMMUNITIES.slice(0, 3);
  protected readonly crs = computed(() => this.learn.my().crs[0]);
  protected readonly prog = computed(() => this.learn.my().prog[0]);
  protected readonly ev = computed(() => this.learn.my().ev[0]);
  protected readonly people = signal<Member[]>(WIDGET_PEOPLE.map((m) => ({ ...m })));
  protected readonly ppl = signal<Member[]>(WIDGET_PEOPLE.slice(0, 2).map((m) => ({ ...m })));
  protected readonly cover = signal<string | null>(null);
  protected readonly busyAt = WIDGET_BUSY;
  protected readonly busyPool = [...COMM_POOL, ...EVENT_GROUPS];
  protected readonly busyT = signal({ t1: WIDGET_BUSY.t1, t2: WIDGET_BUSY.t2 });
  protected readonly open = signal(-1);
  protected readonly chat = signal<CommentItem[]>(
    Object.values(PRODUCT_CHAT)[0].map((m) => ({ av: m[0], author: m[1], date: m[2], text: m[3], likes: m[5] || 0, liked: !!m[6], mine: false })),
  );

  protected go(key: string): void {
    document.getElementById('wg-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  protected send(t: string): void {
    if (!t) return;
    this.chat.update((l) => [...l, { av: 0, author: 'Вы', date: 'сейчас', text: t, likes: 0, liked: false, mine: true }]);
  }
  protected todo(): void {
    this.toast.show('Витрина виджетов', 'Действие работает на страницах, где стоит виджет.');
  }
}
