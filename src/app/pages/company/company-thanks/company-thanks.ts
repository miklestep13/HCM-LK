import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Поблагодари коллегу» страницы. Вставляется на место карточки атрибутом company-thanks — разметка как в прототипе. */
@Component({
  selector: '[company-thanks]',
  templateUrl: './company-thanks.html',
  styleUrl: './company-thanks.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyThanks {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
