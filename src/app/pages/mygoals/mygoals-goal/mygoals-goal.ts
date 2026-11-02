import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, signal } from '@angular/core';
import {
  goalFinal,
  goalForm,
  goalGroup,
  goalLevel,
  goalState,
  goalNum,
  goalPeople,
  goalResult,
  goalType,
  goalUnit,
} from '../../../core/demo/goals-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { shortFio } from '../../../data/org.data';
import { GOAL_KINDS, GOAL_LEVEL_BADGE } from '../../../data/goals.data';
import { ProtoGoal, goalStatusOf } from '../../../interface/goal';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { MygoalsState } from '../mygoals.state';

/**
 * Карточка цели в карте (glAccCard): название и состояние цели (черновик / исполнение / оценка / оценена / отложено), описание,
 * вес (в черновике — поле со степпером), план. и факт. результат (у количественной — оба, у бинарной — только факт, у качественной — нет;
 * план меняется только в форме цели), итоговая оценка;
 * внизу — иконками тип, уровень, группа, тип измерения, срок (подпись — во всплывающей подсказке) и заказчики «Фамилия И. О.» через запятую (при наведении — список с ролями и весами). Справа — действия этапа.
 */
@Component({
  selector: '[mygoals-goal]',
  imports: [Float, Icon, Tooltip],
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
  protected readonly lvlName = computed(() => GOAL_LEVEL_BADGE[this.lvl()]);
  protected readonly type = computed(() => goalType(this.goal()));
  protected readonly group = computed(() => goalGroup(this.goal()));
  protected readonly kindName = computed(() => GOAL_KINDS[this.F().kind]);
  /** состояние цели: в черновике — «Создана»; на оценке — «Ожидает оценки» или «Оценена» */
  protected readonly state = computed(() => goalState(this.goal(), this.s.stage()));
  /** плановый результат: у количественной — план (по умолчанию значение «C» шкалы), у качественной — текст плана */
  protected readonly plan = computed(() => {
    const F = this.F();
    if (F.kind === 'txt') return F.plant || '';
    if (F.kind !== 'num') return '';
    const v = F.plan ?? F.vals?.[2];
    return v == null || v === '' ? '' : goalNum(+String(v).replace(',', '.')) + (F.u === '%' ? '%' : F.u ? ' ' + goalUnit(F.u) : '');
  });
  protected readonly final = computed(() => goalFinal(this.goal()));
  protected readonly people = computed(() => goalPeople(this.goal()));
  /** заказчики цели (все, кроме исполнителя): «Федорова Ю. С., Громов И. С.» */
  protected readonly customers = computed(
    () =>
      this.people()
        .filter((p) => p.role !== 'Исполнитель' && p.n)
        .map((p) => shortFio(p.n))
        .join(', ') || '—',
  );
  /** самооценка видна с этапа самооценки */
  /** «Заведение целей» (черновик или на утверждении) — фактического результата еще нет */
  protected readonly draft = computed(() => goalStatusOf(this.s.stage()) === 'draft');
  protected readonly showSelf = computed(() => ['self', 'cust', 'fin'].includes(this.s.stage()));
  protected readonly showFin = computed(() => ['cust', 'fin'].includes(this.s.stage()));
  /** кнопка оценки: самооценка, на оценке заказчиков — только у качественной */
  protected readonly canRate = computed(() => {
    const st = this.s.stage();
    if (this.goal().st === 'hold') return false;
    return (st === 'self' || st === 'cust') && (st !== 'cust' || this.F().kind === 'txt');
  });
  protected readonly rateTitle = computed(() => {
    const g = this.goal();
    if (this.s.stage() === 'cust') return g.evs && Object.values(g.evs).some((a) => a.saved) ? 'Изменить оценку' : 'Оценить';
    return g.self ? 'Изменить самооценку' : 'Оценить';
  });
  /** факт. результат: у количественной — фактическое значение, у бинарной — «Выполнено / Не выполнено» */
  protected readonly fact = computed(() => {
    const F = this.F();
    if (F.kind === 'str') {
      const A = this.final();
      return A ? (A.o === 'A' ? 'Выполнено' : 'Не выполнено') : '';
    }
    return this.result();
  });
  protected readonly result = computed(() => {
    const r = goalResult(this.goal()), F = this.F();
    return r != null ? goalNum(r) + (F.u === '%' ? '%' : ' ' + goalUnit(F.u)) : '';
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
