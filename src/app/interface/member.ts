/** Участник (виджет «Участники»): сообщество, цель, мероприятие */
export interface Member {
  /** ФИО */
  n: string;
  /** должность */
  pos: string;
  /** подразделение */
  dep?: string;
  /** портрет: номер av1–av8 или класс */
  av: number | string;
  role?: string;
  /** вес, % */
  w?: number | string | null;
  /** нельзя изменить или убрать (например, исполнитель цели) */
  lock?: boolean;
  /** группа вместо сотрудника: подразделение или команда (в pos — «Подразделение · 24 сотрудника») */
  kind?: 'dep' | 'team';
  /** сотрудников в группе */
  cnt?: number;
}

/** Что показывать о участнике */
export type MemberField = 'av' | 'name' | 'pos' | 'role' | 'w';
/** Ввод: none — только просмотр, inline — правка прямо в списке, drawer — добавление и правка в сайдбаре */
export type MemberEdit = 'none' | 'inline' | 'drawer';
/** Вывод: карточки, таблица или оба вида с переключателем в шапке */
export type MemberView = 'cards' | 'table' | 'both';
