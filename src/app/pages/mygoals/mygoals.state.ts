import { Injectable, computed, inject } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { GoalsStore, goalOrder } from '../../core/demo/goals-store.service';
import { GOAL_COLORS } from '../../data/goals.data';
import { GoalStage } from '../../interface/goal';

/** Состояние страницы «Карта целей»: этап, список целей этапа, сумма весов. Общее для блоков страницы. */
@Injectable()
export class MygoalsState {
  readonly demo = inject(DemoState);
  readonly store = inject(GoalsStore);
  /** этап карты */
  readonly stage = computed<GoalStage>(() => this.demo.goalStage());
  /** можно добавлять, править и удалять цели, менять веса */
  readonly edit = computed(() => this.stage() === 'draft');
  /** цели этапа в порядке карты: компании, подразделения, индивидуальные */
  readonly list = computed(() => goalOrder(this.store.current()));
  /** цвет цели в полосе весов — по порядку в карте */
  readonly color = computed(() => {
    const m = new Map<string, string>();
    this.list().forEach((g, i) => m.set(g.id, GOAL_COLORS[i % GOAL_COLORS.length]));
    return m;
  });
  readonly weight = computed(() => this.list().reduce((a, g) => a + (+(g.w ?? 0) || 0), 0));
}
