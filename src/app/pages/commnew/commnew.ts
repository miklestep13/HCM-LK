import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, untracked } from '@angular/core';
import { CommStore } from '../../core/demo/comm-store.service';
import { DemoState } from '../../core/demo/demo-state.service';
import { NavService } from '../../core/navigation/nav.service';
import { COMM_POOL, COMM_ROLES, COMM_ROLE_ADMIN, COMM_ROLE_MEMBER } from '../../data/comm.data';
import { EVENT_GROUPS } from '../../data/events.data';
import { ME } from '../../data/people.data';
import { Community } from '../../interface/comm';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { commCoverUrl } from '../../widgets/comm-cover/comm-cover.art';
import { CoverUpload } from '../../widgets/cover-upload/cover-upload';
import { PplCard } from '../../widgets/ppl-card/ppl-card';
import { CommnewMain } from './commnew-main/commnew-main';
import { CommnewState } from './commnew.state';

const z = (n: number) => String(n).padStart(2, '0');
const MONTH = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

/**
 * «Сообщества → Добавить / Редактировать сообщество»: основные поля, обложка (widgets/cover-upload), участники (widgets/ppl-card — та же таблица, что в форме
 * мероприятия). Форма-страница: только «Сохранить». Админ создает сразу, сотрудник предлагает.
 * Параметры адреса: cm — сообщество (правка), role — демо-роль.
 */
@Component({
  selector: 'app-commnew',
  imports: [PageHead, CommnewMain, PplCard, CoverUpload],
  template: `
    <app-page-head [title]="s.id() ? 'Редактировать сообщество' : 'Предложить сообщество'" [backTo]="s.id() ? 'commone' : 'comm'"
      [backAttrs]="s.id() ? { cm: s.id() } : undefined" [backLabel]="s.id() ? 'К сообществу' : 'К списку сообществ'" />
    <div commnew-main></div>
    <div cover-upload [value]="s.f().cover" (valueChange)="s.set('cover', $event)"></div>
    <div ppl-card [people]="s.f().people" (peopleChange)="s.set('people', $event)" [roles]="roles" [pool]="pool" [addRole]="member"
      empty="Добавьте участников: коллеги получат приглашение, остальные смогут присоединиться сами."></div>
    @if (s.err()) {
      <div class="pqerr">{{ s.err() }}</div>
    }
    <div class="c ipisl">
      <div class="ipff"><button class="btn pri" (click)="save()">Сохранить</button></div>
    </div>
  `,
  styleUrl: './commnew.scss',
  providers: [CommnewState],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-commnew' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Commnew {
  protected readonly s = inject(CommnewState);
  private readonly store = inject(CommStore);
  private readonly demo = inject(DemoState);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  readonly cm = input('');
  readonly role = input('');
  protected readonly roles = COMM_ROLES;
  protected readonly member = COMM_ROLE_MEMBER;
  /** сотрудники, подразделения и команды */
  protected readonly pool = [...COMM_POOL, ...EVENT_GROUPS];
  private readonly adm = computed(() => this.demo.commRole() === 'adm');

  constructor() {
    effect(() => {
      const r = this.role();
      if (r === 'emp' || r === 'cadm' || r === 'adm') untracked(() => this.demo.commRole.set(r));
    });
    effect(() => {
      const id = this.cm();
      untracked(() => {
        const c = id ? this.store.byId(id) : undefined;
        this.s.id.set(c ? id : '');
        const d = new Date();
        this.s.f.set(
          c
            ? { name: c.name, cat: c.cat, created: c.created, place: c.place, about: c.about, people: this.store.members(c), cover: c.cover || commCoverUrl(c) }
            : { name: '', cat: '', created: `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()}`, place: '', about: '', people: [{ n: ME[0], pos: ME[1], av: 1, role: COMM_ROLE_ADMIN }], cover: null },
        );
      });
    });
  }

  protected save(): void {
    const e = this.s.check();
    if (e) return this.s.err.set(e);
    const f = this.s.f(), id = this.s.id(), cat = f.cat || 'hobby', c0 = id ? this.store.byId(id) : undefined;
    const [, mm, yy] = f.created.split('.');
    const total = f.people.reduce((a, p) => a + (p.cnt || 1), 0);
    const patch: Partial<Community> = {
      name: f.name.trim(),
      cat,
      about: f.about.trim(),
      short: f.about.trim().split(/(?<=[.!?])\s/)[0],
      place: f.place.trim(),
      created: f.created,
      since: MONTH[+mm - 1] + ' ' + yy,
      // обложка по категории без изменений — не сохраняем как картинку (останется фоном категории)
      cover: c0 && f.cover === commCoverUrl(c0) ? null : f.cover,
      members: total,
    };
    if (id) {
      this.store.update(id, patch, f.people);
      this.toast.show('Изменения сохранены', `Сообщество «${patch.name}» обновлено.`);
      return this.nav.go('commone', { cm: id, role: this.demo.commRole() });
    }
    if (this.adm()) {
      const c = { id: 'new' + Date.now(), event: null, freq: 'По договоренности', channel: 'чате сообщества', curator: 0, joined: true, ...patch } as Community;
      this.store.add(c, f.people);
      this.toast.show('Сообщество создано', `«${c.name}» появилось в списке сообществ.` + (f.people.length > 1 ? ` Приглашено участников: ${total - 1}.` : ''));
    } else {
      this.toast.show('Предложение отправлено', `Администратор рассмотрит предложение «${patch.name}» в течение двух рабочих дней. О решении придет уведомление.`);
    }
    this.nav.go('comm');
  }
}
