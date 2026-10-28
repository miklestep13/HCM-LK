import { BadgeData, MetaData } from './common';

/** Строка списка на главной: задание, заявка, цель, задача ИПР */
export interface ListRow {
  id: string;
  title: string;
  meta: MetaData[];
  badge?: BadgeData | null;
}

export interface ListBlock {
  total: number;
  items: ListRow[];
}

/** Задание сотрудника («Мой кабинет → Задания») */
export interface MyTask {
  id: string;
  title: string;
  text: string;
  /** дата создания */
  created: string;
  /** срок выполнения */
  due: string;
  /** инициатор */
  author: string;
  status: string;
  /** подпись кнопки действия */
  action?: string;
  /** страница, где выполняется задание */
  page?: string;
}
