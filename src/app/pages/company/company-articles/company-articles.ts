import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Новые статьи» страницы. Вставляется на место карточки атрибутом company-articles — разметка как в прототипе. */
@Component({
  selector: '[company-articles]',
  templateUrl: './company-articles.html',
  styleUrl: './company-articles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyArticles {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
