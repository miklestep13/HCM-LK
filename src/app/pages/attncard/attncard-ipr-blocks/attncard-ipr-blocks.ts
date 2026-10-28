import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IprStore, iprSortTasks } from '../../../core/demo/ipr-store.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { IprComps } from '../../../widgets/ipr-comps/ipr-comps';
import { IprTaskCard } from '../../../widgets/ipr-task-card/ipr-task-card';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { AttncardCol } from '../attncard-col/attncard-col';

const TITLE = 'ИПР по итогам аттестации';

/**
 * «Пройдена с условиями»: задачи и компетенции ИПР по условиям аттестации — отдельными блоками под итогом.
 * Это копия плана со страницы ИПР (задачи не выполнены), страница ИПР не меняется; действия показываются подсказкой.
 * Компетенции свернуты по умолчанию.
 */
@Component({
  selector: '[attncard-ipr-blocks]',
  imports: [IprTaskCard, IprComps, AttncardCol],
  template: `
    <div class="c mt ipsect afsect" [class.afcold]="s.isCold('Задачи')">
      <div class="ch">
        <button attncard-col="Задачи"></button>
        <h3>Задачи</h3>
        <span class="chip">{{ tasks.length }}</span>
        <button class="btn pri ipadd" (click)="hint('Задача добавится в ИПР по условиям аттестации.')">Добавить</button>
      </div>
      <div class="cb iptcb">
        <div class="iplist ipcards">
          @for (r of list; track r.i) {
            <div ipr-task-card [task]="r.t" [index]="r.i" status="Черновик" editable (act)="$event.a !== 'open' && hint()"></div>
          }
        </div>
      </div>
    </div>
    <div ipr-comps collapsed [comps]="comps" [tasks]="tasks" (tasksOf)="hint()"></div>
  `,
  host: { class: 'afipr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardIprBlocks {
  protected readonly s = inject(AttestStore);
  private readonly ipr = inject(IprStore);
  private readonly toast = inject(ToastService);
  /** копия плана: задачи не выполнены */
  protected readonly tasks = this.ipr.plan().tasks.map((t) => ({ ...t, done: false, doneAt: undefined }));
  /** компетенции плана (без добавленных из задач) */
  protected readonly comps = (this.ipr.st() === 'Черновик' ? this.ipr.draftComps() : this.ipr.plan().comps).map((c) => ({ ...c }));
  protected readonly list = iprSortTasks(this.tasks);

  protected hint(text = 'Задачи и компетенции редактируются так же, как на странице ИПР.'): void {
    this.toast.show(TITLE, text);
  }
}
