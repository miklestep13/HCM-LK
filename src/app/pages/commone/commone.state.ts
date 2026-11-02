import { Injectable, computed, inject, signal } from '@angular/core';
import { CommStore } from '../../core/demo/comm-store.service';
import { DemoState } from '../../core/demo/demo-state.service';
import { COMM_MONTHS, COMM_MY_ADMIN, COMM_NEWS_SORTS, commMeets, commPosts } from '../../data/comm.data';
import { CommPost } from '../../interface/comm';
import { CompanyEvent } from '../../interface/news';
import { DateRange, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';

/** «Вчера 16:20» / «05.09.2026 11:40» → дата для фильтра по периоду */
const z = (n: number) => String(n).padStart(2, '0');
const dayOf = (d: string) => {
  const rel = { Сегодня: 0, Вчера: 1 }[d.split(' ')[0]];
  if (rel == null) return d;
  const t = new Date(Date.now() - rel * 864e5);
  return z(t.getDate()) + '.' + z(t.getMonth() + 1) + '.' + t.getFullYear();
};

/** Страница сообщества: какое сообщество открыто, вкладка, роль пользователя и фильтры ленты */
@Injectable()
export class CommoneState {
  readonly store = inject(CommStore);
  private readonly demo = inject(DemoState);
  readonly id = signal('');
  readonly c = computed(() => this.store.byId(this.id()));
  readonly tab = signal<'news' | 'mem'>('news');
  /** админ: роль «Админ» — в любом сообществе, «Админ сообщества» — в своем */
  readonly adm = computed(() => {
    const r = this.demo.commRole();
    return r === 'adm' || (r === 'cadm' && COMM_MY_ADMIN.includes(this.id()));
  });

  /** встречи сообщества для виджета «Мероприятия»: «12 сен, Пт, 18:30», место — вместо описания; добавленные встают по дате */
  readonly events = computed<CompanyEvent[]>(() => {
    const c = this.c();
    if (!c) return [];
    const all = [...commMeets(c), ...(this.store.meets()[c.id] ?? [])].sort(
      (x, y) => COMM_MONTHS.indexOf(x[1]) - COMM_MONTHS.indexOf(y[1]) || +x[0] - +y[0],
    );
    return all.map(([day, mon, when, title, place, people]) => ({ when: day + ' ' + mon + ', ' + when, title, desc: place, people }));
  });

  // лента
  readonly q = signal('');
  readonly author = signal('');
  readonly tag = signal('');
  readonly range = signal<DateRange>(EMPTY_RANGE);
  readonly sort = signal(COMM_NEWS_SORTS[0]);
  readonly posts = computed(() => {
    const c = this.c();
    return c ? commPosts(c, this.store.feed()[c.id]) : [];
  });
  readonly authors = computed(() => [...new Set(this.posts().map((p) => p.au[0]))]);
  readonly tags = computed(() => [...new Set(this.posts().flatMap((p) => p.tags))].map((t) => t.charAt(0).toUpperCase() + t.slice(1)));
  readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(), a = this.author(), t = this.tag().toLowerCase(), r = this.range();
    const L = this.posts()
      .map((p, k) => ({ p, k }))
      .filter(({ p }) => (!q || (p.t + ' ' + p.x + ' ' + p.tags.join(' ')).toLowerCase().includes(q)) && (!a || p.au[0] === a) && (!t || p.tags.includes(t)) && inRange(r, dayOf(p.d)));
    const by: Record<string, (x: { p: CommPost; k: number }, y: { p: CommPost; k: number }) => number> = {
      'Сначала новые': (x, y) => x.k - y.k,
      'Сначала старые': (x, y) => y.k - x.k,
      'По просмотрам': (x, y) => y.p.vw - x.p.vw,
      'По лайкам': (x, y) => y.p.lk - x.p.lk,
    };
    return L.sort(by[this.sort()]).map((x) => x.p);
  });

  /** сменить сообщество: вкладка и фильтры — с чистого листа */
  open(id: string): void {
    if (id === this.id()) return;
    this.id.set(id);
    this.tab.set('news');
    this.q.set('');
    this.author.set('');
    this.tag.set('');
    this.range.set(EMPTY_RANGE);
    this.sort.set(COMM_NEWS_SORTS[0]);
  }
}
