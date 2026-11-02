import { Injectable, signal } from '@angular/core';
import { CommCat } from '../../interface/comm';
import { Member } from '../../interface/member';

/** Поля формы сообщества */
export interface CommForm {
  name: string;
  cat: CommCat | '';
  /** дата создания, дд.мм.гггг */
  created: string;
  place: string;
  about: string;
  people: Member[];
  cover: string | null;
}

/** Состояние формы «Добавить / Редактировать сообщество» */
@Injectable()
export class CommnewState {
  readonly id = signal('');
  readonly f = signal<CommForm>({ name: '', cat: '', created: '', place: '', about: '', people: [], cover: null });
  readonly err = signal('');
  readonly bad = signal('');

  set<K extends keyof CommForm>(k: K, v: CommForm[K]): void {
    this.f.update((x) => ({ ...x, [k]: v }));
    this.err.set('');
    this.bad.set('');
  }

  check(): string {
    const f = this.f(), d = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(f.created.trim());
    const fail = (k: string, m: string) => (this.bad.set(k), m);
    if (!f.name.trim()) return fail('name', 'Укажите наименование сообщества.');
    if (!f.cat) return fail('cat', 'Выберите категорию.');
    if (!d || +d[2] < 1 || +d[2] > 12 || +d[1] < 1 || +d[1] > 31) return fail('created', 'Укажите дату создания в формате дд.мм.гггг.');
    if (!f.about.trim()) return fail('about', 'Добавьте описание сообщества.');
    if (f.people.some((p) => !p.n)) return fail('people', 'Выберите сотрудника в каждой строке участников или уберите пустую строку.');
    return '';
  }
}
