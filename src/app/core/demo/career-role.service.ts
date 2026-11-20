import { Injectable, computed, signal } from '@angular/core';
import { CP_POSITION_DESC, CP_WAYS } from '../../data/career-path.data';
import { CT_COMPS, CT_GRADES, CT_ROLE, CT_ROLE_DESC, CT_ROLES, CT_TPL_ROLE, ctNoGrade } from '../../data/career-track.data';
import { ORG } from '../../data/org.data';
import { EvMember, Member } from '../../interface/member';
import { PickPerson } from '../../shared/ui/emp-pick/emp-pick';

/** С чего открыть карточку в демо: пустая форма, действующая или уже недействующая должность. */
export type HrCardMode = 'create' | 'active' | 'inactive';

/** У должности два статуса: действует сразу после создания, не действует после удаления или по сроку. */
export type HrCardStatus = 'Действует' | 'Не действует';

export type HrWayKind = 'Курс' | 'Статья' | 'Книга' | 'Задача' | 'Мероприятие' | 'Тест';

export interface HrGrade {
  name: string;
  desc: string;
  exp: string;
  edu: string;
}

export interface HrComp {
  name: string;
  group: string;
  /** уровень по имени грейда; пусто — не требуется */
  levels: Record<string, string>;
}

export interface HrWay {
  id: string;
  comps: string[];
  title: string;
  kind: HrWayKind;
  grades: string[];
}

const PEOPLE = [
  'Волков Андрей Ильич',
  'Федорова Юлия Сергеевна',
  'Кузьмин Петр Иванович',
  'Попов Максим Андреевич',
  'Крылов Михаил Петрович',
  'Кравцова Елена Сергеевна',
  'Орлов Денис Викторович',
  'Лебедев Артем Сергеевич',
];

const kindOf = (icon: string): HrWayKind =>
  icon === 'book' ? 'Книга' : icon === 'mKb' ? 'Статья' : icon === 'video' ? 'Мероприятие' : icon === 'mQuiz' ? 'Тест' : icon === 'mTask' || icon === 'target' ? 'Задача' : 'Курс';

const orderGrades = (names: string[]) => CT_GRADES.filter((g) => names.includes(g));

/**
 * Карточка должности, которую HR собирает вместо дорожной карты.
 * Сотруднический трек этот сервис не меняет. Смена сценария в демо возвращает исходное наполнение.
 */
@Injectable({ providedIn: 'root' })
export class CareerRoleStore {
  readonly mode = signal<HrCardMode>('create');
  readonly status = signal<HrCardStatus>('Действует');
  readonly name = signal('');
  readonly desc = signal('');
  readonly leader = signal('');
  readonly experts = signal<string[]>([]);
  readonly grades = signal<HrGrade[]>([]);
  readonly comps = signal<HrComp[]>([]);
  readonly ways = signal<HrWay[]>([]);
  /** участники трека: лидер должности и эксперты. Сотрудники на должности сюда не входят */
  readonly members = signal<EvMember[]>([]);
  /** просмотр карточки; «Редактировать» открывает форму. Создание сразу форма. */
  readonly shaping = signal(false);
  /** карточка, сохраненная из сценария «Создание»: данные не подменяются пресетом, пока не сменят демо */
  readonly kept = signal(false);
  /** форма открыта как копия: смена должности меняет описание и набор грейдов, совпавшие поля, компетенции и участники остаются */
  readonly copied = signal(false);
  /** должности, которые в этой сессии перестали действовать. Из списка они не пропадают */
  readonly stopped = signal<string[]>([]);
  readonly form = computed(() => (this.mode() === 'create' && !this.kept()) || this.shaping());

  readonly gradeNames = computed(() => this.grades().map((g) => g.name));
  /** сотрудники кредитного специалиста: грейд и дата присвоения. На других должностях списка нет */
  readonly trackStaff = computed<EvMember[]>(() =>
    CT_ROLE.people.map((p) => {
      const n = ORG.find((x) => x.name === p.name);
      return { id: p.id, n: p.name, pos: n?.role || '', dep: n?.unit || p.unit, av: n?.av || 'av1', type: 'Сотрудник', roles: [p.grade], from: p.since };
    }),
  );
  readonly holders = computed<EvMember[]>(() => (this.name() === 'Кредитный специалист' ? this.trackStaff() : []));
  readonly people: PickPerson[] = PEOPLE.map((name) => {
    const n = ORG.find((x) => x.name === name);
    const av = Number(String(n?.av || 'av1').replace('av', '')) || 1;
    return { name, post: n?.role || '', av };
  });
  readonly personNames = PEOPLE;
  readonly memberPool: Member[] = ORG.filter((x) => x.name.includes(' ')).map((x) => ({ n: x.name, pos: x.role, dep: x.unit, av: x.av || 'av1' }));
  readonly gradeCatalog = CT_GRADES;
  readonly compCatalog = CT_COMPS;

