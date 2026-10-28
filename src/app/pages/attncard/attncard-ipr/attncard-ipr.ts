import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { IprStore, iprSortTasks, iprTaskSt } from '../../../core/demo/ipr-store.service';
import { IPR_WIDGET_TONE } from '../../../data/ipr.data';
import { Tone } from '../../../interface/common';
import { IprTask } from '../../../interface/ipr';
import { Icon } from '../../../shared/ui/icon/icon';
import { ListItem } from '../../../shared/ui/list-item/list-item';
import { PlanSummary } from '../../../widgets/plan-summary/plan-summary';
import { AttncardCol } from '../attncard-col/attncard-col';

const TONE: Record<string, Tone> = { Просрочено: 'dg', 'В работе': 'warn', Выполнено: 'ok' };

/** ИПР по итогам аттестации — как виджет «ИПР» на обзоре; «Пройден с ИПР» — план выполнен, 100% */
@Component({
  selector: '[attncard-ipr]',
  imports: [AttncardCol, Icon, PlanSummary, ListItem],
  template: `
    <div class="ch">
      <button attncard-col="ИПР"></button>
      <h3>ИПР</h3>
      <button class="ib2 hubopen" title="Открыть ИПР" aria-label="Открыть ИПР" (click)="nav.go('ipr')"><app-icon name="open" /></button>
    </div>
    <app-plan-summary
      inset
      [title]="plan().name"
      [status]="status()"
      [statusTone]="planTone()"
      [date]="'до ' + plan().due"
      [progress]="progress()"
      [progressTone]="status() === 'Выполнено' ? 'ok' : overdue() ? 'dg' : ''"
      [caption]="'Закрыто ' + done() + ' из ' + plan().tasks.length + ' задач'"
    />
    <div class="cb afiprt2">
      @for (t of tasks(); track t.i) {
        <app-list-item [title]="t.t.t" [meta]="[{ icon: 'calendar', text: 'до ' + t.t.due, danger: t.st === 'Просрочено' }]" [badge]="{ text: t.st, tone: tone[t.st] }" (click)="nav.go('ipr')" />
      }
    </div>
  `,
  host: { class: 'afsect', '[class.afcold]': 's.isCold("ИПР")' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardIpr {
  protected readonly s = inject(AttestStore);
  protected readonly nav = inject(NavService);
  private readonly ipr = inject(IprStore);
  protected readonly plan = this.ipr.plan;
  protected readonly tone = TONE;
  private readonly fin = computed(() => this.s.stage() === 'iprok');
  private readonly list = computed<IprTask[]>(() => (this.fin() ? this.plan().tasks.map((t) => ({ ...t, done: true })) : this.plan().tasks));
  protected readonly status = computed(() => (this.fin() ? 'Выполнено' : this.ipr.st()));
  protected readonly planTone = computed(() => IPR_WIDGET_TONE[this.status()] ?? '');
  protected readonly done = computed(() => this.list().filter((t) => t.done).length);
  protected readonly progress = computed(() => (this.list().length ? Math.round((this.done() / this.list().length) * 100) : 0));
  protected readonly overdue = computed(() => this.list().some((t) => iprTaskSt(t) === 'Просрочено'));
  protected readonly tasks = computed(() =>
    iprSortTasks(this.list())
      .slice(0, 5)
      .map(({ t, i }) => ({ t, i, st: iprTaskSt(t) })),
  );
}
