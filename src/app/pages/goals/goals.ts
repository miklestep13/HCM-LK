import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { GOAL_STAGES } from '../../interface/goal';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { MygoallistTable } from '../mygoallist/mygoallist-table/mygoallist-table';

/**
 * «Управление персоналом → Целеполагание → Цели»: реестр всех целей.
 * Таблица как «Список целей», без переключателя роли. Клик по строке → /mygoalview?hr=1.
 */
@Component({
  selector: 'app-goals',
  imports: [PageHead, MygoallistTable],
  template: `
    <app-page-head title="Цели" [noBack]="true" />
    <div class="c" mygoallist-table hr></div>
  `,
  styleUrl: '../mygoallist/mygoallist.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-goals pg-mygoallist' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Goals implements OnDestroy {
  private readonly demo = inject(DemoState);
  private readonly unregister = inject(DevPanelService).register({
    id: 'goalsHrStage',
    label: 'Статус карты целей',
    options: GOAL_STAGES.map((s) => ({ value: s.value, label: s.label })),
    value: this.demo.goalStatus,
  });

  constructor() {
    // HR смотрит цели как руководитель
    this.demo.goalRole.set('mgr');
  }

  ngOnDestroy(): void {
    this.unregister();
  }
}
