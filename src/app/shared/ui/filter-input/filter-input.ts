import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';

/**
 * Поле в шапке фильтров с подписью внутри (.ft2w.ft2in): «Цена от», «Количество».
 * digits — только цифры, с пробелами между разрядами (12 850); value хранит цифры без пробелов.
 *   <app-filter-input label="Цена от" digits [max]="7" [(value)]="pmin" />
 */
@Component({
  selector: 'app-filter-input',
  template: `
    <span class="ft2lab">{{ label() }}</span>
    <input class="fin" [class]="inputClass()" [attr.inputmode]="digits() ? 'numeric' : null" [value]="shown()" (input)="put($any($event.target))" />
  `,
  host: { class: 'ft2w ft2in', '[class.is-empty]': '!value()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterInput {
  readonly label = input.required<string>();
  readonly value = model('');
  readonly digits = input(false, { transform: booleanAttribute });
  /** сколько цифр можно ввести */
  readonly max = input(12);
  /** форматировать разряды пробелами */
  readonly group = input(true, { transform: booleanAttribute });
  readonly inputClass = input('');
  protected shown(): string {
    const v = this.value();
    return this.digits() && this.group() && v ? v.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : v;
  }
  protected put(el: HTMLInputElement): void {
    if (!this.digits()) return this.value.set(el.value);
    const v = el.value.replace(/\D/g, '').slice(0, this.max());
    this.value.set(v);
    el.value = this.shown();
  }
}
