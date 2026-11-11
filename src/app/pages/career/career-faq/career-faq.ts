import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { CP_QUESTIONS } from '../../../data/career-path.data';
import { Icon } from '../../../shared/ui/icon/icon';

/** Вопросы по карьерному треку: фиксированные формулировки, без имен и без кнопок */
@Component({
  selector: '[career-faq]',
  imports: [Icon],
  template: `
    <div class="ch"><h3>Вопросы</h3></div>
    <div class="cb">
      @for (item of list; track item.q; let i = $index) {
        <div class="cpq" [class.open]="open() === i">
          <button type="button" (click)="open.set(open() === i ? -1 : i)" [attr.aria-expanded]="open() === i">
            <app-icon name="chevron" />
            <span>{{ item.q }}</span>
          </button>
          @if (open() === i) {
            <div class="cpqa"><p>{{ item.a }}</p></div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './career-faq.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-faq' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerFaq {
  protected readonly list = CP_QUESTIONS;
  protected readonly open = signal(0);
}
