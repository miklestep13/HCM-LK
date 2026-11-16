/** Конструктор заявки (widgets/req-builder): инфоблоки с неизменным набором полей — поля можно отключать, переставлять, делать обязательными */

/** вид поля: строка, многострочный текст, дата, число, список, сотрудник, файлы */
export type RqFieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'employee' | 'files';

/** ширина поля, % строки */
export type RqWidth = 25 | 33 | 50 | 100;

/** поле инфоблока */
export interface RqField {
  /** ключ поля (в инфоблоке не повторяется) */
  k: string;
  /** подпись — можно переименовать */
  l: string;
  t: RqFieldType;
  /** поле включено (выключенное не показывается в заявке) */
  on: boolean;
  /** обязательное */
  req: boolean;
  /** подсказка под полем */
  hint?: string;
  /** ширина в форме заявки, % строки: 25, 33, 50 или 100 (сетка из 12 колонок: 3, 4, 6, 12) */
  w: RqWidth;
  /** варианты списка (t = 'select') */
  opts?: string[];
  /** допустимые форматы документов (t = 'files'); пусто — любые */
  formats?: string[];
}

/** инфоблок в заявке: название и поля (набор полей задан видом инфоблока) */
export interface RqBlock {
  id: string;
  /** вид инфоблока (RQ_BLOCK_KINDS) */
  kind: string;
  /** название — можно переименовать */
  t: string;
  /** заголовок скрыт: в заявке инфоблок без названия, только поля */
  noTitle?: boolean;
  fields: RqField[];
}

/** вид инфоблока в палитре «Добавить инфоблок»: название, иконка, подсказка и неизменный набор полей */
export interface RqBlockKind {
  k: string;
  name: string;
  icon: string;
  hint: string;
  fields: RqField[];
}

/** тип заявки: общая информация (шаг 1) и инфоблоки (шаг 2, конструктор) */
export interface ReqTypeDraft {
  n: string;
  d: string;
  prefix: string;
  /** ответственные — ФИО */
  resp: string[];
  cat: string;
  /** иконка из реестра (shared/ui/icon) */
  icon: string;
  /** рабочий процесс заявки */
  flow: string;
  blocks: RqBlock[];
}
