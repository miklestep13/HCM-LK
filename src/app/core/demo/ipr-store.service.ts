import { Injectable, computed, signal } from '@angular/core';
import {
  IPR_EMPLOYEES,
  IPR_GRADE_NEXT,
  IPR_LEVELS,
  IPR_COMP_CATALOG,
  IPR_ME,
  IPR_MOVED_COMMENT,
  IPR_PERIOD_END,
  IPR_ROLE_GEN,
  IPR_TEMPLATE_TASKS,
  IPR_TODAY,
} from '../../data/ipr.data';
import { IprComment, IprComp, IprNewForm, IprPlan, IprRate, IprStatus, IprTask, IprTaskStatus } from '../../interface/ipr';

/** состояние страницы ИПР в демо: статус плана, «Нет ИПР» или «Создание» */
export type IprDemoStatus = IprStatus | 'none' | 'new';
/** демо-сценарий наполнения плана */
export type IprFill = 'full' | 'new' | 'notasks' | 'nocomps';

export const dNum = (d: string) => {
  const [a, b, c] = (d || '').split('.');
  return +(c + b + a) || 0;
};
export const iprPl = (n: number, one: string, few: string, many: string) =>
  n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;
export const iprDefName = (role: string) => 'План развития ' + (IPR_ROLE_GEN[role] || (role || 'сотрудника').toLowerCase());
export const iprTaskSt = (t: IprTask): IprTaskStatus => (t.done ? 'Выполнено' : dNum(t.due) < dNum(IPR_TODAY) ? 'Просрочено' : 'В работе');
/** порядок задач: просроченные → в работе → выполненные, внутри — по сроку */
export const iprSortTasks = (T: IprTask[]) => {
  const rank = (t: IprTask) => (t.done ? 2 : iprTaskSt(t) === 'Просрочено' ? 0 : 1);
  return T.map((t, i) => ({ t, i })).sort((a, b) => rank(a.t) - rank(b.t) || dNum(a.t.due) - dNum(b.t.due));
};
/** уровни компетенции: из плана или из справочника (цель — на ступень выше текущего) */
export const iprCatLevels = (name: string): [string, string] | null => {
  const c = IPR_COMP_CATALOG.find((x) => x.name === name);
  return c ? [c.cur, IPR_LEVELS[Math.min(IPR_LEVELS.indexOf(c.cur) + 1, 3)]] : null;
};
/** компетенции плана + компетенции из задач, которых нет в списке */
export const iprCompsWithTasks = (base: IprComp[], tasks: IprTask[]): IprComp[] => {
  const L = [...base];
  tasks.forEach((t) =>
    t.comps.forEach((n) => {
      if (L.some((c) => c.name === n)) return;
      const lv = iprCatLevels(n) || ['Специалист', 'Старший'];
      L.push({ name: n, req: 'Рекомендуемая', cur: lv[0], target: lv[1] });
    }),
  );
  return L;
};
/** цель нового плана по сотруднику и виду развития */
export const iprNewTarget = (emp: string, kind: string) => {
  const d = IPR_EMPLOYEES[emp] || ['—', 'Специалист'];
  return {
    role:
      kind === 'В кадровый резерв'
        ? 'Руководитель группы'
        : kind === 'Ротация'
          ? 'Менеджер продукта'
          : kind === 'В дополнительной роли'
            ? 'Наставник'
            : d[0],
    grade: /повышением грейда|резерв/.test(kind) ? IPR_GRADE_NEXT[d[1]] : d[1],
  };
};
export const iprNeedsExpert = (kind: string) => kind === 'В основной роли с повышением грейда';

const clone = <T>(x: T): T => structuredClone(x);
const newForm = (): IprNewForm => ({
  emp: 'Иванов Павел Сергеевич',
  per: '4FQ2026',
  kind: 'В основной роли',
  expert: '',
  role: '',
  roleTouched: false,
  grade: '',
  gradeTouched: false,
  tpl: '',
  desc: '',
});

/**
 * Демо-хранилище ИПР сотрудника: текущий план, статус, сценарий наполнения, оценки задач на аттестации.
 * Используется страницей «ИПР», виджетом «ИПР» на обзоре и бланком аттестации.
 */
