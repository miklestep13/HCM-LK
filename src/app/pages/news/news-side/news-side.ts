import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Events } from '../../../widgets/events/events';
import { Poll } from '../../../widgets/poll/poll';

/** Блок «Колонка справа»: мероприятия (виджет events) и опрос — те же, что в «Компания → Обзор». */
@Component({
  selector: '[news-side]',
  imports: [Events, Poll],
  template: `
    <div app-events></div>
    <div class="c mt">
      <div class="ch"><h3>Опрос</h3></div>
      <app-poll class="cb" />
    </div>
  `,
  styleUrl: './news-side.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSide {}
