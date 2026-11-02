import { Injectable, computed, signal } from '@angular/core';
import { MY_TASKS, TASK_FINAL } from '../../data/tasks.data';
import { MyTask } from '../../interface/task';
import { DateRange, EMPTY_RANGE, TODAY, inRange } from '../../shared/ui/date-range/date-range';
import { ViewMode } from '../../shared/ui/view-switch/view-switch';

const KEY = 'hcm.mytasks.view';
const iso = (d: string) => d.split('.').reverse().join('');
const toDate = (d: string) => {
  const [a, m, y] = d.split('.').map(Number);
  return new Date(y, m - 1, a);
};
/** сортировка: поле → ключ */
export const TASK_SORT_KEYS: Record<string, (t: MyTask) => string> = {
  th: (t) => t.title,
  au: (t) => t.author,
  cr: (t) => iso(t.created),
  due: (t) => iso(t.due),
  ex: () => '',
  st: (t) => t.status,
};

/** Фильтры, сортировка и вид списка «Задания». Вид запоминается в браузере. */
@Injectable({ providedIn: 'root' })
export class MytasksState {
  readonly q = signal('');
  readonly author = signal('');
  readonly status = signal('');
  readonly due = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
  readonly sort = signal<{ k: string; dir: number }>({ k: 'due', dir: 1 });
  readonly view = signal<ViewMode>(this.load());
  /** открытое небольшое задание — панель справа от списка (разделенный экран) */
  readonly quick = signal<string | null>(null);
  toggleQuick(id: string): void {
    this.quick.set(this.quick() === id ? null : id);
  }

  /** активные задания (без выполненных и отклоненных) */
  readonly active = MY_TASKS.filter((t) => !TASK_FINAL.includes(t.status));
  /** статусы, измененные быстрыми действиями (выполнить, отложить, делегировать) — до перезагрузки */
  readonly stOver = signal<Record<string, string>>({});
  setStatus(id: string, st: string): void {
    this.stOver.update((o) => ({ ...o, [id]: st }));
  }
  readonly authors = [...new Set(MY_TASKS.map((t) => t.author))].sort();
  readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(), a = this.author(), st = this.status(), due = this.due();
    const f = TASK_SORT_KEYS[this.sort().k], dir = this.sort().dir;
    const O = this.stOver();
    return this.active
      .map((t) => (O[t.id] ? { ...t, status: O[t.id] } : t))
      .filter((t) => !TASK_FINAL.includes(t.status))
      .filter((t) => (!st || t.status === st) && (!a || t.author === a) && inRange(due, t.due) && (!q || t.title.toLowerCase().includes(q)))
      .sort((x, y) => (f(x) < f(y) ? -dir : f(x) > f(y) ? dir : 0));
  });

  setView(v: ViewMode): void {
    this.view.set(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  }
  /** срок прошел («сегодня» демо — 30.09.2026) */
  over(d: string): boolean {
    return toDate(d) < TODAY;
  }
  /** «до 10.10.2026 · через 10 дней» / «· просрочено на 12 дней» / «· сегодня» */
  dueText(d: string): { over: boolean; t: string } {
    const n = Math.round((+toDate(d) - +TODAY) / 864e5);
    const pl = (x: number) => (x % 10 === 1 && x % 100 !== 11 ? 'день' : [2, 3, 4].includes(x % 10) && ![12, 13, 14].includes(x % 100) ? 'дня' : 'дней');
    if (n < 0) return { over: true, t: 'до ' + d + ' · просрочено на ' + -n + ' ' + pl(-n) };
    return { over: false, t: 'до ' + d + ' · ' + (n ? 'через ' + n + ' ' + pl(n) : 'сегодня') };
  }
  private load(): ViewMode {
    try {
      return localStorage.getItem(KEY) === 'cards' ? 'cards' : 'table';
    } catch {
      return 'table';
    }
  }
}
