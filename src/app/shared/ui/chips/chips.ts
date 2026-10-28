import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Чипсы-фильтр с одним выбором (.fchips): «Все» + варианты. Пустое значение — «Все».
 *   <app-chips label="Категория" [options]="cats" [(value)]="cat" />
 */
@Component({
  selector: 'app-chips',
  template: `
    @if (allLabel()) {
      <button type="button" class="fchip" [class.on]="!value()" [attr.aria-pressed]="!value()" (click)="value.set('')">{{ allLabel() }}</button>
    }
    @for (o of options(); track o) {
      <button type="button" class="fchip" [class.on]="value() === o" [attr.aria-pressed]="value() === o" (click)="value.set(o)">{{ o }}</button>
    }
  `,
  host: { class: 'fchips ft2chips', role: 'group', '[attr.aria-label]': 'label()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chips {
  readonly options = input.required<string[]>();
  readonly value = model('');
  readonly label = input('');
  readonly allLabel = input('Все');
}
