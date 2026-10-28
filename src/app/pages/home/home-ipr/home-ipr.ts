import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { ListItem } from '../../../shared/ui/list-item/list-item';
import { PlanSummary } from '../../../widgets/plan-summary/plan-summary';
import { NavService } from '../../../core/navigation/nav.service';
import { IprStore, iprSortTasks, iprTaskSt } from '../../../core/demo/ipr-store.service';
import { IPR_WIDGET_TONE } from '../../../data/ipr.data';
import { Tone } from '../../../interface/common';

const TONE: Record<string, Tone> = { Просрочено: 'dg', 'В работе': 'warn', Выполнено: 'ok' };

/** Блок «ИПР»: шапка плана с прогрессом и пять ближайших задач (сначала просроченные) */
@Component({
  selector: 'app-home-ipr',
  imports: [Card, ListItem, PlanSummary],
  template: ` <app-card title="ИПР" [counter]="plan().tasks.length" open="ipr">
    <div class="hm-ipr-body">
      <app-plan-summary
        inset
        [title]="plan().name"
        [status]="s.st()"
        [statusTone]="planTone()"
        [date]="'до ' + plan().due"
        [progress]="s.progress()"
        [progressTone]="s.st() === 'Выполнено' ? 'ok' : overdue() ? 'dg' : ''"
        [caption]="'Закрыто ' + s.doneN() + ' из ' + plan().tasks.length + ' задач'"
      />
      <div class="cb" style="padding-top:0">
        @for (t of tasks(); track t.i) {
          <app-list-item
            [title]="t.t.t"
            [meta]="[{ icon: 'calendar', text: 'до ' + t.t.due, danger: t.st === 'Просрочено' }]"
            [badge]="{ text: t.st, tone: tone[t.st] }"
            link
            (click)="nav.go('ipr')"
          />
        }
      </div>
    </div>
  </app-card>`,
  styleUrl: './home-ipr.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-ipr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIpr {
  protected readonly nav = inject(NavService);
  protected readonly s = inject(IprStore);
  protected readonly plan = this.s.plan;
  protected readonly tone = TONE;
  protected readonly planTone = computed(() => IPR_WIDGET_TONE[this.s.st()] ?? '');
  protected readonly overdue = computed(() => this.plan().tasks.some((t) => iprTaskSt(t) === 'Просрочено'));
  protected readonly tasks = computed(() =>
    iprSortTasks(this.plan().tasks)
      .slice(0, 5)
      .map(({ t, i }) => ({ t, i, st: iprTaskSt(t) })),
  );
}
