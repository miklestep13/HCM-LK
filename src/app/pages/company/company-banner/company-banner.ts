import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «company-banner» страницы. Вставляется на место карточки атрибутом company-banner — разметка как в прототипе. */
@Component({
  selector: '[company-banner]',
  templateUrl: './company-banner.html',
  styleUrl: './company-banner.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyBanner {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
