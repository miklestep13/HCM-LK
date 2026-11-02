import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, signal } from '@angular/core';
import { goalPeople } from '../../../core/demo/goals-store.service';
import { iprPl } from '../../../core/demo/ipr-store.service';
import { GOAL_COLORS } from '../../../data/goals.data';
import { GoalPerson } from '../../../interface/goal';
import { Member, MemberField } from '../../../interface/member';
import { Icon } from '../../../shared/ui/icon/icon';
import { Members } from '../../../widgets/members/members';
import { MygoalviewState } from '../mygoalview.state';

/** «Участники» цели — тот же виджет, что в форме цели (widgets/members), только просмотр: исполнитель и оценивающие, роль и вес; сворачивается стрелкой */
@Component({
  selector: '[mygoalview-ppl]',
  imports: [Icon, Members],
  template: `
    <div class="ch">
      <button class="actb ipcol" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())"><app-icon name="chevSm" /></button>
      <h3>Участники</h3>
      @if (count()) {
        <span class="chip">{{ list().length }}</span>
      }
    </div>
    <div class="cb">
      <app-members view="table" [fields]="fields" [people]="list()" [sub]="sub" [dot]="dot" />
    </div>
  `,
  host: { class: 'c mb ipsect', '[class.ipcold]': 'cold()', '[class.glpw]': 'count()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewPpl {
  protected readonly s = inject(MygoalviewState);
  /** свернут по умолчанию */
  readonly collapsed = input(false, { transform: booleanAttribute });
  /** число участников в шапке (самооценка, оценка заказчиков) */
  readonly count = input(false, { transform: booleanAttribute });
  protected readonly cold = signal(false);
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role', 'w'];
  /** исполнитель — первой строкой, без веса */
  protected readonly list = computed<Member[]>(() => goalPeople(this.s.goal()!).map((p, i) => (i ? { ...p, role: p.role || 'Заказчик' } : { ...p, role: 'Исполнитель', w: null, lock: true })));
  /** точка роли — цвет доли заказчика в полосе весов, как в форме */
  protected readonly dot = (_: Member, i: number) => GOAL_COLORS[(i - 1) % GOAL_COLORS.length];
  protected readonly sub = (p: Member) => {
    const t = (p as GoalPerson).team;
    return t ? t.cnt + ' ' + iprPl(t.cnt, 'сотрудник', 'сотрудника', 'сотрудников') + ' · оценка — среднее по команде' : p.pos;
  };
  constructor() {
    effect(() => this.cold.set(this.collapsed()));
  }
}
