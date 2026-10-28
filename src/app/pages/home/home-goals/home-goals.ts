import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { ListItem } from '../../../shared/ui/list-item/list-item';
import { StatCell } from '../../../shared/ui/stat-cell/stat-cell';
import { PlanSummary } from '../../../widgets/plan-summary/plan-summary';
import { NavService } from '../../../core/navigation/nav.service';
import { DemoState } from '../../../core/demo/demo-state.service';
import { GOAL_PERIOD, MY_GOALS } from '../../../data/goals.data';
import { GOAL_STAGES, Grade } from '../../../interface/goal';
import { gradeLabel, weightedGrade } from '../../../data/grades';

/**
 * Блок «Карта целей»: шапка карты (период, этап) и перечень целей.
 * До этапа «Итог» — список целей со сроками; в «Итоге» — только итоговая оценка по карте.
 */
@Component({
  selector: 'app-home-goals',
  imports: [Card, ListItem, StatCell, PlanSummary],
  templateUrl: './home-goals.html',
  styleUrl: './home-goals.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-goals' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeGoals {
  protected readonly nav = inject(NavService);
  private readonly demo = inject(DemoState);
  protected readonly period = GOAL_PERIOD;
  protected readonly goals = MY_GOALS;
  protected readonly stage = computed(() =>
    GOAL_STAGES.find((s) => s.value === this.demo.goalStage())!,
  );
  protected readonly isFinal = computed(() => this.demo.goalStage() === 'fin');
  protected readonly finalGrade = computed<Grade>(() =>
    weightedGrade(this.goals.map((g) => [g.finalGrade ?? 'B', g.weight ?? 0])),
  );
  protected readonly gradeLabel = gradeLabel;
}
