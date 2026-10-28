/** Узел оргструктуры (const ORG прототипа) */
export interface OrgNode {
  id: string;
  /** руководитель; null — генеральный директор */
  parent: string | null;
  name: string;
  role: string;
  /** подразделение, которое возглавляет узел (у рядовых сотрудников пусто — берется у руководителя) */
  unit: string;
  /** фото (assets/img/people/…) или класс портрета из _avatars.scss (av1–av8) */
  photo?: string;
  av?: string;
}

/** Строка карточки сотрудника: «Департамент — Дирекция развития» */
export interface EmployeeCardRow {
  key: string;
  label: string;
  value: string;
  /** значение — ссылка (почта) */
  link?: boolean;
  /** скрытая строка (показывается в отдельных сценариях) */
  hidden?: boolean;
}

/** Карточка сотрудника (раздел «Сотрудники», всплывающая карточка на схеме оргструктуры) */
export interface EmployeeCard {
  name: string;
  role: string;
  photo?: string;
  av?: string;
  tags?: { text: string; tone: '' | 'ok' | 'warn' | 'dg' | 'info' }[];
  rows: EmployeeCardRow[];
  /** это текущий пользователь */
  me?: boolean;
}