  private seq = 1;

  constructor() {
    this.load('create');
  }

  setMode(mode: HrCardMode): void {
    this.shaping.set(false);
    this.kept.set(false);
    this.copied.set(false);
    this.mode.set(mode);
    this.load(mode);
    this.stopped.update((ids) => {
      const rest = ids.filter((id) => id !== 'new' && id !== CT_TPL_ROLE);
      return mode === 'inactive' ? [...rest, CT_TPL_ROLE] : rest;
    });
  }

  /** создание: карточка остается с введенными данными и сразу действует */
  keep(): void {
    this.shaping.set(false);
    this.kept.set(true);
    this.status.set('Действует');
    this.mode.set('active');
  }

  /** удаление: должность перестает действовать, карточка и строка списка остаются */
  deactivate(id?: string): void {
    const key = id || CT_ROLES.find((r) => r.name === this.name())?.id || (this.kept() ? 'new' : '');
    if (key) this.stopped.update((ids) => (ids.includes(key) ? ids : [...ids, key]));
    const role = id ? CT_ROLES.find((r) => r.id === id) : undefined;
    const live = !id || id === 'new' || (!!role && role.name === this.name() && !(this.mode() === 'create' && !this.kept()));
    if (live) {
      this.status.set('Не действует');
      this.mode.set('inactive');
      this.shaping.set(false);
      this.kept.set(true);
    }
  }

  setGrades(names: string[]): void {
    const prev = this.grades();
    this.grades.set(orderGrades(names).map((name) => prev.find((g) => g.name === name) || { name, desc: '', exp: '', edu: '' }));
  }

  /** карточка грейда из сайдбара: новый встает в порядок справочника, повторное сохранение обновляет поля */
  addGrade(g: HrGrade): void {
    const names = this.gradeNames().includes(g.name) ? this.gradeNames() : [...this.gradeNames(), g.name];
    const prev = this.grades();
    this.grades.set(orderGrades(names).map((name) => (name === g.name ? { ...g, name } : prev.find((x) => x.name === name) || { name, desc: '', exp: '', edu: '' })));
  }

  removeGrade(name: string): void {
    this.setGrades(this.gradeNames().filter((n) => n !== name));
  }

  patchGrade(name: string, patch: Partial<HrGrade>): void {
    this.grades.update((list) => list.map((g) => (g.name === name ? { ...g, ...patch } : g)));
  }

  addComps(names: string[]): void {
    const have = new Set(this.comps().map((c) => c.name));
    const add = CT_COMPS.filter((c) => names.includes(c.name) && !have.has(c.name)).map((c) => ({ name: c.name, group: c.group, levels: {} }));
    this.comps.update((list) => [...list, ...add]);
  }

  removeComp(name: string): void {
    this.comps.update((list) => list.filter((c) => c.name !== name));
    this.ways.update((list) =>
      list.flatMap((w) => {
        const comps = w.comps.filter((c) => c !== name);
        return comps.length ? [{ ...w, comps }] : [];
      }),
    );
  }

  setLevel(comp: string, grade: string, level: string): void {
    this.comps.update((list) => list.map((c) => (c.name === comp ? { ...c, levels: { ...c.levels, [grade]: level } } : c)));
  }

  saveWay(way: Omit<HrWay, 'id'> & { id?: string }): void {
    if (way.id) {
      const id = way.id;
      this.ways.update((list) => list.map((w) => (w.id === id ? { ...way, id } : w)));
      return;
    }
    const id = 'w' + ++this.seq;
    this.ways.update((list) => [...list, { ...way, id }]);
  }

  removeWay(id: string): void {
    this.ways.update((list) => list.filter((w) => w.id !== id));
  }

  /** форма создания, заполненная данными выбранной должности */
  copyFrom(name: string): void {
    const live = this.name() === name && !(this.mode() === 'create' && !this.kept());
    const snap = live ? this.snapshot() : null;
    this.copied.set(true);
    this.shaping.set(false);
    this.kept.set(false);
    this.mode.set('create');
    this.status.set('Действует');
    if (snap) this.restore(snap);
    else this.fromSample(name);
    this.name.set(name);
  }

  /**
   * Смена должности в копии: описание и набор грейдов — от новой должности.
   * Грейд с тем же именем сохраняет поля образца. Компетенции и участники не трогаем.
   */
  applyPost(name: string): void {
    const role = CT_ROLES.find((r) => r.name === name);
    if (!role) return;
    const prev = this.grades();
    this.name.set(role.name);
    this.desc.set(this.roleDesc(role.id));
    this.grades.set(
      this.gradesOf(role.id).map((g) => {
        const was = prev.find((x) => x.name === g.name);
        return was ? { name: g.name, desc: was.desc, exp: was.exp, edu: was.edu } : g;
      }),
    );
  }