@Injectable({ providedIn: 'root' })
export class IprStore {
  readonly plan = signal<IprPlan>(clone(IPR_ME));
  readonly status = signal<IprStatus>('Утверждено');
  readonly none = signal(false);
  /** состояние «Создание»: форма нового ИПР на странице */
  readonly nf = signal<IprNewForm | null>(null);
  readonly fill = signal<IprFill>('full');
  /** компетенции черновика (в черновике список пуст, пока их не добавят или не свяжут с задачей) */
  readonly draftComps = signal<IprComp[]>([]);
  /** кто смотрит план на аттестации */
  readonly arole = signal<'mgr' | 'emp'>('mgr');
  /** оценки задач на аттестации: индекс задачи → оценка */
  readonly att = signal<Record<number, IprRate>>({});
  /** комментарии к задачам на аттестации */
  readonly comments = signal<Record<number, IprComment[]>>(this.initComments());
  /** раскрытые карточки задач */
  readonly open = signal(new Set<number>());

  private orig: { tasks: IprTask[]; comps: IprComp[] } | null = null;
  private bak: { plan: IprPlan; status: IprStatus; none: boolean; dc: IprComp[] } | null = null;

  readonly creating = computed(() => !!this.nf() && !this.none());
  /** статус для отображения («Создание» ведет себя как черновик) */
  readonly st = computed<IprStatus>(() => (this.creating() ? 'Черновик' : this.status()));
  readonly demoStatus = computed<IprDemoStatus>(() => (this.none() ? 'none' : this.nf() ? 'new' : this.status()));
  readonly editable = computed(() => this.st() === 'Черновик' || this.st() === 'Утверждено');
  readonly comps = computed(() => {
    const raw = this.status() === 'Черновик' || this.creating() ? this.draftComps() : this.plan().comps;
    return this.fill() === 'nocomps' ? raw : iprCompsWithTasks(raw, this.plan().tasks);
  });
  readonly doneN = computed(() => this.plan().tasks.filter((t) => t.done).length);
  readonly progress = computed(() => {
    const T = this.plan().tasks;
    return T.length ? Math.round((this.doneN() / T.length) * 100) : 0;
  });
  readonly over = computed(
    () => (this.st() === 'Утверждено' || this.st() === 'В работе') && this.plan().tasks.some((t) => !t.done && dNum(t.due) < dNum(IPR_TODAY)),
  );
  readonly attN = computed(() => this.plan().tasks.filter((_, i) => this.att()[i]).length);
  readonly isMgr = computed(() => this.arole() === 'mgr');
  /** предварительный итог аттестации по оценкам задач */
  readonly attResult = computed<IprStatus>(() => {
    const v = this.plan().tasks.map((_, i) => this.att()[i]);
    return v.every((x) => x === 'done') ? 'Выполнено' : v.every((x) => x === 'no') ? 'Не выполнено' : 'Выполнено частично';
  });

  private initComments(): Record<number, IprComment[]> {
    const i = IPR_ME.tasks.findIndex((t) => t.moved);
    return i < 0 ? {} : { [i]: [IPR_MOVED_COMMENT] };
  }

  /** демо: статус плана, «Нет ИПР» или «Создание» */
  setDemo(v: IprDemoStatus): void {
    if (v === 'new') return this.startNew();
    if (this.nf()) this.cancelNew();
    if (v === 'none') this.none.set(true);
    else {
      this.none.set(false);
      this.status.set(v);
    }
  }
  setStatus(s: IprStatus): void {
    this.setDemo(s);
  }

  /** демо-сценарий наполнения: подменяет задачи и компетенции текущего плана */
  setFill(k: IprFill): void {
    const P = this.plan();
    if (!this.orig) this.orig = { tasks: P.tasks, comps: P.comps };
    this.fill.set(k);
    this.plan.set({
      ...P,
      tasks: k === 'new' || k === 'notasks' ? [] : this.orig.tasks,
      comps: k === 'new' || k === 'nocomps' ? [] : this.orig.comps,
    });
    if (k === 'new' || k === 'nocomps') this.draftComps.set([]);
    if (k === 'new') this.status.set('Черновик');
    else if (this.status() === 'Черновик') this.status.set('Утверждено');
  }

