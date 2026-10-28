import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ABOUT_VALUES } from '../../../data/about.data';

/** Карточка «Ценности». Вставляется на место карточки атрибутом about-values. */
@Component({
  selector: '[about-values]',
  templateUrl: './about-values.html',
  styleUrl: './about-values.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutValues {
  protected readonly list = ABOUT_VALUES;
}
