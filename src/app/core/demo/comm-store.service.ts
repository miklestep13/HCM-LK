import { Injectable, signal } from '@angular/core';
import { COMMUNITIES } from '../../data/comm.data';
import { Community } from '../../interface/comm';

/** Сообщества в демо: вступление, выход и заявки живут до перезагрузки страницы. */
@Injectable({ providedIn: 'root' })
export class CommStore {
  readonly list = signal<Community[]>(COMMUNITIES.map((c) => ({ ...c })));

  /** вступить / выйти / подать заявку; возвращает текст уведомления */
  join(id: string): [string, string] {
    const c = this.list().find((x) => x.id === id)!;
    let msg: [string, string];
    let next: Community;
    if (c.byRequest && !c.joined) {
      next = { ...c, sent: true };
      msg = ['Заявка отправлена', `Организаторы сообщества «${c.name}» рассмотрят ее в течение двух рабочих дней.`];
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
