import { Injectable, computed, inject, signal } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import {
  GoalsStore,
  goalD8,
  goalDirOf,
  goalForm,
  goalGroup,
  goalLevel,
  goalNum,
  goalPeriodBy,
  goalPeriodOf,
  goalScaleDef,
  goalToday,
  goalTvDef,
  goalType,
} from '../../core/demo/goals-store.service';
import { GOAL_KINDS, GOAL_ME, GOAL_PEOPLE, GOAL_SCALES, GOAL_TXT_SCALE, MAP_PERIOD } from '../../data/goals.data';
import { GoalPerson, GoalTemplate, ProtoGoal } from '../../interface/goal';

const person = (n: string): GoalPerson => {
  const p = GOAL_PEOPLE.find((e) => e.n === n);
  return p ? { ...p } : { n, pos: '', av: 1 };
};
const isNum = (x: unknown) => String(x).trim() !== '' && !isNaN(+String(x).replace(',', '.'));

/** Состояние формы цели (glGoalPage): поля, измерение, участники. Общее для блоков страницы. */
@Injectable()
export class MygoalnewState {
  readonly store = inject(GoalsStore);
  readonly demo = inject(DemoState);

  readonly editId = signal<string | null>(null);
  readonly ed = computed<ProtoGoal | null>(() => this.store.goals().find((g) => g.id === this.editId()) || null);

  readonly tpl = signal('');
  readonly gt = signal('МВО');
  readonly lvl = signal('Индивидуальная');
  readonly grp = signal('');
  readonly t = signal('');
  readonly d = signal('');
  readonly per = signal('');
  readonly beg = signal('');
  readonly due = signal('');
  readonly w = signal('');
  readonly kind = signal('num');
  readonly u = signal('%');
  readonly plan = signal('');
  readonly fact = signal('');
  readonly sc = signal('Пятиуровневая (A–E)');
  readonly vals = signal<string[]>([]);
  readonly tv = signal<string[]>([]);
  readonly cu = signal('%');
  readonly exe = signal<GoalPerson>(person(GOAL_ME));
  readonly ppl = signal<GoalPerson[]>([]);
  /** демо: вид блока «Участники» — таблица или компактный */
  readonly pview = signal<'rows' | 'cmp'>('rows');
  /** демо: цель добавляют из карты целей — период наследуется и заблокирован */
  readonly fromMap = signal(true);
  readonly err = signal('');

  readonly pplSum = computed(() => this.ppl().reduce((a, p) => a + (+String(p.w ?? '').replace(',', '.') || 0), 0));
  readonly kindName = computed(() => GOAL_KINDS[this.kind()]);
  readonly rows = computed(() => GOAL_SCALES[this.sc()] || GOAL_SCALES['Пятиуровневая (A–E)']);

  /** заполнить форму: новая цель (уровень — по блоку «Добавить») или редактирование */
  init(id: string | null, lvl: string): void {
    this.editId.set(id);
    const ed = this.ed(), EF = ed ? goalForm(ed) : null, k = ed?.krs[0];
    const vals = EF && EF.kind === 'num' && !EF.txt ? [...(EF.vals || [])] : goalScaleDef('Пятиуровневая (A–E)', 'up');
    const per = this.fromMap() ? goalPeriodOf(ed) : ed?.['per'] ? goalPeriodBy(ed['per'] as string) : goalPeriodOf(ed);
    this.tpl.set('');
    this.gt.set(ed ? goalType(ed) : 'МВО');
    this.lvl.set(ed ? goalLevel(ed) : lvl || 'Индивидуальная');
    this.grp.set(ed ? goalGroup(ed) : '');
    this.t.set(ed?.t || '');
    this.d.set(ed?.d || '');
    this.per.set(per.n);
    this.beg.set((ed?.['beg'] as string) || per.from);
    this.due.set(ed?.due || per.to);
    this.w.set(ed?.w != null ? String(ed.w) : '');
    this.kind.set(EF ? EF.kind : 'num');
    this.u.set(EF?.u || (k?.u as string) || '%');
    this.plan.set(EF && EF.plan != null ? String(EF.plan) : '');
    this.fact.set(ed ? (ed.resF != null ? goalNum(ed.resF) : ed.self?.fact != null ? goalNum(ed.self.fact) : '') : '');
    this.sc.set(EF?.sc && GOAL_SCALES[EF.sc] ? EF.sc : 'Пятиуровневая (A–E)');
    this.vals.set(vals);
    this.tv.set([...(EF && EF.kind === 'txt' ? EF.vals || GOAL_TXT_SCALE : GOAL_TXT_SCALE)]);
    this.cu.set(EF?.cu || '%');
    this.exe.set(ed?.ppl ? { ...ed.ppl.exe } : { ...person(GOAL_ME), from: MAP_PERIOD.from, to: MAP_PERIOD.to });
    this.ppl.set(
      ed?.ppl ? ed.ppl.ev.map((p) => ({ ...p })) : [{ ...person('Федорова Юлия Сергеевна'), role: 'Руководитель', w: 100, from: MAP_PERIOD.from, to: MAP_PERIOD.to }],
    );
    this.err.set('');
  }

