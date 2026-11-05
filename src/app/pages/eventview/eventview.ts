import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { EventHead } from '../../widgets/event-head/event-head';
import { PplCard } from '../../widgets/ppl-card/ppl-card';
import { EVENT_GROUPS, EVENT_ROLES } from '../../data/events.data';
import { COMM_POOL } from '../../data/comm.data';
import { EventviewState } from './eventview.state';

/**
 * «Календарь → Мероприятия → Мероприятие»: шапка как у курса (обложка, статус, дата, место, описание, реакции, кнопка участия); внизу — «Участники» (виджет ppl-card с пагинацией). Админ: «Удалить» и «Редактировать» в заголовке. Параметр адреса ev.
 */
@Component({
  selector: 'app-eventview',
  imports: [PageHead, EventHead, PplCard],
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
      @let c = s.card()!;
      @let f = s.f()!;
      <div event-head [title]="c.title" [img]="c.img" [status]="f.status" [when]="s.when()" [dur]="c.dur || ''" [place]="f.place" [desc]="f.desc"
        [action]="s.action()" (act)="s.learn.run('ev', c.id, $event)"></div>
      <div ppl-card ro [people]="s.people()" [roles]="roles" [pool]="pool" [pageSize]="10" empty="Участники не указаны."></div>
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
  protected readonly roles = EVENT_ROLES;
  protected readonly pool = [...COMM_POOL, ...EVENT_GROUPS];
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
