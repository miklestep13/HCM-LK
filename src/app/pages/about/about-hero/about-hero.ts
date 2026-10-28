import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ABOUT_HERO } from '../../../data/about.data';

/** Шапка-баннер: название банка, слоган, описание и ключевые цифры. Вставляется на место карточки атрибутом about-hero. */
@Component({
  selector: '[about-hero]',
  templateUrl: './about-hero.html',
  styleUrl: './about-hero.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutHero {
  protected readonly h = ABOUT_HERO;
}
