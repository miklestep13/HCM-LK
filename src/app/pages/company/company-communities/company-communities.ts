import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Сообщества» страницы. Вставляется на место карточки атрибутом company-communities — разметка как в прототипе. */
@Component({
  selector: '[company-communities]',
  templateUrl: './company-communities.html',
  styleUrl: './company-communities.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCommunities {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
