import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IprStore, iprSortTasks } from '../../../core/demo/ipr-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { IprTask } from '../../../interface/ipr';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { IprComps } from '../../../widgets/ipr-comps/ipr-comps';
import { IprTaskAct, IprTaskCard } from '../../../widgets/ipr-task-card/ipr-task-card';
import { IprTaskForm } from '../../../widgets/ipr-task-form/ipr-task-form';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { AttncardCol } from '../attncard-col/attncard-col';

const TITLE = 'ИПР по итогам аттестации';
/** «Выполнить до» новой задачи — срок условий аттестации */
const DUE = '31.12.2026';

/**
 * «Пройдена с условиями»: задачи и компетенции ИПР по условиям аттестации — отдельными блоками под итогом.
 * Задачи — как на странице ИПР (общие виджеты): «Добавить» и карандаш открывают сайдбар задачи (widgets/ipr-task-form),
 * клик по карточке раскрывает задачу, корзина удаляет с подтверждением. Это черновик ИПР по условиям — страница ИПР не меняется.
 * Компетенции свернуты по умолчанию.
 */
@Component({
  selector: '[attncard-ipr-blocks]',
  imports: [IprTaskCard, IprTaskForm, IprComps, AttncardCol],
  template: `
    <div class="c mt ipsect afsect" [class.afcold]="s.isCold('Задачи')">
      <div class="ch">
        <button attncard-col="Задачи"></button>
        <h3>Задачи</h3>
        <span class="chip">{{ tasks().length }}</span>
        <button class="btn pri ipadd" (click)="form.set(-1)">Добавить</button>
      </div>
      <div class="cb iptcb">
        <div class="iplist ipcards">
          @for (r of list(); track r.t) {
            <div ipr-task-card [task]="r.t" [index]="r.i" status="Черновик" editable [open]="open().has(r.i)" (act)="onTask($event)"></div>
          } @empty {
            <div class="gr">Задач пока нет. Добавьте задачи, которые нужно выполнить по условиям аттестации.</div>
          }
        </div>
      </div>
    </div>
    <div ipr-comps collapsed [comps]="comps" [tasks]="tasks()" (tasksOf)="hint()"></div>
    @if (form() !== null) {
      @let fi = form()!;
      <app-ipr-task-form [task]="fi >= 0 ? tasks()[fi] : null" [due0]="due" (saved)="save(fi, $event)" (closed)="form.set(null)" />
    }
  `,
  host: { class: 'afipr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardIprBlocks {
  protected readonly s = inject(AttestStore);
  private readonly ipr = inject(IprStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly due = DUE;
  /** задачи ИПР по условиям — копия плана (не выполнены), правится здесь */
  protected readonly tasks = signal<IprTask[]>(this.ipr.plan().tasks.map((t) => ({ ...t, done: false, doneAt: undefined })));
  /** компетенции плана (без добавленных из задач) */
  protected readonly comps = (this.ipr.st() === 'Черновик' ? this.ipr.draftComps() : this.ipr.plan().comps).map((c) => ({ ...c }));
  protected readonly list = computed(() => iprSortTasks(this.tasks()));
  /** раскрытые карточки задач */
  protected readonly open = signal(new Set<number>());
  /** сайдбар задачи: индекс, -1 — новая, null — закрыт */
  protected readonly form = signal<number | null>(null);

  protected save(i: number, t: IprTask): void {
    this.tasks.update((l) => (i >= 0 ? l.map((x, k) => (k === i ? t : x)) : [...l, t]));
  }

  protected async onTask(e: IprTaskAct): Promise<void> {
    const t = this.tasks()[e.i];
    switch (e.a) {
      case 'open': {
        const o = new Set(this.open());
        o.has(e.i) ? o.delete(e.i) : o.add(e.i);
        return this.open.set(o);
      }
      case 'edit':
        return this.form.set(e.i);
      case 'crs':
        return this.nav.go('player', { crs: e.v! });
      case 'art':
        return this.nav.go('kb');
      case 'link':
        return this.toast.show('Скоро', 'Откроется внешний ресурс: ' + e.v);
      case 'del':
        if (await this.confirm.ask({ title: 'Удалить задачу?', text: 'Задача **' + t.t + '** будет удалена из ИПР по условиям аттестации.', ok: 'Удалить', danger: true })) {
          this.tasks.update((l) => l.filter((_, k) => k !== e.i));
          this.open.set(new Set());
          this.toast.show('Задача удалена', t.t);
        }
        return;
      default:
        return this.hint();
    }
  }

  protected hint(text = 'Компетенции редактируются так же, как на странице ИПР.'): void {
    this.toast.show(TITLE, text);
  }
}
