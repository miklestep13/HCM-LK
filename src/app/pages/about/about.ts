import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AboutHero } from './about-hero/about-hero';
import { AboutProjects } from './about-projects/about-projects';
import { AboutHistory } from './about-history/about-history';
import { AboutValues } from './about-values/about-values';
import { AboutLeaders } from './about-leaders/about-leaders';
import { AboutSteps } from './about-steps/about-steps';

/** Страница «О компании» (ключ прототипа: about). Собрана из блоков; порядок и раскладка — в about.html. */
@Component({
  selector: 'app-about',
  imports: [AboutHero, AboutProjects, AboutHistory, AboutValues, AboutLeaders, AboutSteps],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-about' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {}
