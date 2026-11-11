import { paginate } from '../../shared/ui/pager/pager';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SURVEYS } from '../../data/surveys.data';
import { Survey } from '../../interface/survey';
import { DateRange, EMPTY_RANGE, TODAY, inRange } from '../../shared/ui/date-range/date-range';
import { NavService } from '../../core/navigation/nav.service';
import { ViewMode } from '../../shared/ui/view-switch/view-switch';

const KEY = 'hcm.surveys.view';
const iso = (d: string) => (d ? d.split('.').reverse().join('') : '99999999');
const toDate = (d: string) => {
  const [a, m, y] = d.split('.').map(Number);
  return new Date(y, m - 1, a);
};
const pl = (x: number) => (x % 10 === 1 && x % 100 !== 11 ? 'день' : [2, 3, 4].includes(x % 10) && ![12, 13, 14].includes(x % 100) ? 'дня' : 'дней');
/** сортировка: поле → ключ */
const SORT_KEYS: Record<string, (s: Survey) => string | number> = {
  title: (s) => s.title,
  kind: (s) => s.kind,
  author: (s) => s.author,
  q: (s) => s.questions,
  start: (s) => iso(s.start),
  end: (s) => iso(s.end),
  done: (s) => iso(s.doneAt ?? ''),
  prog: (s) => (s.status === 'Завершен' ? 101 : s.answered ? (s.answered / s.questions) * 100 : 0),
  status: (s) => s.status,
};

/**
 * «Компания → Опросы»: вкладки «Активные / Пройденные», поиск и фильтры (тип, статус, автор, срок), сортировка,
 * вид «Карточки / Таблица» (запоминается в браузере, как в «Заданиях»).
 */
@Injectable({ providedIn: 'root' })
export class SurveysState {
  private readonly nav = inject(NavService);
  readonly tab = signal<'act' | 'done'>('act');
  readonly q = signal('');
  readonly kind = signal('');
  readonly status = signal('');
  readonly author = signal('');
  readonly end = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
  readonly sort = signal<{ k: string; dir: number }>({ k: 'end', dir: 1 });
  readonly view = signal<ViewMode>(this.load());

  readonly all = SURVEYS;
  readonly authors = [...new Set(SURVEYS.map((s) => s.author))].sort();
  readonly count = computed(() => ({ act: SURVEYS.filter((s) => s.status !== 'Завершен').length, done: SURVEYS.filter((s) => s.status === 'Завершен').length }));
  /** список вкладки после поиска и фильтров */
  /** постранично (таблица и карточки): <app-pager [p]="s.pg" /> */
  readonly pg = paginate(() => this.rows());
  readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(), k = this.kind(), st = this.status(), a = this.author(), r = this.end(), done = this.tab() === 'done';
    const f = SORT_KEYS[this.sort().k] ?? SORT_KEYS['end'], dir = this.sort().dir;
    return SURVEYS.filter((s) => (s.status === 'Завершен') === done)
      .filter((s) => (!k || s.kind === k) && (!st || s.status === st) && (!a || s.author === a) && (!s.end || inRange(r, s.end)) && (!q || s.title.toLowerCase().includes(q)))
      .sort((x, y) => (f(x) < f(y) ? -dir : f(x) > f(y) ? dir : 0));
  });
  readonly total = computed(() => (this.tab() === 'done' ? this.count().done : this.count().act));

  setView(v: ViewMode): void {
    this.view.set(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  }
  sortBy(k: string): void {
    const s = this.sort();
    this.sort.set({ k, dir: s.k === k ? -s.dir : 1 });
  }
  /** срок: «до 05.10.2026 · через 5 дней» / «· просрочено на 2 дня» / «Без срока» */
  endText(s: Survey): { over: boolean; t: string } {
    if (!s.end) return { over: false, t: 'Без срока' };
    if (s.status === 'Завершен') return { over: false, t: s.end };
    const n = Math.round((+toDate(s.end) - +TODAY) / 864e5);
    if (n < 0) return { over: true, t: s.end + ' · просрочено на ' + -n + ' ' + pl(-n) };
    return { over: false, t: s.end + ' · ' + (n ? 'через ' + n + ' ' + pl(n) : 'сегодня') };
  }
  /** срок для карточки: «до 05.10 · 5 дней» (оранжевый — 3 дня и меньше; последний день — «до 30.09» красным; просрочено — красным), «Без срока», «Пройден 18.09.2026» */
  due(s: Survey): { t: string; tone: '' | 'warn' | 'dg' } {
    if (s.status === 'Завершен') return { t: 'Пройден ' + (s.doneAt ?? s.end), tone: '' };
    if (!s.end) return { t: 'Без срока', tone: '' };
    const n = Math.round((+toDate(s.end) - +TODAY) / 864e5), dm = s.end.slice(0, 5);
    if (n < 0) return { t: 'Просрочено с ' + dm, tone: 'dg' };
    // последний день — датой и красным
    if (n === 0) return { t: 'до ' + dm, tone: 'dg' };
    return { t: 'до ' + dm + ' · ' + n + ' ' + pl(n), tone: n <= 3 ? 'warn' : '' };
  }
  /** прогресс: ответы и процент — «В работе» (просрочен — красным) и «Завершен» (все ответы, зеленым); порог теста не показываем */
  progress(s: Survey): { pct: number; value: string; caption: string; tone: '' | 'ok' | 'dg' } | null {
    if (s.status === 'В работе') {
      const pct = Math.round(((s.answered ?? 0) / s.questions) * 100);
      return { pct, value: pct + '%', caption: `${s.answered} из ${s.questions}`, tone: this.endText(s).over ? 'dg' : '' };
    }
    if (s.status === 'Завершен') return { pct: 100, value: '100%', caption: `${s.questions} из ${s.questions}`, tone: 'ok' };
    return null;
  }
  /** «12 вопросов» / «1 вопрос» / «3 вопроса» */
  questionsText(s: Survey): string {
    const n = s.questions;
    return n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'вопрос' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'вопроса' : 'вопросов');
  }
  /** действие по опросу (подпись уведомления): перейти, продолжить, результаты */
  action(s: Survey): string {
    return s.status === 'В работе' ? 'Продолжить' : s.status === 'Завершен' ? (s.kind === 'Тест' ? 'Результаты' : 'Мои ответы') : 'Перейти';
  }
  /** страница прохождения (у пройденного — просмотр ответов) */
  open(s: Survey): void {
    this.nav.go('survey', { sv: s.id });
  }
  private load(): ViewMode {
    try {
      return localStorage.getItem(KEY) === 'table' ? 'table' : 'cards';
    } catch {
      return 'cards';
    }
  }
}
