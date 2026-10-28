import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/** Плитка «подпись — значение» (.stc). Значение и действия передаются содержимым. <app-stat-cell label="Доступно">13 дней</app-stat-cell> */
@Component({
  selector: 'app-stat-cell',
  template: `<div>
      <div class="l">{{ label() }}</div>
      <div class="v"><ng-content /></div>
    </div>
    <ng-content select="[statAction]" />`,
  host: { class: 'stc', '[class.w]': 'wide()', style: 'display:block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCell {
  readonly label = input.required<string>();
  /** широкая плитка (на всю ширину, с кнопкой в углу) */
  readonly wide = input(false, { transform: booleanAttribute });
}
