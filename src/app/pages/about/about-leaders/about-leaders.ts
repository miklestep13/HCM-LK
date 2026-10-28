import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ABOUT_LEADERS } from '../../../data/about.data';

/** Карточка «Руководство»: фото, ФИО и должность. Вставляется на место карточки атрибутом about-leaders. */
@Component({
  selector: '[about-leaders]',
  templateUrl: './about-leaders.html',
  styleUrl: './about-leaders.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutLeaders {
  protected readonly list = ABOUT_LEADERS;
}
