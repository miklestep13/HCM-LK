import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { COMPANY_EVENTS } from '../../../data/news.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { EventsList } from '../../../widgets/events-list/events-list';

/** Блок «Мероприятия»: заголовок со счетчиком и переходом в календарь, список — виджет events-list. */
@Component({
  selector: '[company-events]',
  imports: [Icon, EventsList],
  template: `
    <div class="ch">
      <h3>Мероприятия</h3>
      <span class="chip">{{ events.length }}</span>
      <button class="ib2 hubopen" title="Календарь" aria-label="Календарь" (click)="nav.go('cal')">
        <app-icon name="open" />
      </button>
    </div>
    <app-events-list class="cb" [events]="events" />
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyEvents {
  protected readonly nav = inject(NavService);
  protected readonly events = COMPANY_EVENTS;
}
