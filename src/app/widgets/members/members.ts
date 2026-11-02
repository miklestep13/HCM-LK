import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, linkedSignal, model, output, signal } from '@angular/core';
import { avCls } from '../../data/people.data';
import { Member, MemberEdit, MemberField, MemberView } from '../../interface/member';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { EmpPick, PickPerson } from '../../shared/ui/emp-pick/emp-pick';
import { Field } from '../../shared/ui/field/field';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../shared/ui/float/float';
import { Icon } from '../../shared/ui/icon/icon';
import { Select } from '../../shared/ui/select/select';
import { ViewMode, ViewSwitch } from '../../shared/ui/view-switch/view-switch';

/**
 * «Участники» — единый виджет для форм и страниц (сообщество, добавление цели). Настройки задаются в коде и в интерфейсе не видны:
 *   edit   — ввод: 'none' (просмотр), 'inline' (правка прямо в списке), 'drawer' (добавление в сайдбаре; у каждого участника — «Редактировать» (сайдбар) и «Убрать»);
 *   view   — вывод: 'cards', 'table' или 'both' (переключатель «Карточки / Таблица» в шапке; start — вид по умолчанию);
 *   fields — наполнение: 'av' (аватар), 'name' (ФИО), 'pos' (должность), 'role' (роль), 'w' (вес — только для цели).
 *   <app-members edit="drawer" view="both" start="cards" [fields]="['av', 'name', 'pos', 'role']" [roles]="roles" [pool]="people" [(people)]="list" />
 * Карточки — как в виджете «Коллеги» на главной: фото 64, ФИО, должность, роль серым бейджем.
 * toolbar — шапка с поиском и фильтрами (должность, подразделение, роль) над списком; без нее виджет — просто список (форма цели).
 * plainRole — роль по умолчанию («Участник»); роль у всех — бейджем, цвет — roleTone (иначе серый).
 * В пуле могут быть подразделения и команды (kind: 'dep' | 'team'): в списке выбора появляются вкладки
 * «Все / Сотрудники / Подразделения / Команды», у группы вместо фото — значок группы.
 */
