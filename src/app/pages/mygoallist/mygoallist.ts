import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { GOAL_STAGES } from '../../interface/goal';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { MygoallistTable } from './mygoallist-table/mygoallist-table';

/** «Мой кабинет → Цели → Список целей»: вкладки «По цели» (дерево) и «По сотруднику», поиск и таблица целей. */
@Component({
  selector: 'app-mygoallist',
  imports: [PageHead, MygoallistTable],
  template: `
    <app-page-head title="Список целей" />
    <div class="c" mygoallist-table></div>
  `,
  styleUrl: './mygoallist.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-mygoallist' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mygoallist implements OnDestroy {
  /** этап карты целей: от него зависят статус и действия моих текущих целей */
  private readonly unregister = inject(DevPanelService).register({
    id: 'goalStage',
    label: 'Этап карты целей',
    options: GOAL_STAGES.map((s) => ({ value: s.value, label: s.label })),
    value: inject(DemoState).goalStage,
  });
  ngOnDestroy(): void {
    this.unregister();
  }
}
