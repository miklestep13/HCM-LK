/** Индивидуальный план развития (ИПР) */

/** Задача ИПР */
export interface IprTask {
  /** формулировка */
  t: string;
  /** ожидаемый результат */
  res: string;
  /** курс из каталога (id) */
  crs?: string;
  /** внешняя ссылка */
  link?: string;
  /** статья из базы знаний */
  art?: string;
  due: string;
  done: boolean;
  /** дата выполнения */
  doneAt?: string;
  /** развиваемые компетенции */
  comps: string[];
  /** автор задачи (кратко) */
  by: string;
  /** срок переносился */
  moved?: boolean;
  /** комментарий о выполнении */
  note?: string;
}

/** Компетенция плана: название, обязательность, текущий и целевой уровень */
export interface IprComp {
  name: string;
  req: string;
  cur: string;
  target: string;
}

export interface IprPlan {
  name: string;
  created: string;
  author: string;
  desc: string;
  kind: string;
  per: string;
  due: string;
  curRole: string;
  curGrade: string;
  tRole: string;
  tGrade: string;
  dept: string;
  /** руководитель: ФИО, должность */
  mgr: [string, string];
  expert?: string;
  tpl?: string;
  tasks: IprTask[];
  comps: IprComp[];
}

/** Статус плана (внутренний ключ) */
export type IprStatus =
  | 'Черновик'
  | 'Предложено'
  | 'Утверждено'
  | 'В работе'
  | 'Аттестация'
  | 'Выполнено'
  | 'Выполнено частично'
  | 'Не выполнено';

/** Статус задачи */
export type IprTaskStatus = 'Просрочено' | 'В работе' | 'Выполнено';

/** Компетенция справочника: название, описание, текущий уровень сотрудника, должность и грейд профиля */
export interface IprCatComp {
  name: string;
  desc: string;
  cur: string;
  role: string;
  grade: string;
}

/** Заключение эксперта на аттестации */
export interface IprExpert {
  name: string;
  role: string;
  status: string;
  comment: string;
}

/** Оценка задачи на аттестации */
export type IprRate = 'done' | 'part' | 'no';

/** Комментарий к задаче на аттестации */
export interface IprComment {
  who: 'mgr' | 'emp';
  at: string;
  text: string;
}

/** Форма нового ИПР */
export interface IprNewForm {
  emp: string;
  per: string;
  kind: string;
  expert: string;
  role: string;
  roleTouched: boolean;
  grade: string;
  gradeTouched: boolean;
  tpl: string;
  desc: string;
}