@Component({
  selector: 'app-members',
  imports: [NgTemplateOutlet, Drawer, EmpPick, Field, FilterBar, Float, Icon, Select, ViewSwitch],
  templateUrl: './members.html',
  styleUrl: './members.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-members', '[class.ro]': "edit() === 'none'", '(document:click)': 'pick.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Members {
  readonly people = model.required<Member[]>();
  readonly edit = input<MemberEdit>('none');
  readonly view = input<MemberView>('both');
  readonly start = input<ViewMode>('cards');
  readonly fields = input<MemberField[]>(['av', 'name', 'pos', 'role']);
  /** роли для выбора */
  readonly roles = input<string[]>([]);
  readonly plainRole = input('');
  /** в таблице сначала участники с этими ролями (в этом порядке), например администраторы */
  readonly lead = input<string[]>([]);
  /** цвет бейджа роли — класс .bdg: { 'Лидер сообщества': 'info' } (ok, warn, dg, info, tq, vt); не указано — серый */
  readonly roleTone = input<Record<string, string>>({});
  /** кого можно добавить */
  readonly pool = input<Member[]>([]);
  readonly toolbar = input(false);
  /** панель фильтров и таблица — внутри одной карточки (без своих карточек), например под заголовком блока */
  readonly flat = input(false);
  /** записей таблицы на странице; 0 — без постраничного вывода */
  readonly pageSize = input(0);
  /** кнопка «Добавить» в шапке (по умолчанию — когда список можно менять) */
  readonly canAdd = input<boolean | null>(null);
  readonly addTitle = input('Добавление участников');
  readonly empty = input('Участник не найден. Проверьте написание фамилии или сбросьте фильтры.');
  /** подпись под ФИО (по умолчанию — должность) */
  readonly sub = input<(m: Member) => string>((m) => m.pos);
  /** цвет точки у роли (например, цвет доли в полосе весов цели); null — серая */
  readonly dot = input<((m: Member, i: number) => string | null) | null>(null);
  /** клик по участнику в режиме просмотра (например, профиль) */
  readonly opened = output<Member>();
  readonly added = output<Member[]>();
  readonly removed = output<Member>();

  /** портрет; у подразделения и команды — значок группы */
  protected readonly av = (m: Member) => (m.kind ? 'mbgrp' : avCls(m.n, m.av));
  protected readonly has = (f: MemberField) => this.fields().includes(f);
  protected readonly noW = (m: Member) => m.w == null || m.w === '';
  protected readonly mode = linkedSignal<ViewMode>(() => (this.view() === 'both' ? this.start() : (this.view() as ViewMode)));
  protected readonly adding = computed(() => this.canAdd() ?? this.edit() !== 'none');

  // фильтры шапки
  protected readonly q = signal('');
  protected readonly fPos = signal('');
  protected readonly fDep = signal('');
  protected readonly fRole = signal('');
  private readonly uniq = (k: 'pos' | 'dep' | 'role') =>
    computed(() => [...new Set(this.people().map((m) => m[k] || '').filter(Boolean))].sort((x, y) => x.localeCompare(y, 'ru')));
  protected readonly posOpts = this.uniq('pos');
  protected readonly depOpts = this.uniq('dep');
  protected readonly roleOpts = computed(() => (this.roles().length ? this.roles() : this.uniq('role')()));

  /** строки с исходным индексом — правка идет по нему и при включенных фильтрах */
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(), p = this.fPos(), d = this.fDep(), r = this.fRole();
    return this.people()
      .map((m, i) => ({ m, i }))
      .filter(
        ({ m }) =>
          (!q || (m.n + ' ' + m.pos + ' ' + (m.dep || '')).toLowerCase().includes(q)) &&
          (!p || m.pos === p) &&
          (!d || m.dep === d) &&
          (!r || (m.role || this.plainRole()) === r),
      );
  });
  /** строки таблицы: новая незаполненная — первой, закрепленные (исполнитель цели), затем роли из lead, остальные — в исходном порядке */
  protected readonly tableRows = computed(() => {
    const L = this.lead(), rank = (m: Member) => (!m.n ? -2 : m.lock ? -1 : L.includes(m.role || '') ? L.indexOf(m.role || '') : L.length);
    return [...this.rows()].sort((x, y) => rank(x.m) - rank(y.m) || x.i - y.i);
  });
  /** страница таблицы: при смене фильтров — первая */
  protected readonly page = linkedSignal({ source: () => this.tableRows().length + '|' + this.q(), computation: () => 0 });
  protected readonly pages = computed(() => Array.from({ length: Math.ceil(this.tableRows().length / (this.pageSize() || 1)) }, (_, i) => i));
  protected readonly pageFrom = computed(() => (this.pageSize() ? Math.min(this.page(), Math.max(0, this.pages().length - 1)) * this.pageSize() : 0));
  protected readonly paged = computed(() => (this.pageSize() ? this.tableRows().slice(this.pageFrom(), this.pageFrom() + this.pageSize()) : this.tableRows()));
  protected readonly cols = computed(() =>
    ['minmax(260px,480px)', this.has('role') ? '200px' : '', this.has('w') ? '112px' : '', this.edit() !== 'none' ? '1fr' : ''].filter(Boolean).join(' '),
  );

  protected dotOf(m: Member, i: number): string | null {
    return m.lock ? null : (this.dot()?.(m, i) ?? null);
  }
  /** роль бейджем — у всех (по умолчанию «Участник»); цвет — из roleTone, иначе серый */
  protected badge(m: Member): string {
    return m.role || this.plainRole();
  }
  protected tone(m: Member): string {
    return this.roleTone()[this.badge(m)] || '';
  }

  // правка списка
  protected patch(i: number, x: Partial<Member>): void {
    this.people.update((l) => l.map((m, k) => (k === i ? { ...m, ...x } : m)));
  }
  protected setW(i: number, e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/[^\d]/g, '').slice(0, 3);
    this.patch(i, { w: el.value });
  }
  protected remove(i: number): void {
    const m = this.people()[i];
    this.people.update((l) => l.filter((_, k) => k !== i));
    this.removed.emit(m);
  }

  // inline: выбор сотрудника в строке
  protected readonly pick = signal<{ el: HTMLElement; i: number; w: number } | null>(null);
  protected readonly pq = signal('');
  /** вкладки списка выбора — если в пуле есть подразделения или команды */
  protected readonly pkinds = computed(() => {
    const p = this.pool(), k: [string, string][] = [['all', 'Все'], ['emp', 'Сотрудники']];
    if (p.some((x) => x.kind === 'dep')) k.push(['dep', 'Подразделения']);
    if (p.some((x) => x.kind === 'team')) k.push(['team', 'Команды']);
    return k.length > 2 ? k : [];
  });
  protected readonly pkind = signal('all');
  protected readonly found = computed(() => {
    const k = this.pick(), s = this.pq().trim().toLowerCase(), pk = this.pkind();
    if (!k) return [];
    const skip = this.people().filter((_, j) => j !== k.i).map((m) => m.n);
    return this.pool().filter(
      (x) => !skip.includes(x.n) && (pk === 'all' || (x.kind || 'emp') === pk) && (!s || (x.n + ' ' + x.pos).toLowerCase().includes(s)),
    );
  });
  protected openPick(e: Event, i: number): void {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    if (this.pick()?.i === i) return this.pick.set(null);
    this.pq.set('');
    this.pkind.set('all');
    this.pick.set({ el, i, w: Math.max(480, el.offsetWidth) });
  }
  protected choose(x: Member): void {
    // новый человек в той же строке: роль, вес и прочие поля строки (например, период цели) остаются, сведения о человеке — новые
    const k = this.pick()!,
      { n, pos, dep, av, team, kind, cnt, ...row } = this.people()[k.i] as Member & { team?: unknown };
    this.people.update((l) => l.map((m, j) => (j === k.i ? { ...row, ...x } : m)));
    this.pick.set(null);
  }

  // drawer: добавление и правка
  protected readonly drw = signal<'add' | number | null>(null);
  protected readonly dOpen = computed(() => this.drw() !== null);
  protected readonly dNames = signal<string[]>([]);
  protected readonly dRole = signal('');
  protected readonly dW = signal('');
  protected readonly dErr = signal('');
  protected readonly dCur = computed(() => {
    const k = this.drw();
    return typeof k === 'number' ? this.people()[k] : null;
  });
  protected readonly free = computed<PickPerson[]>(() => {
    const in_ = new Set(this.people().map((m) => m.n));
    return this.pool()
      .filter((x) => !in_.has(x.n))
      .map((x) => ({ name: x.n, post: x.pos, av: typeof x.av === 'number' ? x.av : 1 }));
  });
  /** правка в строке: «Добавить» в шапке — пустая строка первой, сотрудник выбирается в ней */
  protected addRow(): void {
    this.q.set('');
    this.people.set([{ n: '', pos: '', av: 0, role: this.plainRole() || this.roles()[0] || '' }, ...this.people()]);
  }
  protected openAdd(): void {
    if (this.edit() === 'inline') return;
    this.dNames.set([]);
    this.dRole.set(this.plainRole() || this.roles()[0] || '');
    this.dW.set('');
    this.dErr.set('');
    this.drw.set('add');
  }
  protected click(m: Member, i: number): void {
    if (this.edit() === 'drawer' && !m.lock) {
      this.dRole.set(m.role || this.plainRole());
      this.dW.set(m.w != null ? String(m.w) : '');
      this.dErr.set('');
      this.drw.set(i);
    } else if (this.edit() === 'none') this.opened.emit(m);
  }
  protected setDrw(v: boolean): void {
    if (!v) this.drw.set(null);
  }
  protected save(): void {
    const k = this.drw(), w = this.dW().trim();
    if (this.has('w') && w && !/^\d{1,3}$/.test(w)) return this.dErr.set('Укажите вес — целое число от 1 до 100.');
    const extra: Partial<Member> = { ...(this.has('role') ? { role: this.dRole() } : {}), ...(this.has('w') ? { w } : {}) };
    if (k === 'add') {
      const names = this.dNames();
      if (!names.length) return this.dErr.set('Выберите хотя бы одного сотрудника.');
      const list = names.map((n) => ({ ...this.pool().find((x) => x.n === n)!, ...extra }));
      this.people.update((l) => [...l, ...list]);
      this.added.emit(list);
    } else if (typeof k === 'number') this.patch(k, extra);
    this.drw.set(null);
  }
}
