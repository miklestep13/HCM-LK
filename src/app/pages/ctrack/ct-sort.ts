import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Сортировка столбца таблицы справочника: иконка ⇅, повторный клик меняет направление */
@Component({
  selector: 'button[ct-sort]',
  template: `<svg viewBox="0 0 12 12" fill="none">
    <path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`,
  host: {
    class: 'sortb',
    type: 'button',
    '[class.on]': 'on()',
    '[class.desc]': 'desc()',
    '[attr.aria-label]': 'label()',
    '(click)': 'pressed.emit($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtSort {
  readonly on = input(false);
  readonly desc = input(false);
  readonly label = input('Сортировать');
  readonly pressed = output<Event>();
}
