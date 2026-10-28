import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';
import { Icon } from '../../shared/ui/icon/icon';
import { Badge } from '../../shared/ui/badge/badge';
import { Progress } from '../../shared/ui/progress/progress';
import { Tone } from '../../interface/common';

/**
 * Виджет «Сводка плана»: название, статус-бейдж, срок с иконкой и (необязательно) прогресс выполнения.
 * Используется в виджетах «ИПР» и «Карта целей» на главной, в бланке аттестации (блок ИПР).
 * Доп. содержимое (плитки, итоговая оценка) передается внутрь.
 */
@Component({
  selector: 'app-plan-summary',
  imports: [Icon, Badge, Progress],
  template: ` <div class="hmiprh" [class.cb]="inset()">
    <div class="hmiprr">
      <div class="hmiprt">
        <b>{{ title() }}</b>
        @if (status()) {
          <app-badge [tone]="statusTone()">{{ status() }}</app-badge>
        }
      </div>
      @if (date()) {
        <span class="hmiprd"><app-icon name="calendarGrey" />{{ date() }}</span>
      }
    </div>
    @if (progress() != null) {
      <app-progress
        label="Выполнено"
        [value]="progress() + '%'"
        [percent]="progress()!"
        [tone]="progressTone()"
        [caption]="caption()"
      />
    }
    <ng-content />
  </div>`,
  styleUrl: './plan-summary.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'plan-summary' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSummary {
  readonly title = input.required<string>();
  readonly status = input('');
  readonly statusTone = input<Tone>('');
  /** строка срока: «до 31.12.2026» или период */
  readonly date = input('');
  readonly progress = input<number | null>(null);
  readonly progressTone = input<Tone>('');
  readonly caption = input('');
  /** с внутренними отступами карточки (.cb) */
  readonly inset = input(false, { transform: booleanAttribute });
}
