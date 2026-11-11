import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Степпер формы по шагам: номер (пройденный — галочка), название, линия между шагами.
 * Текущий — синий, пройденные — голубые с галочкой, следующие — серые. Перейти можно на любой уже открытый шаг (до reached).
 *   <app-stepper [steps]="['Общая информация', 'Вопросы']" [(step)]="i" [reached]="max" />
 */
@Component({
  selector: 'app-stepper',
  imports: [Icon],
  template: `
    @for (t of steps(); track t; let i = $index, last = $last) {
      <button type="button" class="stpi" [class.on]="i === step()" [class.done]="i !== step() && i < reached()" [class.open]="i !== step() && i <= reached()" [disabled]="i > reached()" (click)="step.set(i)">
        <span class="stpn">@if (i !== step() && i < reached()) {<app-icon name="checkSm" />} @else {<i>{{ i + 1 }}</i>}</span>
        <span class="stpt">{{ t }}</span>
      </button>
      @if (!last) {
        <span class="stpl" [class.done]="i < reached()"></span>
      }
    }
  `,
  host: { class: 'stepper', role: 'tablist' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stepper {
  readonly steps = input.required<string[]>();
  readonly step = model(0);
  /** последний открытый шаг: на него и раньше можно перейти кликом */
  readonly reached = input(0);
}
