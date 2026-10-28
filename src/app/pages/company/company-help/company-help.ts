import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Требуется помощь» страницы. Вставляется на место карточки атрибутом company-help — разметка как в прототипе. */
@Component({
  selector: '[company-help]',
  templateUrl: './company-help.html',
  styleUrl: './company-help.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyHelp {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
