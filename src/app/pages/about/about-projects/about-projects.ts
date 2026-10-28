import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ABOUT_PROJECTS } from '../../../data/about.data';
import { plural } from '../../../data/org.data';

/** Карточка «Направления бизнеса». Вставляется на место карточки атрибутом about-projects. */
@Component({
  selector: '[about-projects]',
  templateUrl: './about-projects.html',
  styleUrl: './about-projects.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutProjects {
  protected readonly list = ABOUT_PROJECTS;
  protected readonly plural = plural;
}
