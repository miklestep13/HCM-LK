import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';

/**
 * Заголовок страницы (.pf-top): стрелка «Назад» (если пришли не из меню), h1 и подзаголовок.
 * backTo — стрелка всегда ведет на заданную страницу (как в «Сообществах»).
 * Справа можно положить действия: <app-page-head title="…"><button class="btn pri">…</button></app-page-head>
 */
@Component({
  selector: 'app-page-head',
  template: `
    @if (backTo()) {
      <button class="bkb" [title]="backLabel()" (click)="nav.go(backTo(), backAttrs())">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M12.4 4.6 7 10l5.4 5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    } @else if (nav.history().length && !noBack()) {
      <button class="bkb navb" [title]="nav.backTitle()" (click)="nav.back()">
        <svg viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3.2 5.2 8l4.8 4.8"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    }
    <div>
      <h1>{{ title() }}@if (chip() != null) {<span class="chip">{{ chip() }}</span>}</h1>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
    </div>
    <ng-content />
  `,
  host: { class: 'pf-top', '[class.back]': '!!backTo() || (nav.history().length && !noBack())' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHead {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  /** счетчик рядом с заголовком */
  readonly chip = input<number | string | null>(null);
  /** корневой раздел — без стрелки «Назад» */
  readonly noBack = input(false);
  /** постоянная стрелка на конкретную страницу (вместо истории): backTo="company" */
  readonly backTo = input('');
  readonly backLabel = input('Назад');
  /** параметры страницы backTo (например, { lt: 'my' }) */
  readonly backAttrs = input<Record<string, string> | undefined>(undefined);
  protected readonly nav = inject(NavService);
}
