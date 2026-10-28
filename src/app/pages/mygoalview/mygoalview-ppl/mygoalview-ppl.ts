import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, signal } from '@angular/core';
import { goalPeople } from '../../../core/demo/goals-store.service';
import { GOAL_COLORS } from '../../../data/goals.data';
import { avCls } from '../../../data/people.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { MygoalviewState } from '../mygoalview.state';

/** «Участники» цели: исполнитель и оценивающие — роль и вес; сворачивается стрелкой */
@Component({
  selector: '[mygoalview-ppl]',
  imports: [Icon],
  template: `
    <div class="ch">
      <button class="actb ipcol" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())"><app-icon name="chevSm" /></button>
      <h3>Участники</h3>
      @if (count()) {
        <span class="chip">{{ list().length }}</span>
      }
    </div>
    <div class="cb">
      <div class="glpt glpt-tp glpro-v">
        <div class="glpth"><span>Участник</span><span>Роль</span><span>Вес</span></div>
        @for (p of list(); track p.n; let i = $index) {
          <div class="glpr" [class.exe]="!i">
            <span class="glpwho"
              ><span class="av" [class]="av(p.n, p.av)"></span><span class="cnm"><b [title]="p.n">{{ p.n }}</b><small>{{ p.pos }}</small></span></span
            >
            <span class="glptp glprl"
              ><i class="glpkdot" [class.glpkdot0]="!i" [style.background]="i ? colors[(i - 1) % colors.length] : null"></i>{{ i ? p.role || 'Заказчик' : 'Исполнитель' }}</span
            >
            <div class="glpvw">
              @if (i) {
                {{ p.w }}%
              } @else {
                <span class="gr">—</span>
              }
            </div>
          </div>
        }
      </div>
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
  protected readonly colors = GOAL_COLORS;
  protected readonly av = avCls;
  protected readonly list = computed(() => goalPeople(this.s.goal()!));
  constructor() {
    effect(() => this.cold.set(this.collapsed()));
  }
}
