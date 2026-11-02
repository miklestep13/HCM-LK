/** Этап карты целей (как в прототипе) */
export type GoalStage = 'draft' | 'appr' | 'plan' | 'self' | 'wait' | 'cust' | 'fin';

/** Статус карты целей — то, что видит пользователь */
export type GoalStatus = 'draft' | 'plan' | 'eval' | 'fin';
export const GOAL_STAGES: { value: GoalStatus; label: string; tone: '' | 'ok' | 'warn' }[] = [
  { value: 'draft', label: 'Заведение целей', tone: '' },
  { value: 'plan', label: 'Утверждено', tone: 'ok' },
  { value: 'eval', label: 'Период оценки', tone: 'warn' },
  { value: 'fin', label: 'Завершена', tone: 'ok' },
];
/**
 * Этап → статус карты. «Период оценки» — один статус для всех, а что делает пользователь, зависит от роли:
 * сотрудник ставит самооценку (этап self), руководитель и заказчики — оценки участников (этап cust).
 */
export const goalStatusOf = (s: GoalStage): GoalStatus => (s === 'self' || s === 'cust' || s === 'wait' ? 'eval' : s === 'appr' ? 'draft' : (s as GoalStatus));

/** Оценка по шкале A–E */
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface GoalPeriod {
  title: string;
  from: string;
  to: string;
}

/** Цель карты (минимум полей для главной; полная модель — при переносе модуля «Цели») */
export interface Goal {
  id: string;
  title: string;
  due: string;
  weight?: number | null;
  /** итоговая оценка на этапе «Итог» (демо) */
  finalGrade?: Grade;
}

/** Строка «Списка целей» */
export interface GoalListRow {
  id: string;
  title: string;
  /** родительская цель (дерево «По цели») */
  parent: string;
  /** Компания | Подразделение | Индивидуальная */
  level: string;
  /** моя цель (у чужих родительских целей нет статуса и оценки) */
  mine: boolean;
  /** цель текущей карты (ее статус — этап карты, ее можно редактировать и оценивать) */
  current: boolean;
  owner: { name: string; role: string; unit: string; av: number };
  /** МВО | KPI */
  type: string;
  period: string;
  weight: string;
  due: string;
  result: string;
  /** итоговая оценка — буква A–E */
  grade: string;
  gradeName: string;
  /** вид значения: num — числовая, str — бинарная, txt — по описанию */
  kind: 'num' | 'str' | 'txt' | string;
  /** самооценка уже поставлена */
  rated: boolean;
}

/** Участник цели: исполнитель или оценивающий */
export interface GoalPerson {
  n: string;
  pos: string;
  av: number;
  /** Исполнитель | Руководитель | Заказчик | Эксперт | Коллега */
  role?: string;
  /** вес оценки участника, % */
  w?: number | string | null;
  from?: string;
  to?: string;
  team?: { cnt: number; avs: number[] };
}
/** Документ, приложенный к оценке */
export interface GoalDoc {
  id: string;
  name: string;
  size: number;
  st: string;
  date: string;
  by: string;
}
/** Оценка (самооценка, оценка участника, итоговая) */
export interface GoalMark {
  /** буква A–E */
  o: string;
  /** описание буквы или «Выполнено» */
  n: string;
  /** фактический результат (количественная цель) */
  fact?: number | null;
  cm?: string;
  docs?: GoalDoc[];
  d?: string;
  saved?: boolean;
}
/** Как измеряется цель (form прототипа) */
export interface GoalForm {
  /** num — количественная, txt — качественная, str — бинарная */
  kind: 'num' | 'txt' | 'str' | string;
  /** единица измерения */
  u?: string;
  /** шкала */
  sc?: string;
  /** up — на повышение, down — на понижение */
  dir?: string;
  /** критерии по уровням шкалы */
  vals?: string[];
  tv?: string[];
  cu?: string;
  plan?: number | string;
  plant?: string;
  factt?: string;
  txt?: number;
}
/**
 * Цель в формате прототипа (объект GOALS). Поля, которые нужны «Карте целей», описаны;
 * остальные хранятся как есть — их использует форма цели в старом прототипе.
 */
export interface ProtoGoal {
  id: string;
  /** наименование */
  t: string;
  /** описание / ожидаемый результат */
  d?: string;
  own: string;
  type?: string;
  /** уровень: Компания | Подразделение | Индивидуальная */
  lvl?: string;
  /** тип: МВО | KPI | Стратегическая */
  gt?: string;
  par?: string | null;
  st?: string;
  to?: string;
  /** вес, % */
  w?: number | null;
  /** срок сдачи */
  due?: string;
  /** показатели (ключевые результаты) */
  krs: { t: string; m: string; s?: number; g?: number | string; c?: number; u?: string; w?: number; [k: string]: unknown }[];
  form?: GoalForm;
  ppl?: { exe: GoalPerson; ev: GoalPerson[] };
  self?: GoalMark | null;
  fin?: GoalMark | null;
  /** оценки участников по ФИО */
  evs?: Record<string, GoalMark>;
  /** демо-оценки участников уже выставлены */
  evsD?: Record<string, number>;
  resF?: number | null;
  [k: string]: unknown;
}
/** Шаблон цели (окно «Шаблоны целей» в форме) */
export interface GoalTemplate {
  t: string;
  d: string;
  /** num | txt | str */
  kind: string;
  u?: string;
  ind?: string;
  plan?: string;
  vals?: string[] | null;
  gt?: string;
  lvl?: string;
  grp?: string;
  au?: string;
  cr?: string;
  upd?: string;
}
