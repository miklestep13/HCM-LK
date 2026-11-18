import { AttachFile } from '../../interface/attach';
import { CommentItem } from '../../widgets/comments/comments';
import { Injectable, computed, signal } from '@angular/core';
import { REQS, REQ_FINAL, REQ_TYPE_CAT, REQ_ME, REQ_BOSS, REQ_STAGES } from '../../data/req.data';
import { ProcStep } from '../../interface/proc-step';
import { Req, ReqTab } from '../../interface/req';
import { EvMember } from '../../interface/member';
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
  code: (r) => r.code || '',
  from: (r) => key(reqFrom(r)),
  to: (r) => key(reqTo(r)),
  proc: (r) => key(reqProc(r)),
  chan: (r) => r.chan || '',
  dep: (r) => r.dep || '',
  info: (r) => r.info || '',
  docs: (r) => (r.docs?.length ? 1 : 0),
};

/** «Дата с»: из формы, иначе дата создания */
export const reqFrom = (r: Req) => r.from || r.created.split(' ')[0];
/** «Дата по»: из формы, иначе срок или дата завершения */
export const reqTo = (r: Req) => r.to || (r.closed || r.due || '').split(' ')[0];
/** «Дата завершения обработки»: из формы, иначе дата завершения заявки */
export const reqProc = (r: Req) => r.procEnd || (r.closed || '').split(' ')[0];

/** ответственный за текущий этап (у завершенных — нет) */
export const reqResp = (r: Req) => r.resp;
/** дата окончания: завершенной — дата завершения, открытой — срок */
export const reqEnd = (r: Req) => r.closed || r.due || '';
/** уточнение к результату обработки — только у завершенных */
export const reqResult = (r: Req) =>
  r.st === 'Выполнена' ? r.stage : r.st === 'Отклонена' ? 'Отклонена на этапе «' + r.stage + '»' : r.st === 'Отозвана' ? 'Отозвана автором' : '';

/** «Иванов Павел Сергеевич» → «Иванов П. С.» */
const short = (n: string) => {
  const [f, i = '', o = ''] = n.split(' ');
  return [f, i && i[0] + '.', o && o[0] + '.'].filter(Boolean).join(' ');
};
/**
 * ход обработки заявки — шаги для widgets/proc-steps: названия этапов — свои у заявки или по категории (первые steps, текущий — stage);
 * пройденные — зеленые, текущий — синий (ответственный и срок), впереди — серые; отклонена — текущий красный, отозвана — текущий остановлен.
 */
export function reqProcess(r: Req): ProcStep[] {
  const base = r.stages ?? REQ_STAGES[r.cat] ?? [];
  const names = Array.from({ length: r.steps }, (_, i) => base[i] ?? 'Этап ' + (i + 1));
  names[r.step - 1] = r.stage;
  const day = (d?: string) => (d || '').split(' ')[0];
  return names.map((n, i): ProcStep => {
    const k = i + 1;
    if (r.st === 'Выполнена') return { n, st: 'done', sub: k === 1 ? 'Создана ' + day(r.created) : k === r.steps ? 'Завершена ' + day(r.closed) : 'Пройден' };
    if (k < r.step) return { n, st: 'done', sub: k === 1 ? 'Создана ' + day(r.created) : 'Пройден' };
    if (k > r.step) return { n, st: 'next', sub: r.st === 'Отклонена' || r.st === 'Отозвана' ? 'Не выполнялся' : 'Ожидает' };
    if (r.st === 'Отклонена') return { n, st: 'fail', sub: 'Отклонена ' + day(r.closed) };
    if (r.st === 'Отозвана') return { n, st: 'stop', sub: 'Отозвана ' + day(r.closed) };
    return { n, st: 'cur', sub: [r.resp ? short(r.resp.n) : 'Ответственный не назначен', r.due ? 'срок ' + day(r.due) : ''].filter(Boolean).join(' · ') };
  });
}

/** Вкладки, сегмент, фильтры, сортировка, выбор строк и изменения из меню «⋯» (до перезагрузки) списка «Заявки». */
/** колонки реестра: ключ, заголовок, ширина, класс (num — число справа) */
export const REQ_COLS: [string, string, number, string?][] = [
  ['id', '№', 110],
  ['n', 'Тип заявки', 260],
  ['code', 'Код', 150],
  ['st', 'Состояние', 170],
  ['ini', 'Автор', 300],
  ['resp', 'Ответственный', 300],
  ['cr', 'Дата и время создания', 190],
  ['from', 'Дата с', 120],
  ['to', 'Дата по', 120],
  ['proc', 'Дата завершения обработки', 280],
  ['chan', 'Тип канала поступления', 250],
  ['dep', 'Подразделение', 260],
  ['info', 'Описание', 320],
  ['docs', 'Документы', 160, 'rqdc'],
];
/** по умолчанию включены: №, тип заявки, состояние, автор, ответственный, дата и время создания, дата завершения обработки */
const REQ_COLS_ON = ['id', 'n', 'st', 'ini', 'resp', 'cr', 'proc'];

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
  /** настройка колонок (кнопка в строке поиска): скрытые — номера с 1, как в app-table-settings */
  readonly colNames = REQ_COLS.map((c) => c[1]);
  readonly hidden = signal<number[]>(REQ_COLS.map((c, i) => (REQ_COLS_ON.includes(c[0]) ? 0 : i + 1)).filter(Boolean));
  readonly cols = computed(() => REQ_COLS.filter((_, i) => !this.hidden().includes(i + 1)));
  /** отмеченные строки (номера) */
  readonly sel = signal<Set<string>>(new Set());
  /** правки из меню и массовых действий: номер → поля */
  readonly over = signal<Record<string, Partial<Req>>>({});

  /** комментарии к заявкам: номер → обсуждение (до перезагрузки) */
  readonly comments = signal<Record<string, CommentItem[]>>({});
  /** созданные в форме «Добавление заявки» (до перезагрузки) */
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
  /** «Добавление заявки»: в «Мои заявки», дата окончания — «Дата по» (или «Дата с») */
  add(f: { t: string; st: string; from: string; to: string; info: string; name?: string; dep?: string; code?: string; chan?: string; procEnd?: string; docs?: AttachFile[]; members?: EvMember[] }): void {
    const end = f.to || f.from;
    const r: Req = {
      id: this.nextId(), n: f.t, cat: REQ_TYPE_CAT[f.t] || 'Кадры', st: f.st, stage: 'Регистрация', step: 1, steps: 3,
      due: end + ' 18:00', ini: REQ_ME, resp: REQ_BOSS, created: NOW_TEXT, tab: 'my', info: f.info || undefined, title: f.name, dep: f.dep, code: f.code, chan: f.chan, members: f.members?.length ? f.members : undefined, procEnd: f.procEnd, docs: f.docs, from: f.from, to: f.to || undefined,
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
