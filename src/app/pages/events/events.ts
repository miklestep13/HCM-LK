import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { LearnCard as LearnCardData } from '../../interface/learn';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { LearnCard } from '../../widgets/learn-card/learn-card';
import { EventsFilter } from './events-filter/events-filter';
import { EventsState } from './events.state';

/**
 * «Мой кабинет → Календарь → Мероприятия»: поиск и чипсы статусов, карточки мероприятий (как в «Моем обучении»).
 * Роль (dev-панель): сотрудник смотрит и записывается; админ добавляет и редактирует (страница eventnew) и удаляет мероприятия
 * (кнопок участия у него нет; «Редактировать», под ней «Удалить»).
 */
@Component({
  selector: 'app-events',
  imports: [PageHead, EventsFilter, LearnCard],
  template: `
    <app-page-head title="Мероприятия">
      @if (adm()) {
        <button class="btn pri evadd" (click)="nav.go('eventnew')">Добавить</button>
      }
    </app-page-head>
    <div class="c mb" events-filter></div>
    <div class="vgrid">
      @for (c of s.cards(); track c.id) {
        <div learn-card [card]="c" kind="ev" evView [noAction]="adm()">
          @if (adm()) {
            <div lcAdmin class="evadm">
              <button class="btn raised" (click)="nav.go('eventnew', { ev: c.id })">Редактировать</button>
              <button class="btn dng" (click)="remove(c)">Удалить</button>
            </div>
          }
        </div>
      } @empty {
        <div class="c evempty">Мероприятий не найдено. Измените поиск или статусы.</div>
      }
    </div>
  `,
  styleUrl: './events.scss',
  providers: [EventsState],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-events' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Events implements OnDestroy {
  protected readonly s = inject(EventsState);
  private readonly demo = inject(DemoState);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly adm = () => this.demo.eventsRole() === 'adm';
  protected readonly nav = inject(NavService);

  private readonly off = inject(DevPanelService).register({
    id: 'eventsRole',
    label: 'Роль в мероприятиях',
    options: [
      { value: 'emp', label: 'Сотрудник' },
      { value: 'adm', label: 'Админ' },
    ],
    value: this.demo.eventsRole,
  });
  ngOnDestroy(): void {
    this.off();
  }

  protected async remove(c: LearnCardData): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Удалить мероприятие?',
      text: 'Мероприятие **' + c.title + '** будет удалено, записавшиеся получат уведомление. Восстановить его не получится.',
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.s.store.remove(c.id);
    this.toast.show('Мероприятие удалено', `«${c.title}» больше не показывается в списке.`);
  }
}
