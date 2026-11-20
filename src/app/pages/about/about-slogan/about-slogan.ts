import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** Баннер со слоганом. Фото — прежняя обложка первой статьи. */
@Component({
  selector: '[about-slogan]',
  template: `
    <img src="assets/img/about/story.jpg" alt="" />
    <p>Сила банка — в людях</p>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSlogan {}
