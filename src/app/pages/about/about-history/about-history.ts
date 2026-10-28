import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ABOUT_HISTORY } from '../../../data/about.data';

/** Карточка «История банка»: годы и события. Вставляется на место карточки атрибутом about-history. */
@Component({
  selector: '[about-history]',
  templateUrl: './about-history.html',
  styleUrl: './about-history.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutHistory {
  protected readonly list = ABOUT_HISTORY;
}
