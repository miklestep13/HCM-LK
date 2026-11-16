import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { Icon } from '../icon/icon';

/** Оценка звездами 1…max: наведение подсвечивает, повторный клик по выбранной — сброс. <app-rating [max]="5" [(value)]="v" /> */
@Component({
  selector: 'app-rating',
  imports: [Icon],
  template: `
    <span class="rtst" (mouseleave)="hover.set(0)">
      @for (n of stars(); track n) {
        <button type="button" class="rtsb" [class.on]="n <= (hover() || value() || 0)" [attr.aria-label]="n + ' из ' + max()" (mouseenter)="hover.set(n)" (click)="value.set(value() === n ? null : n)">
          <app-icon name="star" />
        </button>
      }
    </span>
    @if (value()) {
      <span class="rtsv">{{ value() }} из {{ max() }}</span>
    }
  `,
  host: { class: 'rating' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rating {
  readonly max = input(5);
  readonly value = model<number | null>(null);
  protected readonly hover = signal(0);
  protected stars(): number[] {
    return Array.from({ length: this.max() }, (_, i) => i + 1);
  }
}
