/** Строка реестра планов адаптации (HR). */
export interface AdaptPlanRow {
  id: string;
  /** ФИО сотрудника */
  name: string;
  /** должность */
  pos: string;
  /** портрет .avN */
  av: number;
  /** тип плана */
  type: string;
  /** начало периода адаптации */
  from: string;
  /** конец периода адаптации */
  to: string;
  /** закрыто задач */
  done: number;
  /** всего задач */
  total: number;
  /** состояние плана */
  status: AdaptPlanStatus;
  /** дата создания */
  created: string;
}

export type AdaptPlanStatus =
  | 'Создан'
  | 'На согласовании'
  | 'Согласовано'
  | 'В процессе'
  | 'Завершен'
  | 'Не пройдена';
