import { AttachFile } from './attach';
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

/** Небольшое задание — обрабатывается в панели справа от списка (разделенный экран), без перехода на отдельную страницу */
export interface QuickTask {
  /** что сделать: «Подписать», «Ознакомиться» … — подзаголовок панели */
  kind: string;
  /** документ задания */
  files: AttachFile[];
  /** можно приложить свои файлы (например, досформировать пакет документов) */
  upload?: boolean;
  /** основное действие: подпись кнопки, итоговый статус, текст уведомления */
  ok: { label: string; status: string; toast: string };
  /** второе действие (отклонить, предложить другие даты) */
  alt?: { label: string; status: string; toast: string };
}
