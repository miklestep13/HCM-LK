import { Injectable, computed, inject, signal } from '@angular/core';
import {
  GOAL_ANCESTORS,
  GOAL_EV_CM,
  GOAL_GROUP_OF,
  GOAL_GROUPS,
  GOAL_LEVELS,
  GOAL_PERIODS,
  GOAL_SCALE_DEF,
  GOAL_LEVEL_ORDER,
  GOAL_ME,
  GOAL_PEOPLE,
  GOAL_SCALE,
  GOAL_SCALES,
  GOAL_SELF_DEMO_CM,
  GOAL_TXT_SCALE,
  GOAL_TYPE_LEVEL,
  GOAL_UNIT_MAP,
  GOAL_TEMPLATES,
  MAP_GOALS,
  MAP_PERIOD,
} from '../../data/goals.data';
import { shortFio } from '../../data/org.data';
import { GoalForm, GoalMark, GoalPerson, GoalStage, GoalTemplate, ProtoGoal } from '../../interface/goal';
import { LegacyService } from '../legacy/legacy.service';
import { DemoState } from './demo-state.service';

/** буква → описание с большой буквы: «B» → «Превосходит ожидания» */
export const goalLetter = (o: string): string => (GOAL_SCALE.find((x) => x[0] === o) || ['', ''])[1];
export const goalLetterCap = (o: string): string => goalLetter(o).replace(/^./, (c) => c.toUpperCase());
/** число по-русски: 1 234,5 */
export const goalNum = (v: number): string => (Math.round(v * 100) / 100).toLocaleString('ru-RU');
export const goalUnit = (u?: string): string => (u && GOAL_UNIT_MAP[u]) || u || '';
export const goalLevel = (g: ProtoGoal): string => {
  const l = g.lvl || GOAL_TYPE_LEVEL[g.type || ''];
  return l === 'Команда' ? 'Подразделение' : GOAL_LEVELS.includes(l) ? l : 'Индивидуальная';
};
export const goalType = (g: ProtoGoal): string => g.gt || 'МВО';
const person = (n: string): GoalPerson => {
  const p = GOAL_PEOPLE.find((e) => e.n === n);
  return p ? { ...p } : { n, pos: '', av: 1 };
};

/** как измеряется цель (glFormOf прототипа) */
export function goalForm(g: ProtoGoal): GoalForm {
  if (g.form?.kind === 'str') return { ...g.form, vals: GOAL_TXT_SCALE, txt: 1 };
  if (g.form && g.form.kind !== 'txt' && g.form.sc) return { ...g.form, u: goalUnit(g.form.u) };
  const k = g.krs[0] || ({} as ProtoGoal['krs'][0]);
  const kind = g.form ? g.form.kind : k.m === 'bin' ? 'txt' : 'num';
  if (kind === 'txt') return { kind, u: '', sc: g.form?.sc || 'Пятиуровневая (A–E)', vals: g.form?.tv || GOAL_TXT_SCALE, txt: 1, plant: g.form?.plant || '' };
  const dir = /^(Снизить|Сократить|Уменьшить)/.test(g.t) ? 'down' : 'up', u = goalUnit(k.u) || (k.m === 'pct' ? '%' : ''), base = +(k.g ?? 0) || 100;
  const f = dir === 'down' ? [0.7, 0.9, 1, 1.1, 1.2] : [1.2, 1.05, 1, 0.9, 0.8];
  return { kind, u, dir, sc: 'Пятиуровневая (A–E)', vals: f.map((x) => String(Math.round(base * x * 10) / 10)) };
}
/** итог по цели: у количественной и бинарной — оценка руководителя или автоматическая по самооценке */
export const goalFinal = (g: ProtoGoal): GoalMark | null => (g.fin?.o ? g.fin : goalForm(g).kind !== 'txt' && g.self?.o ? g.self : null);
/** фактический результат */
export const goalResult = (g: ProtoGoal): number | null => (g.resF != null ? g.resF : g.self?.fact != null ? g.self.fact : null);
/** участники: исполнитель первым, затем оценивающие */
export function goalPeople(g: ProtoGoal): GoalPerson[] {
  return g.ppl
    ? [{ ...g.ppl.exe, role: 'Исполнитель', w: null }, ...g.ppl.ev]
    : [{ ...person(GOAL_ME), role: 'Исполнитель', w: null }, { ...person('Федорова Юлия Сергеевна'), role: 'Руководитель', w: 100 }];
}
/** средняя буква с учетом весов (A=5 … E=1) */
export function goalAvgLetter(arr: [string, number][]): string {
  const sc: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 }, W = arr.reduce((a, x) => a + x[1], 0);
  const avg = W ? arr.reduce((a, x) => a + sc[x[0]] * x[1], 0) / W : arr.reduce((a, x) => a + sc[x[0]], 0) / arr.length;
  return 'EDCBA'[Math.max(0, Math.min(4, Math.round(avg) - 1))];
}
/** чья форма «Ваша оценка» на этапе оценки заказчиков */
export const goalMyEvaluator = (L: GoalPerson[]): GoalPerson | undefined => L.find((p) => p.role === 'Руководитель') || L[0];
/** порядок целей в карте: компании, подразделения, индивидуальные */
export const goalOrder = (list: ProtoGoal[]): ProtoGoal[] =>
  GOAL_LEVEL_ORDER.map((lv) => list.filter((g) => goalLevel(g) === lv))
    .flat()
    .concat(list.filter((g) => !GOAL_LEVEL_ORDER.includes(goalLevel(g))));

