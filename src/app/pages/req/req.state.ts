import { CommentItem } from '../../widgets/comments/comments';
import { Injectable, computed, signal } from '@angular/core';
import { REQS, REQ_FINAL, REQ_TYPE_CAT, REQ_ME, REQ_BOSS } from '../../data/req.data';
import { Req, ReqTab } from '../../interface/req';
import { DateRange, EMPTY_RANGE, TODAY, inRange } from '../../shared/ui/date-range/date-range';

/** сегмент над таблицей: открытые / завершенные / все */
export type ReqSeg = 'open' | 'done' | 'all';

/** «дд.мм.гггг чч:мм» → «ггггммддччмм» (для сортировки) */
const key = (d?: string) => {
  if (!d) return '';
  const [dt, tm = ''] = d.split(' ');
  return dt.split('.').reverse().join('') + tm.replace(':', '');
};
const toDate = (d: string) => {
  const [dt, tm = '00:00'] = d.split(' ');
  const [a, m, y] = dt.split('.').map(Number);
  const [h, mi] = tm.split(':').map(Number);
  return new Date(y, m - 1, a, h, mi);
};
/** время создания в демо */
const NOW_TEXT = '30.09.2026 12:00';
/** «сегодня» демо — 30.09.2026, середина рабочего дня */
const NOW = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 12, 0);

/** сортировка: столбец → ключ */
export const REQ_SORT_KEYS: Record<string, (r: Req) => string | number> = {
  id: (r) => r.id,
  n: (r) => r.n,
  st: (r) => r.st,
  ini: (r) => r.ini.n,
  resp: (r) => r.resp?.n || '',
  cr: (r) => key(r.created),
  res: (r) => reqResult(r),
  end: (r) => key(reqEnd(r)),
};

/** ответственный за текущий этап (у завершенных — нет) */
export const reqResp = (r: Req) => r.resp;
/** дата окончания: завершенной — дата завершения, открытой — срок */
export const reqEnd = (r: Req) => r.closed || r.due || '';
/** уточнение к результату обработки — только у завершенных */
export const reqResult = (r: Req) =>
  r.st === 'Выполнена' ? r.stage : r.st === 'Отклонена' ? 'Отклонена на этапе «' + r.stage + '»' : r.st === 'Отозвана' ? 'Отозвана автором' : '';

/** Вкладки, сегмент, фильтры, сортировка, выбор строк и изменения из меню «⋯» (до перезагрузки) списка «Заявки». */
@Injectable({ providedIn: 'root' })
export class ReqState {
  readonly tab = signal<ReqTab>('my');
  readonly seg = signal<ReqSeg>('open');
  readonly q = signal('');
  readonly cat = signal('');
  readonly status = signal('');
  readonly created = signal<DateRange>(EMPTY_RANGE);
  /** фильтры по колонкам: автор, ответственный (любой из выбранных), дата окончания */
  readonly authors = signal<string[]>([]);
  readonly resps = signal<string[]>([]);
  readonly ended = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
  readonly sort = signal<{ k: string; dir: number }>({ k: 'cr', dir: -1 });
  /** отмеченные строки (номера) */
  readonly sel = signal<Set<string>>(new Set());
  /** правки из меню и массовых действий: номер → поля */
  readonly over = signal<Record<string, Partial<Req>>>({});

  /** комментарии к заявкам: номер → обсуждение (до перезагрузки) */
  readonly comments = signal<Record<string, CommentItem[]>>({});
  /** созданные в форме «Новая заявка» (до перезагрузки) */
  readonly added = signal<Req[]>([]);
  readonly all = computed(() => {
    const O = this.over();
    return [...this.added(), ...REQS].map((r) => (O[r.id] ? { ...r, ...O[r.id] } : r));
  });
  /** номер новой заявки — следующий после последнего */
  nextId(): string {
    const n = Math.max(...this.all().map((r) => +r.id.replace(/\D/g, '') || 0));
    return 'REQ-' + (n + 1);
  }
  /** «Новая заявка»: в «Мои заявки», дата окончания — «Дата по» (или «Дата с») */
  add(f: { t: string; st: string; from: string; to: string; info: string; name?: string; dep?: string }): void {
    const end = f.to || f.from;
    const r: Req = {
      id: this.nextId(), n: f.t, cat: REQ_TYPE_CAT[f.t] || 'Кадры', st: f.st, stage: 'Регистрация', step: 1, steps: 3,
      due: end + ' 18:00', ini: REQ_ME, resp: REQ_BOSS, created: NOW_TEXT, tab: 'my', info: f.info || undefined, title: f.name, dep: f.dep,
    };
    this.added.update((l) => [r, ...l]);
    this.setTab('my');
  }
  /** заявки вкладки (без сегмента и фильтров) */
  readonly inTab = computed(() => this.all().filter((r) => r.tab === this.tab() && (this.tab() !== 'act' || !this.final(r))));
  readonly count = computed(() => {
    const A = this.all();
    return {
      my: A.filter((r) => r.tab === 'my').length,
      act: A.filter((r) => r.tab === 'act' && !this.final(r)).length,
      watch: A.filter((r) => r.tab === 'watch').length,
    } as Record<ReqTab, number>;
  });
  readonly segCount = computed(() => {
    const T = this.inTab();
    const done = T.filter((r) => this.final(r)).length;
    return { open: T.length - done, done, all: T.length };
  });
  /** в «Требуют действия» сегмента нет — только открытые */
  readonly segOn = computed(() => (this.tab() === 'act' ? 'open' : this.seg()));
  readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(), c = this.cat(), st = this.status(), cr = this.created();
    const au = this.authors(), rp = this.resps(), en = this.ended();
    const f = REQ_SORT_KEYS[this.sort().k] || REQ_SORT_KEYS['cr'], dir = this.sort().dir;
    return this.inTab()
      .filter((r) => (!c || r.cat === c) && (!st || r.st === st) && inRange(cr, r.created.split(' ')[0]))
      .filter((r) => (!au.length || au.includes(r.ini.n)) && (!rp.length || rp.includes(r.resp?.n || '')))
      .filter((r) => !en.a || (!!reqEnd(r) && inRange(en, reqEnd(r).split(' ')[0])))
      .filter((r) => !q || (r.id + ' ' + r.n + ' ' + r.cat).toLowerCase().includes(q))
      .sort((x, y) => (f(x) < f(y) ? -dir : f(x) > f(y) ? dir : 0));
  });
  /** показывать «Завершено» и «Оценка» */
  readonly showDone = computed(() => this.segOn() !== 'open');

  final(r: Req): boolean {
    return REQ_FINAL.includes(r.st);
  }
  /** срок по этапу прошел */
  overdue(r: Req): boolean {
    return !!r.due && !this.final(r) && toDate(r.due) < NOW;
  }
  setTab(t: ReqTab): void {
    this.tab.set(t);
    this.sel.set(new Set());
  }
  setSeg(s: ReqSeg): void {
    this.seg.set(s);
    this.sel.set(new Set());
  }
  sortBy(k: string): void {
    const c = this.sort();
    this.sort.set({ k, dir: c.k === k ? -c.dir : 1 });
  }
  patch(ids: string[], p: Partial<Req>): void {
    this.over.update((o) => {
      const n = { ...o };
      ids.forEach((id) => (n[id] = { ...n[id], ...p }));
      return n;
    });
  }
  toggle(id: string): void {
    const s = new Set(this.sel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.sel.set(s);
  }
  selectAll(on: boolean): void {
    this.sel.set(on ? new Set(this.rows().map((r) => r.id)) : new Set());
  }
}
