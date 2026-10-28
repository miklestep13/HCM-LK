import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { EventsList } from '../../../widgets/events-list/events-list';
import { Poll } from '../../../widgets/poll/poll';

/** Блок «Колонка справа»: мероприятия (переход в календарь) и опрос — те же, что в «Компания → Обзор». */
@Component({
  selector: '[news-side]',
  imports: [EventsList, Poll],
  template: `
    <div class="c">
      <div class="ch">
        <h3>Мероприятия</h3>
        <button class="lnk" (click)="nav.go('cal')">Календарь</button>
      </div>
      <app-events-list class="cb" />
    </div>
    <div class="c mt">
      <div class="ch"><h3>Опрос</h3></div>
      <app-poll class="cb" />
    </div>
  `,
  styleUrl: './news-side.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSide {
  protected readonly nav = inject(NavService);
}
