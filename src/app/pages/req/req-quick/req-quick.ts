import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { REQ_QUICK } from '../../../data/req.data';
import { Icon } from '../../../shared/ui/icon/icon';

/** Быстрые заявки над списком: иконка, название, подсказка. Открывают форму «Новая заявка» с этим типом. */
@Component({
  selector: '[req-quick]',
  imports: [Icon],
  template: `
    @for (x of items; track x.n) {
      <button class="qa" (click)="go(x.n)">
        <span class="ic"><app-icon [name]="x.icon" /></span>
        <span class="cnt"><b>{{ x.n }}</b><small>{{ x.d }}</small></span>
      </button>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'qbar' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqQuick {
  private readonly nav = inject(NavService);
  protected readonly items = REQ_QUICK;
  /** форма «Новая заявка» с выбранным типом */
  protected go(type: string): void {
    this.nav.go('reqnew', { type });
  }
}
