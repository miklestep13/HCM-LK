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
import { GOAL_STAGES, Goal, GoalItemStatus, Grade, goalStatusOf } from '../../../interface/goal';
import { BadgeData, Tone } from '../../../interface/common';
import { gradeLabel, weightedGrade } from '../../../data/grades';

/** тон бейджа статуса цели — как goalState в карте */
const STATUS_TONE: Record<GoalItemStatus, Tone> = {
  Черновик: '',
  Исполнение: 'info',
  Оценка: 'warn',
  Оценена: 'ok',
};

/**
 * Блок «Карта целей»: шапка карты (период, этап, прогресс как у ИПР) и перечень целей со статусами.
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
    GOAL_STAGES.find((s) => s.value === goalStatusOf(this.demo.goalStage()))!,
  );
  protected readonly isFinal = computed(() => this.demo.goalStage() === 'fin');
  protected readonly doneN = computed(() => this.goals.filter((g) => g.status === 'Оценена').length);
  protected readonly progress = computed(() =>
    this.goals.length ? Math.round((this.doneN() / this.goals.length) * 100) : 0,
  );
  protected readonly progressTone = computed<Tone>(() =>
    this.doneN() === this.goals.length && this.goals.length ? 'ok' : '',
  );
  protected readonly caption = computed(
    () => 'Закрыто ' + this.doneN() + ' из ' + this.goals.length + ' целей',
  );
  protected readonly finalGrade = computed<Grade>(() =>
    weightedGrade(this.goals.map((g) => [g.finalGrade ?? 'B', g.weight ?? 0])),
  );
  protected readonly gradeLabel = gradeLabel;

  protected badgeOf(g: Goal): BadgeData | null {
    const text = g.status;
    if (!text) return null;
    return { text, tone: STATUS_TONE[text] };
  }
}