  /* ——— создание ИПР на странице ——— */
  startNew(): void {
    if (!this.bak) {
      this.bak = { plan: this.plan(), status: this.status(), none: this.none(), dc: this.draftComps() };
      this.plan.update((p) => ({ ...p, tasks: [] }));
      this.draftComps.set([]);
      this.open.set(new Set());
      this.nf.set(newForm());
    }
    this.none.set(false);
  }
  cancelNew(): void {
    const b = this.bak;
    if (!b) return;
    this.plan.set(b.plan);
    this.status.set(b.status);
    this.none.set(b.none);
    this.draftComps.set(b.dc);
    this.bak = null;
    this.nf.set(null);
  }
  patchNew(p: Partial<IprNewForm>): void {
    this.nf.update((f) => (f ? { ...f, ...p } : f));
  }
  /** шаблон в форме нового ИПР подставляет типовой набор задач */
  applyTemplate(tpl: string): void {
    const F = this.nf();
    if (!F) return;
    this.patchNew({ tpl, desc: tpl && !F.desc ? 'Типовой план «' + tpl + '»: базовый набор заданий по роли, срок — до конца периода.' : F.desc });
    this.plan.update((p) => ({ ...p, tasks: tpl ? clone(IPR_TEMPLATE_TASKS) : [] }));
  }
  /** «Создать»: новый план в статусе «Черновик»; false — не хватает данных */
  saveNew(): 'emp' | 'expert' | null {
    const F = this.nf();
    if (!F) return null;
    if (!F.emp.trim()) return 'emp';
    if (iprNeedsExpert(F.kind) && !F.expert.trim()) return 'expert';
    const t = iprNewTarget(F.emp, F.kind);
    const tRole = F.roleTouched ? F.role : t.role;
    this.plan.update((P) => ({
      ...P,
      kind: F.kind,
      per: F.per,
      due: IPR_PERIOD_END[F.per] || P.due,
      desc: F.desc,
      tRole,
      tGrade: F.gradeTouched ? F.grade : t.grade,
      tpl: F.tpl,
      created: IPR_TODAY,
      author: 'Иванов Павел Сергеевич',
      expert: iprNeedsExpert(F.kind) ? F.expert.trim() : '',
      name: iprDefName(tRole),
    }));
    this.bak = null;
    this.orig = null;
    this.fill.set('full');
    this.nf.set(null);
    this.status.set('Черновик');
    return null;
  }

  /** параметры плана (сайдбар «Редактирование ИПР») */
  savePlan(p: Partial<IprPlan>): void {
    this.plan.update((P) => ({ ...P, ...p }));
  }

  /* ——— задачи ——— */
  saveTask(i: number, t: IprTask): void {
    this.plan.update((P) => ({ ...P, tasks: i >= 0 ? P.tasks.map((x, k) => (k === i ? t : x)) : [...P.tasks, t] }));
  }
  removeTask(i: number): void {
    this.plan.update((P) => ({ ...P, tasks: P.tasks.filter((_, k) => k !== i) }));
  }
  addComps(names: string[]): void {
    const add = names.map((n) => {
      const lv = iprCatLevels(n)!;
      return { name: n, req: 'Рекомендуемая', cur: lv[0], target: lv[1] };
    });
    if (this.status() === 'Черновик' || this.creating()) this.draftComps.update((L) => [...L, ...add]);
    else this.plan.update((P) => ({ ...P, comps: [...P.comps, ...add] }));
  }
  toggleOpen(i: number): void {
    this.open.update((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  /* ——— аттестация ——— */
  setRate(i: number, v: IprRate): void {
    this.att.update((A) => {
      const n = { ...A };
      if (n[i] === v) delete n[i];
      else n[i] = v;
      return n;
    });
  }
  /** нужен ли комментарий руководителя к оценке («частично» и «не выполнена» без пояснения) */
  needsWhy(i: number): boolean {
    const a = this.att()[i];
    return !!a && a !== 'done' && !(this.comments()[i] || []).some((m) => m.who === 'mgr');
  }
  addComment(i: number, text: string): void {
    const c: IprComment = { who: this.isMgr() ? 'mgr' : 'emp', at: IPR_TODAY + ', 12:00', text };
    this.comments.update((C) => ({ ...C, [i]: [...(C[i] || []), c] }));
  }
}
