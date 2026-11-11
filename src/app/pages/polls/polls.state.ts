import { paginate } from '../../shared/ui/pager/pager';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { POLLS, POLL_PEOPLE, POLL_TEMPLATES } from '../../data/polls.data';
import { Poll, PollPerson } from '../../interface/poll';
import { DateRange, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';
import { ToastService } from '../../shared/ui/toast/toast.service';

const iso = (d: string) => (d && d !== '—' ? d.split('.').reverse().join('') : '99999999');
/** сортировка: поле → ключ */
const SORT_KEYS: Record<string, (p: Poll) => string | number> = {
  n: (p) => p.n,
  ppl: (p) => p.total,
  q: (p) => pollQuestions(p),
  start: (p) => iso(p.start),
  end: (p) => iso(p.end),
  prog: (p) => (p.total ? p.done / p.total : 0),
  st: (p) => p.sts,
};

/** вопросов в опросе: сохраненные из формы или из шаблона */
export const pollQuestions = (p: Poll): number => (p.sec ?? POLL_TEMPLATES[p.tpl].sec).reduce((a, s) => a + s.q.length, 0);

/** «1 участник», «3 участника», «214 участников» */
export const pplText = (n: number): string =>
  n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'участник' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'участника' : 'участников');

/**
 * «Управление персоналом → Опросы» (HR): вкладки «Активные / Завершенные / Архив», поиск, фильтры (статус, дата окончания),
 * сортировка по столбцам; дублирование и архив — в демо-списке; форма опроса — страница pollnew (создание с нуля и редактирование).
 */
@Injectable({ providedIn: 'root' })
export class PollsState {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  readonly list = signal<Poll[]>(POLLS.map((p) => ({ ...p })));
  readonly tab = signal<Poll['st']>('act');
  /** раздел меню «Обучение»: опросы или проверки знаний (тесты) */
  readonly kind = signal<'poll' | 'test'>('poll');
  /** опрос в текущем разделе: тесты — в «Проверках знаний», остальное — в «Опросах» */
  private inKind(p: Poll): boolean {
    return (p.kind === 'Тест') === (this.kind() === 'test');
  }
  readonly q = signal('');
  readonly status = signal('');
  readonly end = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
  readonly sort = signal<{ k: string; dir: number }>({ k: '', dir: 1 });
  /** окно «Участники» опроса */
  readonly people = signal<Poll | null>(null);

  readonly count = computed(() => {
    const l = this.list().filter((p) => this.inKind(p));
    return { act: l.filter((p) => p.st === 'act').length, done: l.filter((p) => p.st === 'done').length, arch: l.filter((p) => p.st === 'arch').length };
  });
  readonly statuses = computed(() => [...new Set(this.list().filter((p) => p.st === this.tab() && this.inKind(p)).map((p) => p.sts))]);
  /** постранично (таблица и карточки): <app-pager [p]="s.pg" /> */
  readonly pg = paginate(() => this.rows());
  readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(), st = this.status(), r = this.end(), { k, dir } = this.sort();
    const rows = this.list().filter(
      (p) => p.st === this.tab() && this.inKind(p) && (!st || p.sts === st) && (p.end === '—' ? !r.a && !r.b : inRange(r, p.end)) && (!q || p.n.toLowerCase().includes(q)),
    );
    const f = SORT_KEYS[k];
    return f ? [...rows].sort((x, y) => (f(x) < f(y) ? -dir : f(x) > f(y) ? dir : 0)) : rows;
  });
  readonly total = computed(() => this.count()[this.tab()]);

  setTab(t: Poll['st']): void {
    this.tab.set(t);
    this.status.set('');
  }
  sortBy(k: string): void {
    const s = this.sort();
    this.sort.set({ k, dir: s.k === k ? -s.dir : 1 });
  }
  /** участники опроса (у опросов разные — сдвиг по списку) */
  persons(p: Poll, n = p.total): PollPerson[] {
    return Array.from({ length: Math.min(n, p.total) }, (_, i) => POLL_PEOPLE[(i + p.off) % POLL_PEOPLE.length]);
  }
  questions(p: Poll): number {
    return pollQuestions(p);
  }
  pct(p: Poll): number {
    return p.total ? Math.round((p.done / p.total) * 100) : 0;
  }
  /** форма опроса: редактирование и новый (с нуля; создание из шаблона пока скрыто) */
  edit(p: Poll): void {
    this.nav.go('pollnew', { poll: String(p.idx) });
  }
  /** итоги опроса (дашборд) */
  stats(p: Poll): void {
    this.nav.go('pollstats', { poll: String(p.idx) });
  }
  create(): void {
    this.nav.go('pollnew');
  }
  byIdx(idx: number): Poll | undefined {
    return this.list().find((p) => p.idx === idx);
  }
  private nextIdx(): number {
    return Math.max(...this.list().map((p) => p.idx)) + 1;
  }
  /** сохранение из формы: новый — в начало «Активных», существующий — на месте (прошедшие участники сохраняются) */
  save(p: Omit<Poll, 'idx'>, idx?: number): void {
    const old = idx == null ? undefined : this.byIdx(idx);
    if (old) this.list.set(this.list().map((x) => (x === old ? { ...x, ...p, idx: old.idx, done: old.done } : x)));
    else this.list.set([{ ...p, idx: this.nextIdx() }, ...this.list()]);
    this.setTab('act');
  }
  duplicate(p: Poll): void {
    this.list.set([{ ...p, idx: this.nextIdx(), n: p.n + ' (копия)', st: 'act', sts: 'Черновик', start: '—', end: '—', done: 0 }, ...this.list()]);
    this.setTab('act');
    this.toast.show('Готово', 'Копия опроса создана как черновик.');
  }
  archive(p: Poll): void {
    const back = p.st === 'arch';
    this.list.set(this.list().map((x) => (x === p ? { ...x, ...(back ? { st: 'done' as const, sts: 'Завершен' as const } : { st: 'arch' as const, sts: 'В архиве' as const }) } : x)));
    this.toast.show('Готово', back ? 'Опрос возвращен в завершенные.' : 'Опрос перенесен в архив.');
  }
}
