import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, effect, inject, input } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { COMM_POOL, COMM_ROLES, COMM_ROLE_ADMIN, COMM_ROLE_MEMBER, COMM_ROLE_TONE } from '../../data/comm.data';
import { plural } from '../../data/org.data';
import { Member, MemberField } from '../../interface/member';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Members } from '../../widgets/members/members';
import { CommoneBirthdays } from './commone-birthdays/commone-birthdays';
import { Events } from '../../widgets/events/events';
import { EVENT_GROUPS } from '../../data/events.data';
import { CommoneFeed } from './commone-feed/commone-feed';
import { CommoneHero } from './commone-hero/commone-hero';
import { CommoneTabs } from './commone-tabs/commone-tabs';
import { CommoneState } from './commone.state';

/**
 * Страница сообщества (ключ прототипа: commone; параметры адреса: cm — сообщество, role — демо-роль).
 * Шапка, вкладки «Новости» (лента + мероприятия и дни рождения) и «Участники» (виджет widgets/members: карточки или таблица).
 * Админ сообщества редактирует и удаляет сообщество, меняет роли участников в сайдбаре. Демо-роль — в dev-панели.
 */
@Component({
  selector: 'app-commone',
  imports: [PageHead, CommoneHero, CommoneTabs, CommoneFeed, Events, CommoneBirthdays, Members],
  template: `
    @if (s.c(); as c) {
      <app-page-head title="Сообщество" backTo="comm" backLabel="К списку сообществ">
        @if (s.adm()) {
          <span class="objacts">
            <button class="btn dng" (click)="remove()">Удалить</button>
            <button class="btn raised" (click)="edit()">Редактировать</button>
          </span>
        }
      </app-page-head>
      <div commone-hero></div>
      <div commone-tabs></div>
      @if (s.tab() === 'news') {
        <div class="two73 cmnews">
          <div class="cmncol"><div commone-feed></div></div>
          <div class="colR">
            <div app-events [events]="s.events()" empty="Встреча пока не назначена" [canAdd]="s.adm()" (add)="nav.go('eventnew')"></div>
            <div commone-birthdays></div>
          </div>
        </div>
      } @else {
        <app-members
          [edit]="s.adm() ? 'inline' : 'none'"
          view="table"
          [fields]="fields"
          [roles]="s.adm() ? roles : [plain]"
          [plainRole]="plain"
          [lead]="lead"
          [roleTone]="roleTone"
          [pool]="pool"
          [toolbar]="true"
          [canAdd]="!!c.joined || s.adm()"
          addTitle="Пригласить в сообщество"
          [people]="members()"
          (peopleChange)="s.store.setMembers(c.id, $event)"
          (added)="added($event)"
          (removed)="removed($event)"
          (opened)="nav.go('emp', { emp: $event.n })"
        />
      }
    } @else {
      <app-page-head title="Сообщество" backTo="comm" backLabel="К списку сообществ" />
      <div class="c bkemp">Сообщество не найдено или удалено.</div>
    }
  `,
  styleUrl: './commone.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [CommoneState],
  host: { class: 'pg pg-commone' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Commone implements OnDestroy {
  protected readonly s = inject(CommoneState);
  protected readonly nav = inject(NavService);
  private readonly demo = inject(DemoState);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  /** сообщество (параметр адреса) */
  readonly cm = input('');
  /** демо-роль из списка сообществ */
  readonly role = input('');
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role'];
  protected readonly roles = COMM_ROLES;
  protected readonly plain = COMM_ROLE_MEMBER;
  /** в таблице участников администраторы — первыми */
  protected readonly lead = [COMM_ROLE_ADMIN];
  protected readonly roleTone = COMM_ROLE_TONE;
  /** сотрудники, подразделения и команды */
  protected readonly pool = [...COMM_POOL, ...EVENT_GROUPS];
  /** сайдбар «Добавление мероприятия» */
  protected readonly members = computed(() => this.s.store.members(this.s.c()!));

  private readonly off = inject(DevPanelService).register({
    id: 'commRole',
    label: 'Роль в сообществах',
    options: [
      { value: 'emp', label: 'Сотрудник' },
      { value: 'cadm', label: 'Админ сообщества' },
      { value: 'adm', label: 'Админ' },
    ],
    value: this.demo.commRole,
  });

  constructor() {
    effect(() => this.s.open(this.cm()));
    effect(() => {
      const r = this.role();
      if (r === 'emp' || r === 'cadm' || r === 'adm') this.demo.commRole.set(r);
    });
  }
  ngOnDestroy(): void {
    this.off();
  }

  protected edit(): void {
    this.nav.go('commnew', { cm: this.s.c()!.id, role: this.demo.commRole() });
  }
  protected async remove(): Promise<void> {
    const c = this.s.c()!;
    const ok = await this.confirm.ask({
      title: 'Удалить сообщество?',
      text: 'Сообщество **' + c.name + '** будет удалено вместе с новостями и мероприятиями. Восстановить его не получится.',
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.s.store.remove(c.id);
    this.nav.go('comm');
    this.toast.show('Сообщество удалено', '«' + c.name + '» больше не показывается в списке.');
  }
  protected added(l: Member[]): void {
    const n = l.length;
    this.toast.show('Приглашения отправлены', `${n} ${plural(n, 'коллега получит', 'коллеги получат', 'коллег получат')} приглашение в сообщество «${this.s.c()!.name}».`);
  }
  protected removed(m: Member): void {
    this.toast.show('Готово', m.n + ' больше не участник сообщества.');
  }
}