/** дата дд.мм.гггг → число для сравнения */
export const goalD8 = (d?: string | null): number => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(d || '').trim());
  return m ? +(m[3] + m[2] + m[1]) : NaN;
};
/** сегодня дд.мм.гггг */
export const goalToday = (): string => {
  const d = new Date(), z = (n: number) => String(n).padStart(2, '0');
  return z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear();
};
/** группа цели */
export const goalGroup = (g: ProtoGoal): string =>
  (g['grp'] as string) || ((g['attrs'] as { group?: string } | undefined)?.group ?? '') || GOAL_GROUP_OF[g.id] || GOAL_GROUPS[0];
export const goalPeriodBy = (n: string) => GOAL_PERIODS.find((p) => p.n === n) || GOAL_PERIODS[1];
/** период цели (glMapPer): у новой — период текущей карты */
export const goalPeriodOf = (g?: ProtoGoal | null) =>
  g
    ? g['per']
      ? goalPeriodBy(g['per'] as string)
      : GOAL_PERIODS.find((p) => goalD8(p.from) <= goalD8(g.due) && goalD8(g.due) <= goalD8(p.to)) || GOAL_PERIODS[1]
    : GOAL_PERIODS.find((p) => p.from === MAP_PERIOD.from && p.to === MAP_PERIOD.to) || GOAL_PERIODS[1];
/** цепочка вышестоящих целей (хлебные крошки) */
export function goalAncestors(g: ProtoGoal, all: ProtoGoal[]): { id: string; t: string }[] {
  const find = (id?: string | null) => {
    if (!id) return null;
    const x = all.find((y) => y.id === id);
    return x ? { id: x.id, t: x.t, par: x.par ?? null } : GOAL_ANCESTORS[id] ? { id, ...GOAL_ANCESTORS[id] } : null;
  };
  const ch: { id: string; t: string }[] = [];
  let c = find(g.par);
  while (c && ch.length < 6) {
    ch.unshift({ id: c.id, t: c.t });
    c = find(c.par);
  }
  return ch;
}
/** оценка по фактическому результату (glGrade) */
export function goalGrade(F: GoalForm, fact: number): GoalMark | null {
  if (F.cu === '%' && F.u !== '%' && +(F.plan ?? 0)) fact = (fact / +(F.plan ?? 1)) * 100;
  const rows = GOAL_SCALES[F.sc || ''] || [], v = (F.vals || []).map((x) => +String(x).replace(',', '.'));
  let i = rows.findIndex((_, k) => (F.dir === 'down' ? fact <= v[k] : fact >= v[k]));
  if (i < 0) i = rows.length - 1;
  return rows[i] ? { o: rows[i][1], n: rows[i][0] } : null;
}
/** критерии количественной шкалы по умолчанию */
export const goalScaleDef = (sc: string, dir: string): string[] => [...GOAL_SCALE_DEF[dir === 'down' ? 'down' : 'up'][(GOAL_SCALES[sc] || []).length]];
/** направление по критериям: значение A меньше E — на понижение */
export const goalDirOf = (vals: string[]): 'up' | 'down' => {
  const a = +String(vals[0]).replace(',', '.'), e = +String(vals[vals.length - 1]).replace(',', '.');
  return !isNaN(a) && !isNaN(e) && a < e ? 'down' : 'up';
};
/** критерии качественной шкалы по умолчанию — по числу уровней */
export const goalTvDef = (sc: string): string[] =>
  (GOAL_SCALES[sc] || []).length === 3 ? [GOAL_TXT_SCALE[0], GOAL_TXT_SCALE[2], GOAL_TXT_SCALE[4]] : [...GOAL_TXT_SCALE];

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const MAP_TO = '30.09.2026';

