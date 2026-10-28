import { ChangeDetectionStrategy, Component, booleanAttribute, input, signal } from '@angular/core';

/**
 * Поле формы с подписью внутри (стандарт форм прототипа .fld.flt): пустое — подпись серым по центру,
 * заполненное или в фокусе — мелкая подпись сверху.
 *   <app-field label="Название идеи" required [filled]="!!title()" [error]="err()">
 *     <input class="fin" [value]="title()" (input)="title.set($any($event.target).value)" />
 *   </app-field>
 * full — поле на всю ширину сетки формы.
 */
@Component({
  selector: 'app-field',
  template: `
    <label class="flab">{{ label() }}@if (required()) {<em>*</em>}</label>
    <ng-content />
  `,
  host: {
    class: 'fld',
    '[class.flt]': 'float()',
    '[class.on]': 'filled() || focus()',
    '[class.err]': 'error()',
    '[class.full]': 'full()',
    '(focusin)': 'focus.set(true)',
    '(focusout)': 'focus.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Field {
  readonly label = input.required<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly filled = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly full = input(false, { transform: booleanAttribute });
  /** подпись внутри поля (по умолчанию); false — подпись над полем (для списков, чипсов) */
  readonly float = input(true, { transform: booleanAttribute });
  protected readonly focus = signal(false);
}
