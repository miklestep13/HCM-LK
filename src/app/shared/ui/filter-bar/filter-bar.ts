import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Tooltip } from '../tooltip/tooltip';

/**
 * Шапка с фильтрами (паттерн прототипа .ftbar): строка 1 — поиск, кнопка фильтров со стрелкой, действия;
 * строка 2 — доп. фильтры, скрыта по умолчанию и открывается кнопкой фильтров.
 *   <app-filter-bar placeholder="Найти сотрудника" [(query)]="q">
 *     <button ftAction class="btn raised">Развернуть все</button>      — действие в строке поиска
 *     <app-select label="Подразделение" … />                           — фильтры (строка 2)
 *   </app-filter-bar>
 * Стили — глобальные (src/styles/_controls.scss).
 */
@Component({
  selector: 'app-filter-bar',
  imports: [Tooltip],
  template: `
    <div class="ftrow">
      <input
        class="tsearch"
        [class]="inputClass()"
        [placeholder]="placeholder()"
        autocomplete="off"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
      />
      <span class="ftbw">
        <button
          class="ib3 ic ftb"
          aria-label="Фильтры"
          appTip="Фильтры"
          (click)="opened.set(!opened())"
        >
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M2.2 3.4h11.6L9.4 8.4v4.4L6.6 14V8.4L2.2 3.4Z"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
          <svg class="ftchv" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6.4 8 10.4l4-4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </span>
      <ng-content select="[ftAction]" />
    </div>
    <div class="ftrow">
      <ng-content />
    </div>
  `,
  host: { class: 'ftbar', '[class.open]': 'opened()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  readonly placeholder = input('Поиск');
  /** доп. класс поля поиска (например, calq) */
  readonly inputClass = input('');
  readonly query = model('');
  /** открыта ли строка доп. фильтров */
  readonly opened = model(false);
}
