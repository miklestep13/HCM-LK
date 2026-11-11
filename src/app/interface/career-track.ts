/** Строка справочника ролей */
export interface CtRoleRow {
  id: string;
  name: string;
  /** лидер роли — человек из оргструктуры */
  leader: string;
  direction: string;
  kind: 'Основная' | 'Дополнительная';
  comps: number;
  people: number;
}

/** Строка справочника компетенций */
export interface CtCompRow {
  id: string;
  name: string;
  group: string;
  desc: string;
  roles: number;
}

/** Требования одного грейда */
export interface CtGradeReq {
  grade: string;
  desc: string;
  exp: string;
  edu: string;
}

/** Требуемые уровни компетенции по грейдам роли. Пустая строка — на этом грейде не требуется */
export interface CtRoleComp {
  name: string;
  group: string;
  levels: string[];
}

/** Сотрудник в роли */
export interface CtPerson {
  id: string;
  name: string;
  grade: string;
  unit: string;
  tag: '' | 'Лидер роли' | 'Эксперт';
}

/** Роль, в которой компетенция требуется, и уровень по каждому грейду */
export interface CtCompRole {
  id: string;
  name: string;
  levels: string[];
}

/** Карточка обучения из каталога, показанная на странице роли или компетенции */
export interface CtLearnItem {
  id: string;
  kind: 'crs' | 'ev';
  title: string;
  type: 'Курс' | 'Мероприятие';
  grade: string;
  section: string;
  tag: string;
  img: string;
  line: string;
}
