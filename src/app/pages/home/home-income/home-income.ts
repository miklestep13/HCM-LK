import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Мои доходы»: быстрый доступ к расчетному листку */
@Component({
  selector: 'app-home-income',
  imports: [Card],
  template: ` <app-card title="Мои доходы" open="benef">
    <div class="cb">
      <button
        class="btn raised blk"
        (click)="toast.show('Готово', 'Расчетный листок за сентябрь 2026 сформирован в PDF.')"
      >
        Расчетный листок
      </button>
    </div>
  </app-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIncome {
  protected readonly toast = inject(ToastService);
}