/**
 * Цели сотрудника (GOALS прототипа) — общие для «Карты целей», «Списка целей» и страниц цели.
 * Страницы старого прототипа, которые используют цели, получают их и этап карты при переходе и возвращают обратно (LegacyService.share).
 */
@Injectable({ providedIn: 'root' })
export class GoalsStore {
  private readonly demo = inject(DemoState);
  readonly goals = signal<ProtoGoal[]>(clone(MAP_GOALS));
  readonly period = MAP_PERIOD;
  /** шаблоны целей (окно «Шаблоны целей»; «Сохранить и добавить цель в шаблон» пополняет список) */
  readonly templates = signal<GoalTemplate[]>(clone(GOAL_TEMPLATES));

  /** цели текущей карты (glDraftList): в пустом черновике — только добавленные сотрудником */
  readonly current = computed(() => {
    const all = this.goals().filter((g) => g.own === 'h1' && g.st !== 'arch' && g.st !== 'draft' && g.to === MAP_TO);
    return this.demo.goalFill() === 'full' || this.demo.goalStage() !== 'draft' ? all : all.filter((g) => String(g.id).startsWith('gn'));
  });

  constructor() {
    inject(LegacyService).share('goals', {
      get: () => ({ goals: this.goals(), stage: this.demo.goalStage(), idle: this.demo.goalIdle(), fill: this.demo.goalFill() }),
      set: (v: { goals: ProtoGoal[]; stage: GoalStage; idle: boolean; fill: 'empty' | 'full' }) => {
        if (v.goals) this.goals.set(v.goals);
        if (v.stage) this.demo.goalStage.set(v.stage);
        if (v.idle != null) this.demo.goalIdle.set(v.idle);
        if (v.fill) this.demo.goalFill.set(v.fill);
      },
    });
  }

