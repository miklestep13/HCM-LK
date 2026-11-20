import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { EVM_TYPE_OF } from '../../data/event-members.data';
import { avCls } from '../../data/people.data';
import { EvCol, EvMember, Member } from '../../interface/member';
import { ChipSelect } from '../../shared/ui/chip-select/chip-select';
import { DateField } from '../../shared/ui/date-field/date-field';
import { DateRange, DateRangeField, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../shared/ui/float/float';
import { Icon } from '../../shared/ui/icon/icon';
import { MultiSelect } from '../../shared/ui/multi-select/multi-select';
import { Pager, paginate } from '../../shared/ui/pager/pager';
import { Select } from '../../shared/ui/select/select';
import { TableSettings } from '../../shared/ui/table-settings/table-settings';
import { Tooltip } from '../../shared/ui/tooltip/tooltip';

/** режим правки: none — просмотр; all — весь список сразу полями; row — по одной строке (✎ — правка, новая строка — «Сохранить / Отменить») */
export type EvEdit = 'none' | 'all' | 'row';
/** где кнопка добавления: bottom — ссылка «+ Добавить участника» под таблицей; toolbar — синяя «Добавить» справа в строке поиска */
export type EvAddAt = 'bottom' | 'toolbar';
/** что показывать у участника, кроме ФИО: фото, должность, подразделение */
export type EvWho = 'av' | 'pos' | 'dep';
const WHO: [EvWho, string][] = [['av', 'Фото'], ['pos', 'Должность'], ['dep', 'Подразделение']];
/** вывод длинного списка: pages — пагинация под таблицей; lazy — догрузка порциями при прокрутке до конца таблицы */
export type EvPaging = 'pages' | 'lazy' | 'off';
/** роль участника: multi — несколько ролей (чипами); single — одна роль (список) */
export type EvRoleMode = 'multi' | 'single';

const ALL_COLS: EvCol[] = ['flags', 'member', 'type', 'role', 'w', 'from', 'to', 'desc', 'status'];
const COL_NAMES: Record<EvCol, string> = {
  flags: 'Основной участник',
  member: 'Участник',
  type: 'Тип участника',
  role: 'Роль',
  w: 'Вес',
  from: 'Дата начала',
  to: 'Дата окончания',
  desc: 'Описание',
  status: 'Статус',
};
const STATUSES = ['Действует', 'Не действует'];
/** фильтр по весу: диапазоны, % */
const WEIGHTS: [string, (w: number | null | undefined) => boolean][] = [
  ['Не указан', (w) => w == null],
  ['1–20 %', (w) => w != null && w >= 1 && w <= 20],
  ['21–50 %', (w) => w != null && w >= 21 && w <= 50],
  ['Больше 50 %', (w) => w != null && w > 50],
];
/** сортировка по заголовку колонки: ключ сравнения строк */
const SORT_KEY: Partial<Record<EvCol, (r: EvMember) => string | number>> = {
  member: (r) => r.n,
  type: (r) => r.type,
  role: (r) => r.roles[0] || '',
  w: (r) => r.w ?? -1,
  from: (r) => dk(r.from),
  to: (r) => dk(r.to) || '99999999',
};
/** настройки (кнопка ⚙): подписи и значения */
const EDITS: [EvEdit, string][] = [['all', 'Весь список'], ['row', 'По строке'], ['none', 'Просмотр']];
const ADDS: [EvAddAt, string][] = [['bottom', 'Снизу'], ['toolbar', 'В строке поиска']];
const PAGINGS: [EvPaging, string][] = [['pages', 'Пагинация'], ['lazy', 'Ленивая загрузка'], ['off', 'Без пагинации']];
const ONOFF = ['Есть', 'Нет'];
const ROLE_MODES: [EvRoleMode, string][] = [['multi', 'Несколько'], ['single', 'Одна']];
/** вкладки списка выбора: по виду участника */
const PKINDS: [string, string][] = [['all', 'Все'], ['emp', 'Сотрудники'], ['dep', 'Подразделения'], ['team', 'Команды'], ['company', 'Компании']];
/** «сегодня» прототипа — для статуса по датам */
const TODAY = '20260930';
const dk = (d?: string) => (d ? d.split('.').reverse().join('') : '');

/**
 * «Участники события» — универсальная таблица участников (без графика занятости) (пока только на странице «Виджеты»; виджеты на страницах не заменяет).
 * Колонки: признак «Основной» (★) — значком у ФИО; участник (фото, ФИО, должность · подразделение; у группы — значок группы);
 * тип участника — из реестра по виду участника (сотрудник, подразделение, команда, компания), не правится; роли (несколько или одна — roleMode);
 * вес, %; дата начала и окончания участия; описание; статус «Действует / Не действует» (по датам, в правке — можно задать вручную);
 * справа — действия (без заголовка). Любую колонку можно отключить: cols.
 *   <div class="c" event-members [(rows)]="list" [pool]="people" [types] [roles]
 *        edit="all | row | none" filters addAt="bottom | toolbar" paging="pages | lazy | off" fold [cols]="['member', 'role', 'from', 'status']" configurable></div>
 *   edit     — 'all': все строки сразу полями; 'row': строки текстом, ✎ открывает одну строку, новая — одна строка с «Сохранить / Отменить»;
 *   filters  — шапка с поиском и фильтрами (app-filter-bar), без него — только таблица;
 *   addAt    — 'bottom': ссылка «+ Добавить участника» под таблицей (новая строка внизу); 'toolbar': «Добавить» в строке поиска (новая строка наверху);
 *   paging   — 'pages': пагинация под таблицей (pageSize на странице); 'lazy': показываем pageSize, остальное догружается при прокрутке до конца; 'off': все строки, без пагинации;
 *   fold     — шеврон слева от заголовка (свернуть / развернуть), счетчик — chip; collapsed — свернут по умолчанию;
 *   configurable — справа в шапке кнопка ⚙: все настройки можно переключить на месте (для показа).
 * Выбор участника — как в формах: поле с фото, ФИО и должностью, список с поиском и вкладками вида: сотрудники, подразделения, команды, компании.
 * who — что показывать у участника кроме ФИО: 'av' (фото), 'pos' (должность), 'dep' (подразделение); любое можно отключить.
 */
@Component({
  selector: '[event-members]',
  imports: [NgTemplateOutlet, TableSettings, FilterBar, Select, MultiSelect, ChipSelect, DateRangeField, DateField, Icon, Pager, Tooltip, Float],
  templateUrl: './event-members.html',
  styleUrl: './event-members.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'w-evm',
    '[class.cfold]': 'fold()',
    '[class.cold]': 'cold()',
    '(document:click)': 'outside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventMembers {
  readonly rows = model.required<EvMember[]>();
  /** кого можно выбрать участником */
  readonly pool = input<Member[]>([]);
  readonly title = input('Участники события');
  /** заголовок колонки участника: «Участник» (по умолчанию), «Сотрудник»… */
  readonly memberLabel = input('Участник');
  readonly edit = input<EvEdit>('none');
  readonly filters = input(false, { transform: booleanAttribute });
  readonly addAt = input<EvAddAt>('bottom');
  readonly paging = input<EvPaging>('pages');
  /** сворачиваемый блок: шеврон слева от заголовка */
  readonly fold = input(false, { transform: booleanAttribute });
  /** свернут по умолчанию (только при fold) */
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly cols = input<EvCol[]>(ALL_COLS);
  /** у участника, кроме ФИО: фото, должность, подразделение (любое можно отключить) */
  readonly who = input<EvWho[]>(['av', 'pos', 'dep']);
  readonly types = input<string[]>([]);
  readonly roles = input<string[]>([]);
  /** роли, которые может занимать только один участник: при назначении снимаются с остальных */
  readonly sole = input<string[]>([]);
  readonly pageSize = input(10);
  /** роль: несколько ('multi') или одна ('single') */
  readonly roleMode = input<EvRoleMode>('multi');
  /** роль новой строки (пусто — «Участник» или первая из roles) */
  readonly newRole = input('');
  /** кнопка настройки столбцов (перед кнопкой фильтра; без фильтров — в шапке) */
  readonly colSettings = input(false, { transform: booleanAttribute });
  /** кнопка настроек ⚙ в шапке */
  readonly configurable = input(false, { transform: booleanAttribute });

  // ——— действующие настройки: из входов, кнопкой ⚙ можно переключить на месте ———
  protected readonly mEdit = linkedSignal(() => this.edit());
  protected readonly mFilters = linkedSignal(() => this.filters());
  protected readonly mAdd = linkedSignal(() => this.addAt());
  protected readonly mPaging = linkedSignal(() => this.paging());
  protected readonly mCols = linkedSignal(() => this.cols());
  protected readonly mWho = linkedSignal(() => this.who());
  protected readonly mRole = linkedSignal(() => this.roleMode());
  protected readonly mSole = linkedSignal(() => this.sole());
  protected readonly mColSet = linkedSignal(() => this.colSettings());
  /** свернут — только при fold; без fold тело всегда открыто */
  protected readonly cold = linkedSignal(() => this.fold() && this.collapsed());
  protected readonly cfgOpen = signal<HTMLElement | null>(null);
  protected readonly cfg = {
    edits: EDITS.map((x) => x[1]),
    adds: ADDS.map((x) => x[1]),
    pagings: PAGINGS.map((x) => x[1]),
    onoff: ONOFF,
    cols: ALL_COLS.map((c) => COL_NAMES[c]),
    who: WHO.map((x) => x[1]),
    roleModes: ROLE_MODES.map((x) => x[1]),
  };
  protected readonly cfgRole = computed(() => ROLE_MODES.find((x) => x[0] === this.mRole())![1]);
  protected setRole(v: string): void {
    this.mRole.set(ROLE_MODES.find((x) => x[1] === v)?.[0] ?? 'multi');
  }
  /** роли строки: при одной роли — только первая */
  protected rolesOf(r: EvMember): string[] {
    return this.mRole() === 'single' ? r.roles.slice(0, 1) : r.roles;
  }
  protected readonly cfgWho = computed(() => WHO.filter((x) => this.mWho().includes(x[0])).map((x) => x[1]));
  protected setWho(v: string[]): void {
    this.mWho.set(WHO.filter((x) => v.includes(x[1])).map((x) => x[0]));
  }
  protected showW(k: EvWho): boolean {
    return this.mWho().includes(k);
  }
  protected readonly cfgEdit = computed(() => EDITS.find((x) => x[0] === this.mEdit())![1]);
  protected readonly cfgAdd = computed(() => ADDS.find((x) => x[0] === this.mAdd())![1]);
  protected readonly cfgPaging = computed(() => PAGINGS.find((x) => x[0] === this.mPaging())![1]);
  protected readonly cfgCols = computed(() => this.mCols().map((c) => COL_NAMES[c]));
  protected setEdit(v: string): void {
    this.close();
    this.mEdit.set(EDITS.find((x) => x[1] === v)?.[0] ?? 'none');
  }
  protected setAdd(v: string): void {
    this.mAdd.set(ADDS.find((x) => x[1] === v)?.[0] ?? 'bottom');
  }
  protected setPaging(v: string): void {
    this.mPaging.set(PAGINGS.find((x) => x[1] === v)?.[0] ?? 'pages');
    this.shown.set(this.pageSize());
  }
  /** настройка столбцов (кнопка перед фильтром): названия колонок и номера скрытых */
  //     первый пункт — «Участник» (его не скрыть); номера скрытых — с 1, как у app-table-settings
  private readonly setOrder: EvCol[] = ['member', ...ALL_COLS.filter((c) => c !== 'member')];
  protected readonly colNames = this.setOrder.map((c) => COL_NAMES[c]);
  protected readonly hiddenCols = computed(() => this.setOrder.map((c, i) => (this.mCols().includes(c) ? 0 : i + 1)).filter(Boolean));
  protected setHidden(h: number[]): void {
    const off = h.map((n) => this.setOrder[n - 1]);
    this.mCols.set(ALL_COLS.filter((c) => !off.includes(c)));
  }
  protected setCols(v: string[]): void {
    this.mCols.set(ALL_COLS.filter((c) => v.includes(COL_NAMES[c])));
  }
  protected toggleCfg(e: MouseEvent): void {
    e.stopPropagation();
    this.cfgOpen.set(this.cfgOpen() ? null : (e.currentTarget as HTMLElement));
  }
  /** клик по шапке сворачивает только в режиме fold; кнопки справа не трогаем */
  protected onHead(e: MouseEvent): void {
    if (!this.fold()) return;
    if ((e.target as HTMLElement).closest('.evmhr, button, a')) return;
    this.cold.update((v) => !v);
  }

  protected readonly statuses = STATUSES;

  // ——— фильтры ———
  protected readonly q = signal('');
  protected readonly fOpen = signal(false);
  /** фильтр-переключатель: только основные участники */
  protected readonly fMain = signal(false);
  protected readonly fType = signal('');
  protected readonly fRole = signal('');
  protected readonly fW = signal('');
  protected readonly weightOpts = WEIGHTS.map((x) => x[0]);
  protected readonly fFrom = signal<DateRange>(EMPTY_RANGE);
  protected readonly fTo = signal<DateRange>(EMPTY_RANGE);
  protected readonly fSt = signal('');

  // ——— правка по строке ———
  /** строка в правке (режим row) и ее черновик; новая строка — убирается при «Отменить» */
  protected readonly edId = signal<string | null>(null);
  protected readonly draft = signal<EvMember | null>(null);
  private readonly fresh = signal<string | null>(null);

  protected readonly canEdit = computed(() => this.mEdit() !== 'none');
  protected readonly colCount = computed(() => this.mCols().filter((c) => c !== 'flags').length + (this.canEdit() ? 1 : 0));
  protected readonly statusOpts = STATUSES;
  protected has(c: EvCol): boolean {
    return this.mCols().includes(c);
  }

  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.rows().filter((r) => {
      // новые и открытые на правку строки фильтры не прячут
      if (r.id === this.edId() || !r.n) return true;
      if (q && ![r.n, r.pos, r.dep || ''].some((x) => x.toLowerCase().includes(q))) return false;
      if (this.fMain() && !r.main) return false;
      if (this.fType() && r.type !== this.fType()) return false;
      if (this.fRole() && !r.roles.includes(this.fRole())) return false;
      if (this.fW() && !WEIGHTS.find((x) => x[0] === this.fW())![1](r.w)) return false;
      if (!inRange(this.fFrom(), r.from)) return false;
      if (this.fTo().a && !(r.to && inRange(this.fTo(), r.to))) return false;
      if (this.fSt() && this.status(r) !== this.fSt()) return false;
      return true;
    });
  });
  // ——— сортировка по заголовкам колонок: щелчок — по возрастанию, повторный — по убыванию;
  //     новые строки (без участника) не сортируются — остаются там, где добавлены ———
  protected readonly srt = signal<{ k: EvCol | ''; d: 1 | -1 }>({ k: '', d: 1 });
  protected sortAria(c: EvCol): string | null {
    const s = this.srt();
    return s.k === c ? (s.d > 0 ? 'ascending' : 'descending') : null;
  }
  protected sortBy(c: EvCol): void {
    const s = this.srt();
    this.srt.set({ k: c, d: s.k === c ? (-s.d as 1 | -1) : 1 });
  }
  protected readonly sorted = computed(() => {
    const { k, d } = this.srt(), l = this.filtered();
    if (!k) return l;
    const key = k === 'status' ? (r: EvMember) => this.status(r) : SORT_KEY[k]!;
    const cmp = (a: EvMember, b: EvMember) => {
      const x = key(a), y = key(b);
      return d * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ru'));
    };
    const blank = l.filter((r) => !r.n), named = l.filter((r) => r.n).sort(cmp);
    return this.mAdd() === 'toolbar' ? [...blank, ...named] : [...named, ...blank];
  });
  protected readonly pg = paginate(() => this.sorted(), 10);
  /** ленивая загрузка: сколько строк показано; догружаем порцию pageSize, когда низ таблицы виден */
  protected readonly shown = linkedSignal(() => this.pageSize());
  protected readonly loading = signal(false);
  /** строки на экране: страница пагинации, первые shown строк или весь список */
  protected readonly view = computed(() => (this.mPaging() === 'pages' ? this.pg.view() : this.mPaging() === 'lazy' ? this.sorted().slice(0, this.shown()) : this.sorted()));
  protected readonly more = computed(() => this.mPaging() === 'lazy' && this.filtered().length > this.shown());

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  constructor() {
    queueMicrotask(() => this.pg.size.set(this.pageSize() || 10));
    // ленивая загрузка: следим за меткой под таблицей
    afterNextRender(() => {
      const io = new IntersectionObserver((e) => {
        if (!e.some((x) => x.isIntersecting) || !this.more() || this.loading()) return;
        this.loading.set(true);
        setTimeout(() => {
          this.shown.update((n) => n + this.pageSize());
          this.loading.set(false);
        }, 500);
      });
      const watch = () => {
        io.disconnect();
        const s = this.el.querySelector('.evmsent');
        if (s) io.observe(s);
      };
      const mo = new MutationObserver(watch);
      mo.observe(this.el, { childList: true, subtree: true });
      watch();
      this.destroy.onDestroy(() => (io.disconnect(), mo.disconnect()));
    });
  }
  private readonly destroy = inject(DestroyRef);

  /** статус: заданный вручную или по датам — сегодня внутри периода участия — «Действует» */
  protected status(r: EvMember): string {
    if (r.st) return r.st;
    return dk(r.from) <= TODAY && (!r.to || dk(r.to) >= TODAY) ? 'Действует' : 'Не действует';
  }
  protected av(r: { n: string; av: number | string; kind?: string }): string {
    return r.kind ? 'mbgrp' : avCls(r.n, r.av);
  }
  /** вес: только цифры, до трех знаков (как в форме цели) */
  protected setW(r: EvMember, e: Event): void {
    const el = e.target as HTMLInputElement, v = el.value.replace(/[^\d]/g, '').slice(0, 3);
    el.value = v;
    this.set(r, { w: v ? +v : null });
  }
  /** строка под ФИО: должность и подразделение — что включено */
  protected sub(r: EvMember): string {
    return [this.showW('pos') ? r.pos : '', this.showW('dep') ? r.dep : ''].filter(Boolean).join(' · ');
  }
  /** строка в виде полей: весь список (all) или открытая строка (row) */
  protected isEd(r: EvMember): boolean {
    return this.mEdit() === 'all' || this.edId() === r.id;
  }
  /** значения строки: в правке по строке — черновик */
  protected cur(r: EvMember): EvMember {
    return this.mEdit() === 'row' && this.edId() === r.id && this.draft() ? this.draft()! : r;
  }
  protected set(r: EvMember, patch: Partial<EvMember>): void {
    if (this.mEdit() === 'row') this.draft.update((d) => (d ? { ...d, ...patch } : d));
    else this.rows.update((l) => l.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
  }
  /** назначение ролей; роли из sole остаются только у этой строки */
  protected setRoles(r: EvMember, roles: string[]): void {
    const taken = roles.filter((x) => this.mSole().includes(x));
    if (!taken.length || this.mEdit() === 'row') {
      this.set(r, { roles });
      return;
    }
    this.rows.update((l) => l.map((x) => {
      if (x.id === r.id) return { ...x, roles };
      const next = x.roles.filter((role) => !taken.includes(role));
      return next.length === x.roles.length ? x : { ...x, roles: next };
    }));
  }
  protected flip(r: EvMember, k: 'main'): void {
    if (!this.isEd(r)) return;
    this.set(r, { [k]: !this.cur(r)[k] });
  }

  // ——— выбор участника: как в формах — фото, ФИО, должность; список с поиском ———
  protected readonly pick = signal<{ el: HTMLElement; r: EvMember; w: number } | null>(null);
  protected readonly pq = signal('');
  /** вкладки вида участника — только те, что есть в пуле */
  protected readonly pkinds = computed(() => {
    const p = this.pool();
    return PKINDS.filter((t) => t[0] === 'all' || p.some((x) => (x.kind || 'emp') === t[0]));
  });
  protected readonly pkind = signal('all');
  protected readonly found = computed(() => {
    const k = this.pick(), s = this.pq().trim().toLowerCase(), pk = this.pkind();
    if (!k) return [];
    const taken = this.rows().filter((x) => x.id !== k.r.id).map((x) => x.n);
    return this.pool().filter((x) => !taken.includes(x.n) && (pk === 'all' || (x.kind || 'emp') === pk) && (!s || (x.n + ' ' + x.pos).toLowerCase().includes(s)));
  });
  protected openPick(e: MouseEvent, r: EvMember): void {
    e.stopPropagation();
    if (this.pick()?.r.id === r.id) return this.pick.set(null);
    const el = e.currentTarget as HTMLElement;
    this.pq.set('');
    this.pkind.set('all');
    this.pick.set({ el, r, w: Math.max(520, el.offsetWidth) });
    setTimeout(() => document.querySelector<HTMLInputElement>('.evmpop .fsq')?.focus());
  }
  protected choose(p: Member): void {
    const k = this.pick();
    // тип — из реестра по виду участника
    if (k) this.set(k.r, { n: p.n, pos: p.pos, dep: p.dep, av: p.av, kind: p.kind, type: EVM_TYPE_OF[p.kind || 'emp'] });
    this.pick.set(null);
  }
  protected outside(e: Event): void {
    const t = e.target as HTMLElement;
    this.pick.set(null);
    // панель настроек закрывается кликом мимо нее и мимо ее выпадающих списков
    if (this.cfgOpen() && !t.closest('.evmcfg, .fpop, .evmcfgb')) this.cfgOpen.set(null);
  }

  protected add(): void {
    if (this.edId()) return;
    const r: EvMember = { id: 'em' + Date.now(), n: '', pos: '', av: 1, type: '', roles: [this.newRole() || this.roles().find((x) => x === 'Участник') || this.roles()[0] || ''].filter(Boolean), from: '30.09.2026' };
    const top = this.mAdd() === 'toolbar';
    this.rows.update((l) => (top ? [r, ...l] : [...l, r]));
    if (this.mEdit() === 'row') {
      this.edId.set(r.id);
      this.draft.set({ ...r });
      this.fresh.set(r.id);
    }
    // новая строка — на виду: наверху — первая страница, внизу — последняя (при ленивой загрузке — показываем все)
    queueMicrotask(() => {
      this.pg.page.set(top ? 0 : this.pg.pages() - 1);
      if (!top) this.shown.set(this.filtered().length);
    });
  }
  protected open(r: EvMember): void {
    this.cancel();
    this.edId.set(r.id);
    this.draft.set({ ...r });
  }
  protected save(): void {
    const d = this.draft();
    if (!d || !d.n) return;
    this.rows.update((l) => l.map((x) => (x.id === d.id ? d : x)));
    this.close();
  }
  protected cancel(): void {
    const f = this.fresh();
    if (f) this.rows.update((l) => l.filter((x) => x.id !== f));
    this.close();
  }
  private close(): void {
    this.edId.set(null);
    this.draft.set(null);
    this.fresh.set(null);
  }
  protected remove(r: EvMember): void {
    if (this.edId() === r.id) this.close();
    this.rows.update((l) => l.filter((x) => x.id !== r.id));
  }
}
