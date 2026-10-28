import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ABOUT_STEPS } from '../../../data/about.data';

/** Карточка «Новичку: с чего начать» — нумерованные шаги. Вставляется на место карточки атрибутом about-steps. */
@Component({
  selector: '[about-steps]',
  templateUrl: './about-steps.html',
  styleUrl: './about-steps.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSteps {
  protected readonly list = ABOUT_STEPS;
}
