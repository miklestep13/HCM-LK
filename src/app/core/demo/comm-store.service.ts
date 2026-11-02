import { Injectable, inject, signal } from '@angular/core';
import { COMMUNITIES, commMembers } from '../../data/comm.data';
import { CommFeed, CommMeet, Community } from '../../interface/comm';
import { Member } from '../../interface/member';
import { LegacyService } from '../legacy/legacy.service';

/**
 * Сообщества в демо: вступление, выход и заявки, участники, оценки и лента живут до перезагрузки страницы.
 * Лента (добавленные, измененные и удаленные новости) общая с прототипом: форма новости и страница новости пока там.
 */
@Injectable({ providedIn: 'root' })
export class CommStore {
  readonly list = signal<Community[]>(COMMUNITIES.map((c) => ({ ...c })));
  /** участники по сообществам (заполняются при первом открытии) */
  private readonly mem = signal<Record<string, Member[]>>({});
  /** голос пользователя: 1 — нравится, -1 — не нравится */
  readonly rate = signal<Record<string, number>>({});
  readonly feed = signal<Record<string, CommFeed>>({});
  /** мероприятия, добавленные на странице сообщества */
  readonly meets = signal<Record<string, CommMeet[]>>({});

  constructor() {
    inject(LegacyService).share('comm', {
      get: () => this.feed(),
      set: (v: Record<string, CommFeed>) => {
        this.feed.set(v || {});
        // правки из формы «Редактировать сообщество» (прототип) — в список
        this.list.update((l) =>
          l.map((c) => {
            const i = v?.[c.id]?.info;
            return i ? { ...c, name: i.name, cat: i.cat, about: i.about, place: i.place, created: i.created, cover: i.cover } : c;
          }),
        );
      },
    });
  }

  byId(id: string): Community | undefined {
    return this.list().find((x) => x.id === id);
  }
  members(c: Community): Member[] {
    return this.mem()[c.id] ?? commMembers(c);
  }
  setMembers(id: string, l: Member[]): void {
    this.mem.update((m) => ({ ...m, [id]: l }));
  }
  vote(id: string, v: number): void {
    this.rate.update((r) => ({ ...r, [id]: r[id] === v ? 0 : v }));
  }
  /** удалить новость из ленты сообщества */
  dropPost(id: string, key: string): void {
    this.feed.update((f) => ({ ...f, [id]: { ...f[id], pdel: { ...f[id]?.pdel, [key]: 1 } } }));
  }
  /** добавить мероприятие сообщества */
  addMeet(id: string, m: CommMeet): void {
    this.meets.update((x) => ({ ...x, [id]: [...(x[id] ?? []), m] }));
  }
  /** создать сообщество (форма «Предложить сообщество», админ): первым в списке, пользователь — участник */
  add(c: Community, people: Member[]): void {
    this.list.update((l) => [c, ...l]);
    this.setMembers(c.id, people);
  }
  /** сохранить правки сообщества (форма «Редактировать сообщество») */
  update(id: string, patch: Partial<Community>, people: Member[]): void {
    this.list.update((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    this.setMembers(id, people);
  }
  /** удалить сообщество */
  remove(id: string): void {
    this.list.update((l) => l.filter((x) => x.id !== id));
  }

  /** вступить / выйти / подать заявку; возвращает текст уведомления */
  join(id: string): [string, string] {
    const c = this.list().find((x) => x.id === id)!;
    let msg: [string, string];
    let next: Community;
    if (c.byRequest && !c.joined) {
      next = { ...c, sent: true };
      msg = ['Заявка отправлена', `Администраторы сообщества «${c.name}» рассмотрят ее в течение двух рабочих дней.`];
    } else if (c.joined) {
      next = { ...c, joined: false, members: c.members - 1 };
      msg = ['Готово', `Вы вышли из сообщества «${c.name}».`];
    } else {
      next = { ...c, joined: true, members: c.members + 1 };
      msg = ['Добро пожаловать', `Вы вступили в сообщество «${c.name}».` +
        (c.event ? ` Ближайшая встреча: ${c.event.when.toLowerCase()}, ${c.event.day} ${c.event.mon}.` : '')];
    }
    this.list.update((l) => l.map((x) => (x.id === id ? next : x)));
    return msg;
  }
}
