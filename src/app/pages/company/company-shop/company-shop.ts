import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Новое в магазине» страницы. Вставляется на место карточки атрибутом company-shop — разметка как в прототипе. */
@Component({
  selector: '[company-shop]',
  templateUrl: './company-shop.html',
  styleUrl: './company-shop.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyShop {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
