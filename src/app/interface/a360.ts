/** Оценки 360 по источникам, %: самооценка, руководитель, коллеги, подчиненные */
export type A360Scores = [number, number, number, number];

/** Индикатор компетенции */
export interface A360Ind {
  name: string;
  v: A360Scores;
}

/** Компетенция в отчете 360: вывод («Сильная сторона», «Зона роста» …), оценки по источникам, средняя, индикаторы */
export interface A360Comp {
  name: string;
  tag: '' | 'Сильная сторона' | 'Зона роста' | 'Слепая зона' | 'Скрытый потенциал';
  v: A360Scores;
  avg: number;
  ind: A360Ind[];
}

/** Комментарий оценивающего: ФИО, роль, дата, текст */
export interface A360Comment {
  who: string;
  /** портрет av1–av8 (фото по ФИО — avCls) */
  av: number;
  role: string;
  date: string;
  text: string;
}