  /** форма создания: подставить должность из справочника как основу */
  fromSample(name: string): void {
    const role = CT_ROLES.find((r) => r.name === name);
    if (!role) return;
    const full = role.id === CT_TPL_ROLE;
    this.name.set(role.name);
    this.desc.set(this.roleDesc(role.id));
    this.leader.set(role.leader);
    const experts = full ? CT_ROLE.people.filter((p) => p.tag === 'Эксперт').map((p) => p.name) : [];
    this.experts.set(experts);
    this.grades.set(this.gradesOf(role.id));
    this.comps.set(
      full
        ? CT_ROLE.comps.map((c) => ({
            name: c.name,
            group: c.group,
            levels: Object.fromEntries(CT_GRADES.map((g, i) => [g, c.levels[i] || ''])),
          }))
        : [],
    );
    this.ways.set(full ? this.waysOfRole() : []);
    const rows: EvMember[] = [];
    if (role.leader) rows.push(this.personRow(role.leader, 'Лидер должности'));
    for (const n of experts) rows.push(this.personRow(n, 'Эксперт'));
    this.members.set(rows);
  }

  private snapshot() {
    return {
      desc: this.desc(),
      leader: this.leader(),
      experts: [...this.experts()],
      grades: this.grades().map((g) => ({ ...g })),
      comps: this.comps().map((c) => ({ ...c, levels: { ...c.levels } })),
      ways: this.ways().map((w) => ({ ...w, comps: [...w.comps], grades: [...w.grades] })),
      members: this.members().map((m) => ({ ...m, roles: [...m.roles] })),
    };
  }

  private restore(snap: ReturnType<CareerRoleStore['snapshot']>): void {
    this.desc.set(snap.desc);
    this.leader.set(snap.leader);
    this.experts.set(snap.experts);
    this.grades.set(snap.grades);
    this.comps.set(snap.comps);
    this.ways.set(snap.ways);
    this.members.set(snap.members);
  }

  private roleDesc(id: string): string {
    return id === CT_TPL_ROLE ? CT_ROLE.desc : CT_ROLE_DESC[id] || '';
  }

  /** грейды, привязанные к должности. Без лестницы — пусто, у шаблона — заполненные требования */
  private gradesOf(id: string): HrGrade[] {
    if (ctNoGrade(id)) return [];
    return CT_GRADES.map((name) => {
      if (id !== CT_TPL_ROLE) return { name, desc: '', exp: '', edu: '' };
      const x = CT_ROLE.grades.find((row) => row.grade === name);
      return x ? { name, desc: x.desc, exp: x.exp, edu: x.edu } : { name, desc: '', exp: '', edu: '' };
    });
  }

  private load(mode: HrCardMode): void {
    if (mode === 'create') {
      this.status.set('Действует');
      this.name.set('');
      this.desc.set('');
      this.leader.set('');
      this.experts.set([]);
      this.grades.set([]);
      this.comps.set([]);
      this.ways.set([]);
      this.members.set([]);
      return;
    }
    this.status.set(mode === 'inactive' ? 'Не действует' : 'Действует');
    this.name.set('Кредитный специалист');
    this.desc.set(CP_POSITION_DESC);
    this.leader.set('Волков Андрей Ильич');
    this.experts.set(['Кузьмин Петр Иванович', 'Попов Максим Андреевич']);
    this.grades.set(
      CT_GRADES.map((name) => {
        const g = CT_ROLE.grades.find((x) => x.grade === name);
        return g ? { name, desc: g.desc, exp: g.exp, edu: g.edu } : { name, desc: '', exp: '', edu: '' };
      }),
    );
    this.comps.set(
      CT_ROLE.comps.map((c) => ({
        name: c.name,
        group: c.group,
        levels: Object.fromEntries(CT_GRADES.map((g, i) => [g, c.levels[i] || ''])),
      })),
    );
    this.ways.set(this.waysOfRole());
    const rows: EvMember[] = [];
    if (this.leader()) rows.push(this.personRow(this.leader(), 'Лидер должности'));
    for (const name of this.experts()) rows.push(this.personRow(name, 'Эксперт'));
    this.members.set(rows);
  }

  private personRow(name: string, role: string): EvMember {
    const n = ORG.find((x) => x.name === name);
    return { id: name, n: name, pos: n?.role || '', dep: n?.unit, av: n?.av || 'av1', type: 'Сотрудник', roles: [role], from: '01.09.2026' };
  }

  private waysOfRole(): HrWay[] {
    const out: HrWay[] = [];
    for (const [comp, list] of Object.entries(CP_WAYS)) {
      list.forEach((w, i) => out.push({ id: comp + ':' + i, comps: [comp], title: w.title, kind: kindOf(w.icon), grades: [...w.grades] }));
    }
    return out;
  }
}
