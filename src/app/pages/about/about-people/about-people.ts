import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ABOUT_LEADERS } from '../../../data/about.data';

/** «Ключевые люди компании»: квадратный портрет, ФИО и должность. */
@Component({
  selector: '[about-people]',
  template: `
    <div class="ch"><h3>Ключевые люди компании</h3></div>
    <div class="cb">
      <div class="ab-people">
        @for (p of people; track p.name) {
          <div class="ab-person">
            @if (p.photo) {
              <img class="ab-person__av" [src]="p.photo" alt="" />
            } @else {
              <span class="av ab-person__av" [class]="p.av"></span>
            }
            <span class="ab-person__n">{{ p.name }}</span>
            <span class="ab-person__r">{{ p.role }}</span>
          </div>
        }
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPeople {
  protected readonly people = ABOUT_LEADERS;
}
