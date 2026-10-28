import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

/** Сегментированный переключатель (.seg): <app-seg [options]="[{value,label,count?}]" [value]="v" (valueChange)="..." wide /> */
@Component({
  selector: 'app-seg',
  template: `@for (o of options(); track o.value) {
    <span [class.on]="o.value === value()" (click)="valueChange.emit(o.value)"
      >{{ o.label }}
      @if (o.count != null) {
        <em>{{ o.count }}</em>
      }
    </span>
  }`,
  host: { class: 'seg', '[class.wide]': 'wide()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Seg<T = string> {
  readonly options = input.required<{ value: T; label: string; count?: number | string }[]>();
  readonly value = input<T>();
  readonly wide = input(false, { transform: booleanAttribute });
  readonly valueChange = output<T>();
}
