import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { StatCell } from '../../../shared/ui/stat-cell/stat-cell';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { TIME_OFF } from '../../../data/home.data';

/** Блок «Отгулы»: накоплено и ближайший отгул */
@Component({
  selector: 'app-home-time-off',
  imports: [Card, StatCell],
  template: ` <app-card title="Отгулы" open="vac">
    <div class="cb">
      <div class="st2">
        <app-stat-cell label="Накоплено"
          >{{ t.accrued }} <small>{{ t.accruedUnit }}</small></app-stat-cell
        >
        <app-stat-cell label="Ближайший">{{ t.nearest }}</app-stat-cell>
      </div>
      <div class="st2">
        <button
          class="btn raised"
          style="flex:1"
          (click)="toast.show('Отгул', 'Форма заявки на отгул.')"
        >
          Оформить отгул
        </button>
      </div>
    </div>
  </app-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeTimeOff {
  protected readonly toast = inject(ToastService);
  protected readonly t = TIME_OFF;
}
