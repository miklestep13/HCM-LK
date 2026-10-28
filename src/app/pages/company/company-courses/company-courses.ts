import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Новые курсы» страницы. Вставляется на место карточки атрибутом company-courses — разметка как в прототипе. */
@Component({
  selector: '[company-courses]',
  templateUrl: './company-courses.html',
  styleUrl: './company-courses.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCourses {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
