import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal } from '@angular/core';
import { IprDemoStatus, IprStore } from '../../core/demo/ipr-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { ADAPT_PEOPLE } from '../../data/adapt.data';
import { shortFio } from '../../data/org.data';
import { MemberField } from '../../interface/member';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { IprTaskAct } from '../../widgets/ipr-task-card/ipr-task-card';
import { Members } from '../../widgets/members/members';
import { IprAgree } from '../ipr/ipr-agree/ipr-agree';
import { IprChat } from '../ipr/ipr-chat/ipr-chat';
import { IprComment } from '../ipr/ipr-comment/ipr-comment';
import { IprIsland, IprIslandAct } from '../ipr/ipr-island/ipr-island';
import { IprNew } from '../ipr/ipr-new/ipr-new';
import { IprTaskRun } from '../ipr/ipr-task-run/ipr-task-run';
import { AdaptBanner } from './adapt-banner/adapt-banner';
import { AdaptEmpty } from './adapt-empty/adapt-empty';
import { AdaptGoals } from './adapt-goals/adapt-goals';
import { AdaptHead } from './adapt-head/adapt-head';
import { AdaptParams } from './adapt-params/adapt-params';
import { AdaptStore } from './adapt-store';
import { AdaptTaskForm } from './adapt-task-form/adapt-task-form';
import { AdaptTasks } from './adapt-tasks/adapt-tasks';

interface CommentAsk {
  title: string;
  hint: string;
  ok: string;
  done: () => void;
}

const STATUSES: { value: IprDemoStatus; label: string }[] = [
  { value: 'none', label: 'Нет плана' },
  { value: 'Черновик', label: 'Создан' },
  { value: 'Предложено', label: 'На согласовании' },
  { value: 'Утверждено', label: 'В процессе' },
  { value: 'Выполнено', label: 'Выполнено' },
  { value: 'Выполнено частично', label: 'Выполнено частично' },
  { value: 'Не выполнено', label: 'Не пройден' },
];

/**
 * План адаптации новичка.
 * «Мой кабинет → Аттестация → Адаптация» — вид сотрудника.
 * «Управление персоналом → Аттестация → Адаптации» — вид руководителя (маршрут adapt, hr).
 * Класс pg-ipr оставлен, чтобы карточки задач взяли уже готовые стили виджетов.
 */
