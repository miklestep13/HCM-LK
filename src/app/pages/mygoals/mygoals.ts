import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, effect, inject, untracked } from '@angular/core';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { GOAL_STAGES, GoalStage } from '../../interface/goal';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { MygoalsFoot } from './mygoals-foot/mygoals-foot';
import { MygoalsGoals } from './mygoals-goals/mygoals-goals';
import { MygoalsHead } from './mygoals-head/mygoals-head';
import { MapStage, MygoalsState } from './mygoals.state';

/**
 * «Мой кабинет → Цели → Карта целей»: шапка карты (период, общий вес, итоговая оценка), раздел «Цели» и действия этапа.
 * Этап цикла и сценарий черновика — в dev-панели «Демо».
 * Форма цели — pages/mygoalnew, страница цели (просмотр, самооценка, оценка) — pages/mygoalview.
 */
@Component({
  selector: 'app-mygoals',
  imports: [PageHead, MygoalsHead, MygoalsGoals, MygoalsFoot],
  template: `
    <app-page-head title="Карта целей" />
    <div class="c iphead glidle" mygoals-head></div>
    <div class="c mt ipsect" mygoals-goals></div>
    @if (['draft', 'self', 'cust', 'appr'].includes(s.stage())) {
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
      label: 'Этап карты целей',
      options: [{ value: 'idle', label: 'Ожидание' }, ...GOAL_STAGES.map((x) => ({ value: x.value, label: x.value === 'plan' ? 'Утверждены' : x.label }))],
      value: devValue<MapStage>(
        () => this.s.stage(),
        (v) => {
          this.s.demo.goalIdle.set(v === 'idle');
          if (v !== 'idle') this.s.demo.goalStage.set(v as GoalStage);
        },
      ),
    },
    {
      id: 'goalFill',
      label: 'Сценарий черновика',
      options: [
        { value: 'empty', label: 'Пустое' },
        { value: 'full', label: 'Заполненное' },
      ],
      value: this.s.demo.goalFill,
    },
  );

  constructor() {
    // демо-данные этапа: самооценки, оценки участников, итог
    effect(() => {
      const st = this.s.stage();
      untracked(() => st !== 'idle' && this.s.store.prepare(st));
    });
  }
  ngOnDestroy(): void {
    this.unregister();
  }
}
