import { paginate } from '../../shared/ui/pager/pager';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { POLLS, POLL_PEOPLE, POLL_TEMPLATES } from '../../data/polls.data';
import { Poll, PollPerson } from '../../interface/poll';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { DateRange, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';
import { ToastService } from '../../shared/ui/toast/toast.service';

const iso = (d: string) => (d && d !== '—' ? d.split('.').reverse().join('') : '99999999');

/** статус в списке: действует только «Активен» */
export type PollLiveStatus = 'Действует' | 'Не действует';
export const pollLive = (p: Poll): PollLiveStatus => (p.sts === 'Активен' ? 'Действует' : 'Не действует');

/** сортировка: поле → ключ */
const SORT_KEYS: Record<string, (p: Poll) => string | number> = {
  n: (p) => p.n,
  start: (p) => iso(p.start),
  end: (p) => iso(p.end),
  dur: (p) => p.dur ?? 0,
  st: (p) => pollLive(p),
};

/** вопросов в опросе: сохраненные из формы или из шаблона */
export const pollQuestions = (p: Poll): number => (p.sec ?? POLL_TEMPLATES[p.tpl].sec).reduce((a, s) => a + s.q.length, 0);

/** подпись времени прохождения в списке и фильтре */
export const pollDurLabel = (p: Poll): string => (p.dur ? p.dur + ' мин' : '—');

/** «1 участник», «3 участника», «214 участников» */
export const pplText = (n: number): string =>
  n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'участник' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'участника' : 'участников');

/**
 * «Управление персоналом → Опросы → Список опросов» (HR): поиск, фильтры (даты, время, статус),
 * сортировка по столбцам; дублирование и удаление — в демо-списке; форма опроса — страница pollnew.
 */
@Injectable({ providedIn: 'root' })
export class PollsState {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly list = signal<Poll[]>(POLLS.map((p) => ({ ...p })));
  /** раздел меню: опросы или проверки знаний (тесты) */
  readonly kind = signal<'poll' | 'test'>('poll');
  /** опрос в текущем разделе: тесты — в «Проверках знаний», остальное — в «Опросах» */
  private inKind(p: Poll): boolean {
    return (p.kind === 'Тест') === (this.kind() === 'test');
  }
  readonly q = signal('');
  readonly status = signal('');
  /** фильтр «Время прохождения»: подпись «N мин» или пусто */
  readonly dur = signal('');
  readonly start = signal<DateRange>(EMPTY_RANGE);
  readonly end = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
  readonly sort = signal<{ k: string; dir: number }>({ k: '', dir: 1 });
  /** окно «Участники» опроса */
  readonly people = signal<Poll | null>(null);

  readonly statuses: PollLiveStatus[] = ['Действует', 'Не действует'];
  /** уникальные времена прохождения в текущем разделе — для фильтра */
  readonly durOpts = computed(() =>
    [...new Set(this.list().filter((p) => this.inKind(p) && p.dur).map((p) => p.dur!))]
      .sort((a, b) => a - b)
      .map((m) => m + ' мин'),
  );
  /** постранично: <app-pager [p]="s.pg" /> */
  readonly pg = paginate(() => this.rows());
  readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(),
      st = this.status(),
      dur = this.dur(),
      rs = this.start(),
      re = this.end(),
      { k, dir } = this.sort();
    const rows = this.list().filter(
      (p) =>
        this.inKind(p) &&
        (!st || pollLive(p) === st) &&
        (!dur || pollDurLabel(p) === dur) &&
        (p.start === '—' ? !rs.a && !rs.b : inRange(rs, p.start)) &&
        (p.end === '—' ? !re.a && !re.b : inRange(re, p.end)) &&
        (!q || p.n.toLowerCase().includes(q)),
    );
    const f = SORT_KEYS[k];
    return f ? [...rows].sort((x, y) => (f(x) < f(y) ? -dir : f(x) > f(y) ? dir : 0)) : rows;
  });

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
  durLabel(p: Poll): string {
    return pollDurLabel(p);
  }
  live(p: Poll): PollLiveStatus {
    return pollLive(p);
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
  /** сохранение из формы: новый — в начало списка, существующий — на месте (прошедшие участники сохраняются) */
  save(p: Omit<Poll, 'idx'>, idx?: number): void {
    const old = idx == null ? undefined : this.byIdx(idx);
    if (old) this.list.set(this.list().map((x) => (x === old ? { ...x, ...p, idx: old.idx, done: old.done } : x)));
    else this.list.set([{ ...p, idx: this.nextIdx() }, ...this.list()]);
  }
  duplicate(p: Poll): void {
    this.list.set([{ ...p, idx: this.nextIdx(), n: p.n + ' (копия)', st: 'act', sts: 'Черновик', start: '—', end: '—', done: 0 }, ...this.list()]);
    this.toast.show('Готово', 'Копия опроса создана как черновик.');
  }
  async remove(p: Poll): Promise<void> {
    if (
      !(await this.confirm.ask({
        title: 'Удалить опрос?',
        text: '«' + p.n + '» будет удален из списка.',
        ok: 'Удалить',
        danger: true,
      }))
    )
      return;
    this.list.set(this.list().filter((x) => x !== p));
    this.toast.show('Готово', 'Опрос удален.');
  }
}
