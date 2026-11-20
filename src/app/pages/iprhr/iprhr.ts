import { IPR_PERIOD_END } from '../../data/ipr.data';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, signal, viewChild } from '@angular/core';
import { IprDemoStatus, IprStore } from '../../core/demo/ipr-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { shortFio } from '../../data/org.data';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { IprComps } from '../../widgets/ipr-comps/ipr-comps';
import { IprTaskAct } from '../../widgets/ipr-task-card/ipr-task-card';
import { IprAgree } from '../ipr/ipr-agree/ipr-agree';
import { IprChat } from '../ipr/ipr-chat/ipr-chat';
import { IprComment } from '../ipr/ipr-comment/ipr-comment';
import { IprEmpty } from '../ipr/ipr-empty/ipr-empty';
import { IprHead } from '../ipr/ipr-head/ipr-head';
import { IprIsland, IprIslandAct } from '../ipr/ipr-island/ipr-island';
import { IprNew } from '../ipr/ipr-new/ipr-new';
import { IprParams } from '../ipr/ipr-params/ipr-params';
import { IprTaskForm } from '../../widgets/ipr-task-form/ipr-task-form';
import { IprTasks } from '../ipr/ipr-tasks/ipr-tasks';

interface CommentAsk {
  title: string;
  hint: string;
  ok: string;
  done: () => void;
}

/** Полная статусная модель ИПР (как на /ipr), без переключателя роли */
const STATUSES: { value: IprDemoStatus; label: string }[] = [
  { value: 'new', label: 'Создание' },
  { value: 'Черновик', label: 'Черновик' },
  { value: 'Предложено', label: 'Предложено' },
  { value: 'Утверждено', label: 'Утверждено' },
  { value: 'Выполнено', label: 'Выполнено' },
  { value: 'Выполнено частично', label: 'Выполнено частично' },
  { value: 'Не выполнено', label: 'Не выполнено' },
];

/**
 * «HR → Аттестация → ИПР» (карточка плана сотрудника): та же страница, что /ipr,
 * всегда от лица руководителя — без переключателя роли и без кнопки выполнения задачи.
 */
@Component({
  selector: 'app-iprhr',
  imports: [
    PageHead,
    IprHead,
    IprNew,
    IprTasks,
    IprComps,
    IprIsland,
    IprEmpty,
    IprTaskForm,
    IprParams,
    IprChat,
    IprComment,
    IprAgree,
  ],
  template: `
    <app-page-head [title]="s.creating() ? 'Новый ИПР' : 'ИПР'" backTo="attest" backLabel="К списку ИПР">
      @if (!s.none() && !s.creating() && s.editable()) {
        <span class="objacts"><button class="btn raised" (click)="params.set(true)">Редактировать</button></span>
      }
    </app-page-head>
    @if (s.none()) {
      <app-ipr-empty (ask)="ask()" />
    } @else {
      @if (s.creating()) {
        <div ipr-new [expErr]="expErr()"></div>
      } @else {
        <div ipr-head></div>
      }
      <div ipr-tasks [canRun]="false" (add)="taskForm.set(-1)" (act)="onTask($event)"></div>
      <div ipr-comps [comps]="s.comps()" [tasks]="s.plan().tasks" [editable]="s.editable()" (tasksOf)="tasks()?.showComp($event)"></div>
      @if (s.creating() || ['Черновик', 'Предложено', 'Утверждено'].includes(s.st())) {
        <div ipr-island (act)="onIsland($event)"></div>
      }
    }
    @if (taskForm() !== null) {
      @let ti = taskForm()!;
      <app-ipr-task-form
        [task]="ti >= 0 ? s.plan().tasks[ti] : null"
        [readonly]="s.st() === 'Утверждено'"
        [due0]="due0()"
        (saved)="s.saveTask(ti, $event)"
        (closed)="taskForm.set(null)"
      />
    }
    @if (params()) {
      <app-ipr-params (closed)="params.set(false)" />
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
  styleUrl: '../ipr/ipr.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-ipr pg-iprhr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Iprhr {
  protected readonly s = inject(IprStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly dev = inject(DevPanelService);
  protected readonly tasks = viewChild(IprTasks);
  private readonly compsW = viewChild(IprComps);

  protected readonly taskForm = signal<number | null>(null);
  protected readonly due0 = computed(() => IPR_PERIOD_END[this.s.plan().per] || this.s.plan().due);
  protected readonly params = signal(false);
  protected readonly chat = signal<{ i: number; why: boolean } | null>(null);
  protected readonly comment = signal<CommentAsk | null>(null);
  protected readonly agree = signal(false);
  protected readonly expErr = signal(false);
  private readonly mgr = computed(() => shortFio(this.s.plan().mgr[0]));

  constructor() {
    // HR-карточка всегда смотрит план как руководитель
    this.s.arole.set('mgr');
    effect((onCleanup) => {
      onCleanup(
        this.dev.register({
          id: 'iprhrStatus',
          label: 'Статус ИПР',
          options: STATUSES,
          value: devValue<IprDemoStatus>(() => this.s.demoStatus(), (v) => this.s.setDemo(v)),
        }),
      );
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
      case 'comp':
        return this.compsW()?.show(e.v!);
      case 'edit':
        return this.taskForm.set(e.i);
      case 'run':
        return;
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
        if (err === 'emp') return this.toast.show('Новый ИПР', 'Выберите сотрудника.');
        if (err === 'expert') return this.toast.show('Новый ИПР', 'Выберите эксперта: при повышении грейда он присутствует на итоговой встрече.');
        window.scrollTo(0, 0);
        return this.toast.show('ИПР создан', 'Черновик: проверьте задачи и компетенции и отправьте план на согласование.');
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
      case 'finish':
        return go(this.s.finishResult(), 'План завершен', 'Закрыто ' + this.s.doneN() + ' из ' + this.s.plan().tasks.length + ' задач.');
    }
  }

  protected ask(): void {
    this.comment.set({
      title: 'Запрос руководителю',
      hint: 'Попросите руководителя назначить план: к какой роли или компетенциям хотите двигаться.',
      ok: 'Отправить',
      done: () => this.toast.show('Запрос отправлен', 'Руководитель ' + this.mgr() + ' получил ваш запрос.'),
    });
  }
}
