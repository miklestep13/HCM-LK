import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Верхние вкладки формы (опрос, курс и др.): горизонтальное меню вместо степпера слева / с номерами.
 * Активная — синяя с нижней чертой (как .ctabs в карточках), пройденные открыты, следующие — серые.
 * Перейти можно на любой уже открытый шаг (до reached).
 *   <app-form-tabs [steps]="['Общая информация', 'Вопросы']" [(step)]="i" [reached]="max" />
 */
@Component({
  selector: 'app-form-tabs',
  template: `
    @for (t of steps(); track t; let i = $index) {
      <button
        type="button"
        class="ftab"
        role="tab"
        [class.on]="i === step()"
        [class.open]="i !== step() && i <= reached()"
        [attr.aria-selected]="i === step()"
        [disabled]="i > reached()"
        (click)="step.set(i)"
      >
        {{ t }}
      </button>
    }
  `,
  host: { class: 'formtabs', role: 'tablist' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTabs {
  readonly steps = input.required<string[]>();
  readonly step = model(0);
  /** последний открытый шаг: на него и раньше можно перейти кликом */
  readonly reached = input(0);
}
