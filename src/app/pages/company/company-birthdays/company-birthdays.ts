import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Блок «Дни рождения» страницы. Вставляется на место карточки атрибутом company-birthdays — разметка как в прототипе. */
@Component({
  selector: '[company-birthdays]',
  templateUrl: './company-birthdays.html',
  styleUrl: './company-birthdays.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyBirthdays {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
