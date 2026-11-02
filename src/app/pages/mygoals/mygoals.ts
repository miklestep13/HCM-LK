import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, effect, inject, untracked } from '@angular/core';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { GOAL_STAGES } from '../../interface/goal';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { MygoalsFoot } from './mygoals-foot/mygoals-foot';
import { MygoalsGoals } from './mygoals-goals/mygoals-goals';
import { MygoalsHead } from './mygoals-head/mygoals-head';
import { MygoalsState } from './mygoals.state';

/**
 * «Мой кабинет → Цели → Карта целей»: шапка карты (период, общий вес, итоговая оценка), раздел «Цели» и действия этапа.
 * Статус карты (заведение целей, утверждено, период оценки, завершена) и роль — в dev-панели «Демо».
 * В периоде оценки сотрудник ставит самооценку, руководитель — оценку участника цели.
 * Форма цели — pages/mygoalnew, страница цели (просмотр, самооценка, оценка) — pages/mygoalview.
 */
@Component({
  selector: 'app-mygoals',
  imports: [PageHead, MygoalsHead, MygoalsGoals, MygoalsFoot],
  template: `
    <app-page-head title="Карта целей" />
    <div class="c iphead glidle" mygoals-head></div>
    <div class="c mt ipsect" mygoals-goals></div>
    @if (['draft', 'self', 'cust'].includes(s.stage())) {
      <div class="c mt ipisl" mygoals-foot></div>
    }
  `,
  styleUrl: './mygoals.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [MygoalsState],
  host: { class: 'pg pg-mygoals' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mygoals implements OnDestroy {
  protected readonly s = inject(MygoalsState);
  private readonly unregister = inject(DevPanelService).register(
    {
      id: 'goalStage',
      label: 'Статус карты целей',
      options: GOAL_STAGES.map((x) => ({ value: x.value, label: x.label })),
      value: this.s.demo.goalStatus,
    },
    {
      id: 'goalRole',
      label: 'Роль',
      options: [
        { value: 'emp', label: 'Сотрудник' },
        { value: 'mgr', label: 'Руководитель' },
      ],
      value: this.s.demo.goalRole,
    },
  );

  constructor() {
    // демо-данные этапа: самооценки, оценки участников, итог
    effect(() => {
      const st = this.s.stage();
      untracked(() => this.s.store.prepare(st));
    });
  }
  ngOnDestroy(): void {
    this.unregister();
  }
}
