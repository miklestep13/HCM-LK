import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import { CompanyEvent } from '../../interface/news';
import { COMPANY_EVENTS } from '../../data/news.data';
import { Icon } from '../../shared/ui/icon/icon';
import { ToastService } from '../../shared/ui/toast/toast.service';

/**
 * Список мероприятий компании: плитка с датой, название, описание, время · формат · участники.
 * Хост — тело карточки (.cb): <div class="c"><div class="ch">…</div><app-events-list class="cb" /></div>.
 * Используется в «Компания → Обзор» и в «Новостях».
 */
@Component({
  selector: 'app-events-list',
  imports: [Icon],
  template: `
    @for (e of events(); track e.title) {
      <div class="mem cmrow coevr" (click)="register(e)">
        <span class="cmav codt"
          ><b>{{ day(e) }}</b
          ><small>{{ month(e) }}</small></span
        >
        <div class="i">
          <div class="nm">{{ e.title }}</div>
          <div class="rl">{{ e.desc }}</div>
          <span class="cmmm"
            ><app-icon name="clock" />{{ time(e) }} · {{ e.format
            }}<span class="coevu"><app-icon name="user" />{{ e.people }}</span></span
          >
        </div>
      </div>
    }
  `,
  styleUrl: './events-list.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-events', style: 'display:block;padding-top:12px' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsList {
  readonly events = input<CompanyEvent[]>(COMPANY_EVENTS);
  private readonly toast = inject(ToastService);

  /** «18 сентября, 19:00» → 18 / сен / 19:00 */
  protected day = (e: CompanyEvent) => e.when.split(' ')[0];
  protected month = (e: CompanyEvent) => e.when.split(' ')[1].replace(',', '').slice(0, 3);
  protected time = (e: CompanyEvent) => e.when.split(', ')[1];

  protected register(e: CompanyEvent): void {
    this.toast.show('Готово', `${e.title}: регистрация и напоминание в календаре.`);
  }
}
