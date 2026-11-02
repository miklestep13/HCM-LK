import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, output } from '@angular/core';

const PREV = 'M10 3.6 5.6 8l4.4 4.4';

/**
 * Панель периода (как в «Моем календаре»): «Сегодня», назад / вперед, период, справа — вид («День / Неделя / Месяц», «Месяц / Год»).
 * Ставится под шапкой с фильтрами (app-filter-bar).
 *   <div app-period-bar [label]="period()" [views]="views" [(value)]="view" (shift)="move($event)" (today)="toToday()"></div>
 * picker — период кнопкой со стрелкой: (pick) отдает кнопку, к ней открывают свой мини-календарь. Внутрь можно положить всплывающую панель.
 */
@Component({
  selector: '[app-period-bar]',
  template: `
    <button class="btn raised" (click)="today.emit()">Сегодня</button>
    <div class="ctnav">
      <button class="ib3 ibsq" title="Назад" aria-label="Назад" (click)="shift.emit(-1)"><svg viewBox="0 0 16 16" fill="none"><path [attr.d]="prev" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
      <button class="ib3 ibsq nx" title="Вперед" aria-label="Вперед" (click)="shift.emit(1)"><svg viewBox="0 0 16 16" fill="none"><path [attr.d]="prev" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
    </div>
    @if (picker()) {
      <button class="callbl" title="Выбрать период" (click)="$event.stopPropagation(); pick.emit($any($event.currentTarget))">
        {{ label() }}<svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    } @else {
      <span class="callbl st">{{ label() }}</span>
    }
    <span class="bkgap"></span>
    <div class="seg">
      @for (v of views(); track v.value) {
        <span [class.on]="value() === v.value" (click)="value.set(v.value)">{{ v.label }}</span>
      }
    </div>
    <ng-content />
  `,
  host: { class: 'tbar calbar' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodBar {
  readonly label = input.required<string>();
  readonly views = input.required<{ value: string; label: string }[]>();
  readonly value = model.required<string>();
  readonly picker = input(false, { transform: booleanAttribute });
  readonly shift = output<number>();
  readonly today = output<void>();
  readonly pick = output<HTMLElement>();
  protected readonly prev = PREV;
}
