import { Injectable, computed, inject, signal } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { GoalsStore, goalForm, goalScaleDef } from '../../core/demo/goals-store.service';
import { GOAL_TXT_SCALE } from '../../data/goals.data';
import { AttachFile } from '../../interface/attach';
import { GoalForm, GoalMark, ProtoGoal } from '../../interface/goal';

export type GoalViewMode = 'view' | 'self' | 'cust' | 'res';

/** Состояние страницы цели: цель, как она измеряется, этап карты и вид страницы. Общее для блоков. */
@Injectable()
export class MygoalviewState {
  readonly demo = inject(DemoState);
  readonly store = inject(GoalsStore);
  readonly id = signal('');
  /** открыта на редактирование оценки (карандаш) или на просмотр */
  readonly edit = signal(false);
  /** демо: та же цель как количественная / качественная / бинарная */
  readonly kind = signal('');

  readonly goal = computed<ProtoGoal | undefined>(() => this.store.goals().find((g) => g.id === this.id()));
  readonly stage = computed(() => this.demo.goalStage());
  /** вид страницы: просмотр (до самооценки), самооценка, оценка заказчиков, результаты (отправлено и итог) */
  readonly mode = computed<GoalViewMode>(() => {
    const st = this.stage();
    return st === 'self' ? 'self' : st === 'cust' ? 'cust' : st === 'wait' || st === 'fin' ? 'res' : 'view';
  });
  readonly F0 = computed<GoalForm>(() => (this.goal() ? goalForm(this.goal()!) : { kind: 'num' }));
  readonly F = computed<GoalForm>(() => {
    const k = this.kind(), F0 = this.F0();
    if (this.mode() === 'self' || this.mode() === 'cust' || !k || k === F0.kind) return F0;
    if (k === 'txt') return { kind: 'txt', u: '', sc: 'Пятиуровневая (A–E)', vals: GOAL_TXT_SCALE, txt: 1 };
    if (k === 'str') return { kind: 'str', u: '', sc: 'Бинарная' };
    return { kind: 'num', u: '%', dir: 'up', sc: 'Пятиуровневая (A–E)', vals: goalScaleDef('Пятиуровневая (A–E)', 'up') };
  });
  /** демо-тип отличается от настоящего — данных оценки нет */
  readonly demoKind = computed(() => !!this.kind() && this.kind() !== this.F0().kind);
  /** самооценка (форма на этапе самооценки): буква, фактический результат, комментарий, документы */
  readonly self = signal<GoalMark>({ o: '', n: '' });
  readonly selfDocs = signal<AttachFile[]>([]);
  readonly selfErr = signal('');
  /** заполнить форму самооценки из цели */
  initSelf(): void {
    const S = this.goal()?.self;
    this.self.set({ o: S?.o || '', n: S?.n || '', fact: S?.fact ?? null, cm: S?.cm || '' });
    this.selfDocs.set((S?.docs || []).map((f) => ({ ...f }) as AttachFile));
    this.selfErr.set('');
  }

  /** единица: «%» или « Дни» */
  readonly us = computed(() => (this.F().u === '%' ? '%' : this.F().u ? ' ' + this.F().u : ''));
}
