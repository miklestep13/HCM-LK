import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { AboutStore } from '../../core/demo/about-store.service';
import { AboutHero } from './about-hero/about-hero';
import { AboutValues } from './about-values/about-values';
import { AboutLeaders } from './about-leaders/about-leaders';
import { AboutGoals } from './about-goals/about-goals';
import { AboutDirections } from './about-directions/about-directions';
import { AboutSlogan } from './about-slogan/about-slogan';
import { AboutFaces } from './about-faces/about-faces';
import { AboutPeople } from './about-people/about-people';

/** Страница «О компании». Острова статей, порядок блоков — в about.html. */
@Component({
  selector: 'app-about',
  imports: [AboutHero, AboutLeaders, AboutGoals, AboutValues, AboutDirections, AboutSlogan, AboutFaces, AboutPeople],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-about' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  constructor() {
    inject(AboutStore);
  }
}