  /** период: без карты — даты по выбранному периоду */
  setPer(n: string): void {
    const P = goalPeriodBy(n);
    this.per.set(P.n);
    this.beg.set(P.from);
    this.due.set(P.to);
  }
  /** источник цели (демо): из карты — период текущей карты */
  setFromMap(v: boolean): void {
    this.fromMap.set(v);
    this.setPer(v ? goalPeriodOf(this.ed()).n : this.per());
  }
  setScale(sc: string): void {
    this.sc.set(sc);
    this.vals.set(goalScaleDef(sc, goalDirOf(this.vals())));
    this.tv.set(goalTvDef(sc));
  }
  applyTemplate(t: GoalTemplate): void {
    this.tpl.set(t.t);
    this.t.set(t.t);
    this.d.set(t.d);
    this.kind.set(t.kind);
    if (t.u) this.u.set(t.u);
    this.plan.set(t.plan || '');
    this.vals.set(t.vals ? [...t.vals] : goalScaleDef('Пятиуровневая (A–E)', 'up'));
  }

  /** проверка и сохранение; возвращает текст ошибки или сохраненную цель */
  save(asTpl: boolean): { error: string } | { goal: ProtoGoal; isNew: boolean; tplNew: boolean } {
    const ed = this.ed(), list = this.store.current();
    const rest = 100 - list.filter((g) => g.id !== ed?.id).reduce((a, g) => a + (+(g.w ?? 0) || 0), 0);
    const t = this.t().trim(), d = this.d().trim(), w = this.w().trim(), beg = this.beg().trim(), due = this.due().trim(), dt = /^\d{2}\.\d{2}\.\d{4}$/;
    const P = goalPeriodBy(this.per()), ppl = this.ppl(), kind = this.kind();
    const e = (error: string) => ({ error });
    if (!t) return e('Укажите наименование.');
    if (!/^\d+$/.test(w) || +w < 1 || +w > 100) return e('Укажите вес — целое число от 1 до 100.');
    if (+w > rest) return e('Вес больше остатка: осталось распределить ' + Math.max(0, rest) + '%.');
    if (!d) return e('Заполните описание.');
    if (!dt.test(beg) || !dt.test(due)) return e('Укажите даты начала и окончания в формате дд.мм.гггг.');
    if (goalD8(beg) > goalD8(due)) return e('Дата начала позже даты окончания.');
    if (goalD8(beg) < goalD8(P.from) || goalD8(due) > goalD8(P.to)) return e('Даты цели должны входить в период ' + P.n + ': ' + P.from + '–' + P.to + '.');
    if (!ppl.length) return e('Добавьте заказчика: руководителя, эксперта или команду.');
    if (ppl.some((p) => !p.n)) return e('Выберите заказчика в каждой строке или удалите пустую строку.');
    if (ppl.some((p) => !/^\d+$/.test(String(p.w)) || +(p.w ?? 0) < 1)) return e('Укажите вес каждого заказчика — целое число от 1 до 100.');
    if (this.pplSum() !== 100) return e('Сумма весов заказчиков — ' + this.pplSum() + '%, а должна быть 100%.');
    if (kind === 'num' && !this.vals().every(isNum)) return e('Заполните значения показателя для каждой оценки числами.');
    if (kind === 'txt' && this.tv().slice(0, this.rows().length || 5).some((x) => !String(x).trim())) return e('Заполните критерий достижения для каждой оценки.');
    if (kind === 'num' && this.plan().trim() !== '' && !isNum(this.plan())) return e('Укажите плановый результат числом.');
    const sc = this.sc(), lvl = this.lvl() || 'Индивидуальная', grp = this.grp(), gt = this.gt() || 'МВО';
    const form =
      kind === 'num'
        ? { kind: 'num', u: this.u(), sc, vals: [...this.vals()], dir: goalDirOf(this.vals()), cu: this.cu() || '%', plan: this.plan().trim() === '' ? undefined : +this.plan().replace(',', '.') }
        : kind === 'str'
          ? { kind: 'str', sc: 'Бинарная' }
          : { kind: 'txt', sc, tv: this.tv().map((x) => String(x).trim()) };
    const kr =
      kind === 'num'
        ? { t, m: this.u() === '%' ? 'pct' : 'num', s: 0, g: +String(this.vals()[2]).replace(',', '.'), c: 0, u: this.u(), w: 100, own: 'h1' }
        : { t: '', m: 'bin', s: 0, g: '', c: 0, u: '', w: 100, own: 'h1' };
    const people = { exe: { ...this.exe() }, ev: ppl.map((p) => ({ ...p, w: +(p.w ?? 0) })) };
    const type = lvl === 'Компания' ? 'company' : lvl === 'Подразделение' ? 'dept' : 'ind';
    const patch: Partial<ProtoGoal> = { t, d, w: +w, form, krs: [kr], due, beg, per: P.n, lvl, grp, ppl: people, gt, attrs: grp ? { group: grp } : undefined };
    let goal: ProtoGoal;
    if (ed) {
      this.store.update(ed.id, patch);
      goal = { ...ed, ...patch };
    } else {
      goal = {
        id: 'gn' + Date.now(),
        cr: goalToday(),
        au: GOAL_ME,
        par: null,
        own: 'h1',
        st: 'open',
        to: '30.09.2026',
        from: '01.07.2026',
        type,
        obj: 'Управление кредитования',
        cyc: 'h2',
        src: 'kr',
        vis: 'Вся компания',
        fe: [],
        ...patch,
      } as ProtoGoal;
      this.store.add(goal);
    }
    let tplNew = false;
    if (asTpl) {
      const T: GoalTemplate = { t, d, kind, u: kind === 'num' ? this.u() : '', plan: '', vals: kind === 'num' ? [...this.vals()] : null, gt, lvl, grp, au: GOAL_ME, cr: goalToday(), upd: goalToday() };
      const L = this.store.templates(), i = L.findIndex((x) => x.t === t);
      tplNew = i < 0;
      this.store.templates.set(i < 0 ? [T, ...L] : L.map((x, k) => (k === i ? T : x)));
    }
    return { goal, isNew: !ed, tplNew };
  }
}
