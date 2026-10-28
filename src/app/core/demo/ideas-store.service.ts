import { Injectable, signal } from '@angular/core';
import { IDEAS } from '../../data/kb.data';
import { Idea } from '../../interface/kb';

/** «Банк идей» в демо: новые идеи, голоса и удаление живут до перезагрузки страницы. */
@Injectable({ providedIn: 'root' })
export class IdeasStore {
  readonly list = signal<Idea[]>(IDEAS.map((i) => ({ ...i })));

  add(i: Idea): void { this.list.update((l) => [i, ...l]); }
  remove(id: string): void { this.list.update((l) => l.filter((x) => x.id !== id)); }
  /** поддержать / отменить голос; возвращает обновленную идею */
  vote(id: string): Idea {
    let r!: Idea;
    this.list.update((l) => l.map((x) => (x.id === id ? (r = { ...x, voted: !x.voted, votes: x.votes + (x.voted ? -1 : 1) }) : x)));
    return r;
  }
}
