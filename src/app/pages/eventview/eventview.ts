import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { EventviewHead } from './eventview-head/eventview-head';
import { EventviewState } from './eventview.state';

/**
 * «Календарь → Мероприятия → Мероприятие»: шапка как у курса (обложка, статус, дата, место, описание, реакции, кнопка участия). Админ: «Удалить» и «Редактировать» в заголовке. Параметр адреса ev.
 */
@Component({
  selector: 'app-eventview',
  imports: [PageHead, EventviewHead],
  template: `
    <app-page-head title="Мероприятие" backTo="events" backLabel="К мероприятиям">
      @if (s.adm() && s.card()) {
        <span class="objacts">
          <button class="btn dng" (click)="remove()">Удалить</button>
          <button class="btn raised" (click)="nav.go('eventnew', { ev: s.id() })">Редактировать</button>
        </span>
      }
    </app-page-head>
    @if (s.card()) {
      <div eventview-head></div>
    } @else {
      <div class="c evnone">Мероприятие не найдено или удалено.</div>
    }
  `,
  styleUrl: './eventview.scss',
  providers: [EventviewState],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-eventview' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Eventview implements OnDestroy {
  protected readonly s = inject(EventviewState);
  protected readonly nav = inject(NavService);
  private readonly demo = inject(DemoState);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  /** мероприятие (параметр адреса) */
  readonly ev = input('');

  private readonly off = inject(DevPanelService).register({
    id: 'eventsRole',
    label: 'Роль в мероприятиях',
    options: [
      { value: 'emp', label: 'Сотрудник' },
      { value: 'adm', label: 'Админ' },
    ],
    value: this.demo.eventsRole,
  });

  constructor() {
    effect(() => {
      const id = this.ev();
      untracked(() => this.s.id.set(id));
    });
  }
  ngOnDestroy(): void {
    this.off();
  }

  protected async remove(): Promise<void> {
    const c = this.s.card()!;
    const ok = await this.confirm.ask({
      title: 'Удалить мероприятие?',
      text: 'Мероприятие **' + c.title + '** будет удалено, записавшиеся получат уведомление. Восстановить его не получится.',
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.s.store.remove(c.id);
    this.toast.show('Мероприятие удалено', `«${c.title}» больше не показывается в списке.`);
    this.nav.go('events');
  }
}
