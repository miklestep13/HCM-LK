import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, signal } from '@angular/core';
import {
  goalFinal,
  goalForm,
  goalLevel,
  goalNum,
  goalPeople,
  goalResult,
  goalType,
  goalUnit,
} from '../../../core/demo/goals-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { GOAL_GTYPES, GOAL_KINDS, GOAL_LEVELS, GOAL_LEVEL_BADGE } from '../../../data/goals.data';
import { ProtoGoal } from '../../../interface/goal';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Float } from '../../../shared/ui/float/float';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MygoalsState } from '../mygoals.state';

/**
 * Карточка цели в карте (glAccCard): название и бейджи (уровень, тип, вид измерения), описание,
 * вес (в черновике и на согласовании — поле со степпером), самооценка / итоговая оценка / результат по этапу,
 * срок и участники (при наведении — список с ролями и весами). Справа — действия этапа.
 */
@Component({
  selector: '[mygoals-goal]',
  imports: [Float],
  templateUrl: './mygoals-goal.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalsGoal {
  readonly goal = input.required<ProtoGoal>();
  protected readonly s = inject(MygoalsState);
  private readonly nav = inject(NavService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly F = computed(() => goalForm(this.goal()));
  protected readonly lvl = computed(() => goalLevel(this.goal()));
  protected readonly lvlIdx = computed(() => GOAL_LEVELS.indexOf(this.lvl()));
  protected readonly lvlName = computed(() => GOAL_LEVEL_BADGE[this.lvl()]);
  protected readonly type = computed(() => goalType(this.goal()));
  protected readonly typeIdx = computed(() => GOAL_GTYPES.indexOf(this.type()));
  protected readonly kindName = computed(() => GOAL_KINDS[this.F().kind]);
  protected readonly final = computed(() => goalFinal(this.goal()));
  protected readonly people = computed(() => goalPeople(this.goal()));
  /** самооценка видна с этапа самооценки */
  protected readonly showSelf = computed(() => ['self', 'cust', 'wait', 'fin'].includes(this.s.stage()));
  protected readonly showFin = computed(() => ['cust', 'fin'].includes(this.s.stage()));
  /** кнопка оценки: самооценка, на оценке заказчиков — только у качественной */
  protected readonly canRate = computed(() => {
    const st = this.s.stage();
    return (st === 'self' || st === 'cust') && (st !== 'cust' || this.F().kind === 'txt');
  });
  protected readonly rateTitle = computed(() => {
    const g = this.goal();
    if (this.s.stage() === 'cust') return g.evs && Object.values(g.evs).some((a) => a.saved) ? 'Изменить оценку' : 'Оценить';
    return g.self ? 'Изменить самооценку' : 'Оценить';
  });
  protected readonly result = computed(() => {
    const r = goalResult(this.goal()), F = this.F();
    return r != null ? goalNum(r) + (F.u === '%' ? '%' : ' ' + goalUnit(F.u)) : '';
  });
  protected readonly selfFact = computed(() => {
    const S = this.goal().self, F = this.F();
    return S?.fact != null ? goalNum(S.fact) + (F.u === '%' ? '%' : ' ' + F.u) + ' · ' : '';
  });
  /** список участников при наведении на аватарки */
  protected readonly pop = signal<HTMLElement | null>(null);

  protected open(mode: 'view' | 'edit' = 'view'): void {
    this.nav.go('mygoalview', { gl: this.goal().id, mode, ev: this.s.demo.goalStage() });
  }
  protected edit(): void {
    this.nav.go('mygoalnew', { edit: this.goal().id, ev: this.s.demo.goalStage() });
  }
  protected async remove(): Promise<void> {
    const g = this.goal();
    if (await this.confirm.ask({ title: 'Удалить цель?', text: '«' + g.t + '» будет убрана из карты. Действие нельзя отменить.', ok: 'Удалить', danger: true })) {
      this.s.store.remove(g.id);
      this.toast.show('Цель удалена', 'Карта обновлена.');
    }
  }
  /** вес: только цифры, 0–100 */
  protected setWeight(e: Event): void {
    const i = e.target as HTMLInputElement;
    i.value = i.value.replace(/[^\d]/g, '').slice(0, 3);
    if (+i.value > 100) i.value = '100';
    this.s.store.update(this.goal().id, { w: i.value === '' ? null : +i.value });
  }
  protected step(d: number): void {
    const w = Math.min(100, Math.max(0, (+(this.goal().w ?? 0) || 0) + d));
    this.s.store.update(this.goal().id, { w });
  }
  protected showPeople(e: MouseEvent): void {
    this.pop.set(e.currentTarget as HTMLElement);
  }
  protected hidePeople(e: MouseEvent): void {
    const to = e.relatedTarget as HTMLElement | null;
    if (!to?.closest?.('.glpplpop')) this.pop.set(null);
  }
}
