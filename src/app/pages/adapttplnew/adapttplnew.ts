import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, signal, untracked } from '@angular/core';
import { IprStore } from '../../core/demo/ipr-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { IprTaskAct } from '../../widgets/ipr-task-card/ipr-task-card';
import { AdaptGoals } from '../adapt/adapt-goals/adapt-goals';
import { AdaptStageForm } from '../adapt/adapt-stage-form/adapt-stage-form';
import { AdaptStore } from '../adapt/adapt-store';
import { AdaptTaskForm } from '../adapt/adapt-task-form/adapt-task-form';
import { AdaptTasks } from '../adapt/adapt-tasks/adapt-tasks';
import { AdapttplnewInfo } from './adapttplnew-info/adapttplnew-info';
import { AdapttplnewState } from './adapttplnew.state';

type Demo = 'empty' | 'filled';

/**
 * «Управление персоналом → Адаптация → Шаблоны плана адаптации → Добавить»
 * (pg-adapttplnew): основная информация, задачи и цели; демо empty|filled (?demo=… / панель «Демо»).
 */
@Component({
  selector: 'app-adapttplnew',
  imports: [PageHead, AdapttplnewInfo, AdaptTasks, AdaptGoals, AdaptTaskForm, AdaptStageForm],
  providers: [AdapttplnewState, AdaptStore, { provide: IprStore, useExisting: AdaptStore }],
  template: `
    <app-page-head title="Добавление шаблона плана адаптации" backTo="adapttpl" backLabel="К шаблонам" />
    <div class="atn-body">
      <div adapttplnew-info></div>
      <div adapt-tasks (add)="taskForm.set(-1)" (editStage)="stageForm.set($event)" (act)="onTask($event)"></div>
      <div adapt-goals [empty]="mode() === 'empty'"></div>
    </div>
    <div class="c ipisl">
      <div class="ipff">
        <button class="btn raised" type="button" (click)="form.cancel()">Отмена</button>
        <button class="btn pri" type="button" (click)="form.save()">Сохранить</button>
      </div>
    </div>
    @if (taskForm() !== null) {
      <app-adapt-task-form [index]="taskForm()!" (closed)="taskForm.set(null)" />
    }
    @if (stageForm() !== null) {
      <app-adapt-stage-form [index]="stageForm()!" (closed)="stageForm.set(null)" />
    }
  `,
  styleUrls: ['../adapt/adapt.scss', './adapttplnew.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-adapttplnew pg-adapt pg-ipr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Adapttplnew {
  /** параметр адреса: empty | filled (по умолчанию filled); сегмент в шапке убран — переключение через ?demo= / панель «Демо» */
  readonly demo = input<string>('filled');
  protected readonly form = inject(AdapttplnewState);
  private readonly s = inject(AdaptStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly dev = inject(DevPanelService);
  protected readonly taskForm = signal<number | null>(null);
  protected readonly stageForm = signal<number | null>(null);
  protected readonly mode = signal<Demo>('filled');

  constructor() {
    this.s.arole.set('mgr');
    this.s.none.set(false);
    effect(() => {
      const v: Demo = this.demo() === 'empty' ? 'empty' : 'filled';
      untracked(() => this.apply(v));
    });
    effect((onCleanup) => {
      onCleanup(
        this.dev.register({
          id: 'adapttplDemo',
          label: 'Шаблон плана',
          options: [
            { value: 'filled', label: 'Заполненный' },
            { value: 'empty', label: 'Пустой' },
          ],
          value: devValue<Demo>(
            () => this.mode(),
            (v) => this.setDemo(v),
          ),
        }),
      );
    });
  }

  /** панель «Демо» — пишем в адрес, effect подхватит */
  protected setDemo(v: Demo): void {
    this.nav.go('adapttplnew', v === 'filled' ? {} : { demo: v });
  }

  private apply(v: Demo): void {
    this.mode.set(v);
    this.s.loadTplDemo(v);
    this.s.status.set('Черновик');
    this.taskForm.set(null);
    this.stageForm.set(null);
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
      case 'del':
        if (await this.confirm.ask({ title: 'Удалить задачу?', text: 'Задача **' + t.t + '** будет удалена из шаблона.', ok: 'Удалить', danger: true })) {
          this.s.removeTask(e.i);
          this.toast.show('Задача удалена', t.t);
        }
    }
  }
}