@Component({
  selector: 'app-adapt',
  imports: [
    PageHead,
    AdaptHead,
    AdaptBanner,
    IprNew,
    AdaptTasks,
    AdaptGoals,
    IprIsland,
    AdaptEmpty,
    AdaptTaskForm,
    IprTaskRun,
    AdaptParams,
    IprChat,
    IprComment,
    IprAgree,
    Members,
  ],
  providers: [AdaptStore, { provide: IprStore, useExisting: AdaptStore }],
  template: `
    <app-page-head [title]="s.creating() ? 'Новая адаптация' : 'Адаптация'" [noBack]="true" />
    @if (s.none()) {
      <app-adapt-empty (ask)="ask()" />
    } @else {
      @if (s.creating()) {
        <div ipr-new [expErr]="expErr()"></div>
      } @else {
        <div adapt-head (edit)="params.set(true)"></div>
      }
      <div class="two73">
        <div class="ad-main">
          @if (showBanner()) {
            <div
              adapt-banner
              [tone]="passed() ? 'ok' : 'dg'"
              [title]="bannerTitle()"
              [text]="bannerText()"
              (closed)="bannerOff.set(true)"
            ></div>
          }
          <div adapt-tasks (add)="taskForm.set(-1)" (act)="onTask($event)"></div>
          @if (!s.creating()) {
            <div adapt-goals></div>
          }
        </div>
        <div class="ad-side stickR">
          <div class="c">
            <div class="ch">
              <span class="ad-ht"><h3>Участники</h3><span class="chip">{{ people.length }}</span></span>
            </div>
            <div class="cb">
              <app-members edit="none" view="cards" [fields]="fields" [people]="people" />
            </div>
          </div>
        </div>
      </div>
      @if (s.creating() || ['Черновик', 'Предложено', 'Утверждено'].includes(s.st())) {
        <div ipr-island (act)="onIsland($event)"></div>
      }
    }
    @if (taskForm() !== null) {
      <app-adapt-task-form [index]="taskForm()!" (closed)="taskForm.set(null)" />
    }
    @if (run() !== null) {
      <app-ipr-task-run [index]="run()!" (closed)="run.set(null)" />
    }
    @if (params()) {
      <app-adapt-params (closed)="params.set(false)" />
    }
    @if (chat(); as c) {
      <app-ipr-chat [index]="c.i" [why]="c.why" (closed)="chat.set(null)" />
    }
    @if (comment(); as c) {
      <app-ipr-comment [title]="c.title" [hint]="c.hint" [ok]="c.ok" (sent)="c.done()" (closed)="comment.set(null)" />
    }
    @if (agree()) {
      <app-ipr-agree (closed)="agree.set(false)" />
    }
  `,
  styleUrl: './adapt.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-adapt pg-ipr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Adapt {
  /** страница руководителя в «Управлении персоналом»; в кабинете сотрудника роли нет */
  readonly hr = input(false);
  protected readonly s = inject(AdaptStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly dev = inject(DevPanelService);
  protected readonly people = ADAPT_PEOPLE;
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role'];

  protected readonly taskForm = signal<number | null>(null);
  protected readonly run = signal<number | null>(null);
  protected readonly params = signal(false);
  protected readonly chat = signal<{ i: number; why: boolean } | null>(null);
  protected readonly comment = signal<CommentAsk | null>(null);
  protected readonly agree = signal(false);
  protected readonly expErr = signal(false);
  protected readonly bannerOff = signal(false);
  private readonly finished = computed(() => ['Выполнено', 'Выполнено частично', 'Не выполнено'].includes(this.s.st()));
  protected readonly passed = computed(() => this.s.st() === 'Выполнено');
  protected readonly showBanner = computed(() => this.finished() && !this.bannerOff());
  protected readonly bannerTitle = computed(() =>
    this.passed() ? 'Адаптация успешно пройдена' : 'Адаптация не пройдена',
  );
  protected readonly bannerText = computed(() =>
    this.passed()
      ? 'Вы выполнили все задания. Успехов в прохождении испытательного срока!'
      : 'К сожалению, вы не выполнили все задания. Для уточнения вопросов обратитесь к руководителю.',
  );
  private readonly mgr = computed(() => shortFio(this.s.plan().mgr[0]));

  constructor() {
    effect(() => this.s.arole.set(this.hr() ? 'mgr' : 'emp'));
    effect((onCleanup) => {
      onCleanup(this.dev.register({ id: 'adaptStatus', label: 'Статус адаптации', options: STATUSES, value: devValue<IprDemoStatus>(() => this.s.demoStatus(), (v) => this.s.setDemo(v)) }));
    });
    effect(() => {
      this.s.st();
      this.bannerOff.set(false);
    });
  }

  protected async onTask(e: IprTaskAct): Promise<void> {
    const t = this.s.plan().tasks[e.i];
    switch (e.a) {
      case 'open':
        return this.s.toggleOpen(e.i);
      case 'crs':
        return this.nav.go('player', { crs: e.v! });
      case 'link':
        return this.toast.show('Скоро', 'Откроется внешний ресурс: ' + e.v);
      case 'art':
        return this.nav.go('kb');
      case 'edit':
        return this.taskForm.set(e.i);
      case 'run':
        return this.run.set(e.i);
      case 'chat':
        return this.chat.set({ i: e.i, why: false });
      case 'rate':
        this.s.setRate(e.i, e.v as any);
        if (this.s.needsWhy(e.i)) this.chat.set({ i: e.i, why: true });
        return;
      case 'del':
        if (await this.confirm.ask({ title: 'Удалить задачу?', text: 'Задача **' + t.t + '** будет удалена из плана.', ok: 'Удалить', danger: true })) {
          this.s.removeTask(e.i);
          this.toast.show('Задача удалена', t.t);
        }
    }
  }

  protected onIsland(a: IprIslandAct): void {
    const go = (st: Parameters<IprStore['setStatus']>[0], title: string, text: string) => {
      this.s.setStatus(st);
      this.toast.show(title, text);
    };
    switch (a) {
      case 'newsave': {
        const err = this.s.saveNew();
        this.expErr.set(err === 'expert');
        if (err === 'emp') return this.toast.show('Новая адаптация', 'Выберите сотрудника.');
        if (err === 'expert') return this.toast.show('Новая адаптация', 'Выберите эксперта: при повышении грейда он присутствует на итоговой встрече.');
        window.scrollTo(0, 0);
        return this.toast.show('План создан', 'Черновик: проверьте задачи и отправьте план на согласование.');
      }
      case 'send':
        return go('Предложено', 'Отправлено на согласование', 'Руководитель ' + this.mgr() + ' получил план.');
      case 'approve':
        return go('Утверждено', 'План согласован', 'Сотрудник получил уведомление и может выполнять задачи.');
      case 'back':
        return this.comment.set({
          title: 'Вернуть на доработку',
          hint: 'Напишите, что нужно поправить в плане, — сотрудник увидит комментарий.',
          ok: 'Вернуть',
          done: () => go('Черновик', 'План возвращен на доработку', 'Сотрудник получил комментарий.'),
        });
      case 'finish': {
        const st = this.s.finishResult();
        const result = st === 'Выполнено' ? 'Пройден' : 'Не пройден';
        return go(st, 'Адаптация завершена', 'Итог: ' + result + '. Закрыто ' + this.s.doneN() + ' из ' + this.s.plan().tasks.length + ' задач.');
      }
    }
  }

  protected ask(): void {
    this.comment.set({
      title: 'Запрос руководителю',
      hint: 'Попросите руководителя назначить план адаптации.',
      ok: 'Отправить',
      done: () => this.toast.show('Запрос отправлен', 'Руководитель ' + this.mgr() + ' получил ваш запрос.'),
    });
  }
}
