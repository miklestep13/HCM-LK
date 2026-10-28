import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MygoalsGoal } from '../mygoals-goal/mygoals-goal';
import { MygoalsState } from '../mygoals.state';

/** Раздел «Цели»: сворачивание, счетчик, «Распределить поровну» и «Добавить» (черновик, согласование), карточки целей или пустое состояние. */
@Component({
  selector: '[mygoals-goals]',
  imports: [MygoalsGoal],
  template: `
    <div class="ch">
      <button class="actb ipcol" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())">
        <svg viewBox="0 0 12 12" fill="none"><path d="M3 4.6 6 7.6l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <h3>Цели</h3>
      <span class="chip">{{ s.list().length }}</span>
      @if (s.edit()) {
        <span class="glsecb">
          @if (s.list().length) {
            <button class="btn raised" (click)="spread()">Распределить поровну</button>
          }
          <button class="btn pri" (click)="add()">Добавить</button>
        </span>
      }
    </div>
    <div class="cb iptcb">
      @for (g of s.list(); track g.id) {
        <div class="iprt glgoal gllite glac" mygoals-goal [goal]="g"></div>
      } @empty {
        <div class="empty">
          <div class="wipi">
            <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10.5" stroke="currentColor" stroke-width="1.8" /><circle cx="16" cy="16" r="5.5" stroke="currentColor" stroke-width="1.8" /><circle cx="16" cy="16" r="1.6" fill="currentColor" /></svg>
          </div>
          <b>Целей пока нет</b>
          <small>
            {{ s.edit() ? 'Добавьте первую цель: что нужно сделать, какой результат ожидается и по какому показателю его проверить.'
              : 'Руководитель поставит цели на IV квартал 2026 до ' + s.store.period.set + '. Добавить цели самостоятельно на этом этапе нельзя.' }}
          </small>
        </div>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  host: { '[class.ipcold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalsGoals {
  protected readonly s = inject(MygoalsState);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly cold = signal(false);

  protected spread(): void {
    const { base, n } = this.s.store.spread();
    this.toast.show('Веса распределены', 'По ' + (100 % n ? base + '–' + (base + 1) : base) + '% на цель, сумма — 100%.');
  }
  /** новая цель — форма цели в старом прототипе */
  protected add(): void {
    this.nav.go('mygoalnew', { lvl: 'Индивидуальная', ev: this.s.demo.goalStage() });
  }
}