  update(id: string, patch: Partial<ProtoGoal>): void {
    this.goals.update((l) => l.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }
  /** своя оценка участника качественной цели: итоговая — средняя по всем участникам, когда оценили все */
  saveEval(id: string, who: string, mark: GoalMark): void {
    this.goals.update((l) =>
      l.map((g) => {
        if (g.id !== id) return g;
        const x: ProtoGoal = { ...g, evs: { ...(g.evs || {}), [who]: mark }, fin: null };
        delete x.fin;
        this.finCalc(x);
        return x;
      }),
    );
  }
  add(g: ProtoGoal): void {
    this.goals.update((l) => [...l, g]);
  }
  remove(id: string): void {
    this.goals.update((l) => l.filter((g) => g.id !== id));
  }
  /** «Распределить поровну»: 100% между целями карты, остаток — первым по порядку */
  spread(): { base: number; n: number } {
    const O = goalOrder(this.current()), n = O.length, base = Math.floor(100 / n);
    const w = new Map(O.map((g, i) => [g.id, base + (i < 100 - base * n ? 1 : 0)]));
    this.goals.update((l) => l.map((g) => (w.has(g.id) ? { ...g, w: w.get(g.id)! } : g)));
    return { base, n };
  }

  /**
   * Демо-данные этапа (glStageMy): после самооценки у целей появляются самооценки, на оценке заказчиков — часть оценок участников,
   * в итоге — оценки всех участников и итоговая. Как в прототипе, данные остаются при переключении этапов.
   */
  prepare(stage: GoalStage): void {
    const waitE = stage === 'wait', custE = stage === 'cust', finE = stage === 'fin';
    if (!waitE && !custE && !finE) return;
    const ids = new Set(this.current().map((g) => g.id));
    const list = clone(this.goals());
    const cur = list.filter((g) => ids.has(g.id));
    const bin = (g: ProtoGoal) => goalForm(g).kind === 'str';
    const docs = (g: ProtoGoal) => [{ id: 'sd' + g.id, name: 'Отчет о выполнении цели.pdf', size: 184000, st: 'ok', date: '28.12.2026', by: 'Иванов П. С.' }];
    if (finE)
      cur.forEach((g, i) => {
        if (goalForm(g).kind !== 'txt') return;
        if (!g.fin) {
          const o = 'BACB'[i % 4];
          g.fin = { o, n: bin(g) ? 'Выполнено' : goalLetterCap(o) };
        }
        this.evs(g, stage);
        this.finCalc(g);
      });
    cur.forEach((g) => {
      if (!g.self && bin(g)) g.self = { o: 'A', n: 'Выполнено', fact: null, cm: GOAL_SELF_DEMO_CM, docs: docs(g) };
    });
    cur.forEach((g, i) => {
      if (g.self) return;
      const F = goalForm(g), o = 'BBCA'[i % 4];
      g.self = { o, n: goalLetterCap(o), fact: F.kind === 'num' && F.vals ? +String(F.vals[o === 'A' ? 0 : o === 'B' ? 1 : 2]).replace(',', '.') : null, cm: GOAL_SELF_DEMO_CM, docs: docs(g) };
    });
    cur.forEach((g) => {
      if (finE && goalForm(g).kind !== 'txt' && !g.fin && g.self?.o) g.fin = { o: g.self.o, n: g.self.n };
      if (finE || (custE && goalForm(g).kind === 'txt')) this.evs(g, stage);
    });
    this.goals.set(list);
  }

  /** оценки участников (glGvEvs): в итоге — все, на оценке заказчиков — кроме моей и последнего из 3+ */
  private evs(g: ProtoGoal, stage: GoalStage): void {
    g.evs = g.evs || {};
    const L = goalPeople(g).filter((p) => p.role !== 'Исполнитель'), me = goalMyEvaluator(L);
    const demo = (p: GoalPerson, i: number, o: string): GoalMark => ({
      o, n: goalLetterCap(o), fact: null, cm: GOAL_EV_CM[i % GOAL_EV_CM.length], d: '0' + (5 + i) + '.01.2027',
      docs: i % 2 ? [] : [{ id: 'ev' + g.id + i, name: 'Подтверждение результата.pdf', size: 126000, st: 'ok', date: '0' + (5 + i) + '.01.2027', by: shortFio(p.n) }],
    });
    if (stage === 'fin')
      L.forEach((p, i) => {
        if (!g.evs![p.n] && g.fin) g.evs![p.n] = demo(p, i, i % 2 && g.fin.o !== 'A' ? 'BACDE'['ABCDE'.indexOf(g.fin.o) - 1] || g.fin.o : g.fin.o);
      });
    if (stage === 'cust')
      L.forEach((p, i) => {
        if (p !== me && !g.evs![p.n] && !(L.length > 2 && i === L.length - 1) && !(g.evsD || {})[p.n]) {
          g.evs![p.n] = demo(p, i, 'BAB'[i % 3]);
          (g.evsD = g.evsD || {})[p.n] = 1;
        }
      });
  }
  /** итог качественной цели — средняя оценок участников с учетом весов */
  private finCalc(g: ProtoGoal): void {
    if (goalForm(g).kind !== 'txt') return;
    const L = goalPeople(g).filter((p) => p.role !== 'Исполнитель');
    if (!L.length || !L.every((p) => g.evs?.[p.n]?.o)) return;
    const fo = goalAvgLetter(L.map((p) => [g.evs![p.n].o, +(p.w ?? 0) || 1]));
    g.fin = { o: fo, n: goalLetterCap(fo) };
  }
}

/** шкала оценки цели: [описание, буква] */
export const goalScaleRows = (F: GoalForm): [string, string][] => GOAL_SCALES[F.sc || ''] || [];
