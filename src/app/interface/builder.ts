import { AttachFile } from './attach';
import { PollQType, PollQuestion } from './poll';

/**
 * Конструктор учебных материалов (widgets/builder): курс, тест, опрос, задание, программа.
 * Три уровня: раздел (смысловой заголовок) → модуль (страница) → блоки (содержимое страницы друг под другом).
 */
export type BldKind = 'course' | 'test' | 'poll' | 'task' | 'program';

/** тип блока: контент (текст, видео, документ, файлы, изображение, статья из базы знаний), задание, курс из каталога (в программе), вопрос (q) */
export type BldBlockType = 'text' | 'video' | 'pdf' | 'files' | 'image' | 'kb' | 'task' | 'course' | 'q';

export interface BldBlock {
  id: string;
  k: BldBlockType;
  /** текст: HTML; задание: формулировка */
  html?: string;
  /** текст: обычный или выделенный (врезка) */
  view?: 'plain' | 'note';
  /** название видео / документа / подпись к файлам и изображению */
  title?: string;
  /** длительность видео: «12 мин» */
  dur?: string;
  /** видео и документ: источник — загруженный файл или ссылка */
  src?: 'file' | 'link';
  /** видео и документ — ссылка */
  url?: string;
  files?: AttachFile[];
  /** изображение: адрес загруженной картинки */
  img?: string;
  /** задание: формат ответа */
  ans?: 'file' | 'text' | 'both';
  /** статья из базы знаний (id статьи) */
  art?: string;
  /** курс из каталога (программа) */
  crs?: string;
  /** курс обязателен для завершения программы */
  req?: boolean;
  /** вопрос (опрос, тест, проверка знаний в курсе) */
  q?: PollQuestion;
}

/**
 * Вид модуля курса: что можно добавить в модуль. mod — «Модуль» (только контент), task — «Задание» (только задание),
 * test — «Тестирование» (контент и вопросы с верным ответом), poll — «Опрос» (контент и вопросы опроса).
 */
export type BldModKind = 'mod' | 'task' | 'test' | 'poll';

/** настройки модуля «Тестирование» */
export interface BldTestSet {
  /** вид оценки */
  score: string;
  /** проходной процент (или балл) */
  pass: number | null;
  /** количество попыток */
  tries: number | null;
  /** время изучения */
  time: string;
  /** все учебные материалы модуля просмотрены */
  allSeen: boolean;
  /** показывать отчет о результатах и варианты ответов в нем */
  report: boolean;
  reportAns: boolean;
}

/** настройки модуля «Задание» */
export interface BldTaskSet {
  /** алгоритм определения куратора */
  alg: string;
  /** куратор (ФИО) — при алгоритме «Вручную» */
  cur: string;
  /** баллы за задание */
  pts: number | null;
  /** куратору доступен перевод задания в статус «Не принято» */
  reject: boolean;
}

export interface BldModule {
  id: string;
  t: string;
  d: string;
  blocks: BldBlock[];
  /** вид модуля (курс); нет — «Модуль» */
  mk?: BldModKind;
  /** настройки «Тестирования» */
  test?: BldTestSet;
  /** настройки «Задания» */
  task?: BldTaskSet;
}

/** шаблон модуля: сохраненный модуль, который можно добавить в любой курс */
export interface BldModTemplate {
  id: string;
  mk: BldModKind;
  t: string;
  d: string;
  blocks: BldBlock[];
  test?: BldTestSet;
  task?: BldTaskSet;
  /** автор и дата сохранения */
  au: string;
  date: string;
}

export interface BldSection {
  id: string;
  t: string;
  mods: BldModule[];
}

export interface BldMaterial {
  kind: BldKind;
  t: string;
  /** без разделов (два уровня: модуль → блок) — задается видом материала (BldKindConf.levels) */
  flat: boolean;
  /** один уровень — только блоки, без модулей (опрос из вопросов): все блоки в одном скрытом модуле */
  one?: boolean;
  /** прохождение: модуль целиком или по одному блоку на экране */
  paging: 'module' | 'block';
  /** порядок прохождения модулей */
  order?: 'free' | 'seq';
  /** тест: проходной балл, % */
  pass?: number;
  secs: BldSection[];
}

/** пункт палитры «Добавить блок» */
export interface BldPaletteItem {
  k: BldBlockType;
  qt?: PollQType;
  name: string;
  icon: string;
  hint?: string;
}

/** настройки вида материала: названия уровней, палитра блоков, верные ответы */
export interface BldKindConf {
  name: string;
  /** родительный падеж: «Структура курса» */
  gen: string;
  /** модуль: «Модуль» / «Этап» / «Шаг» */
  mod: string;
  /** уровни: 3 — раздел → модуль → блок (курс), 2 — модуль → блок (опрос, тест, задание, программа) */
  levels: 2 | 3;
  /** можно собрать из одних блоков, без модулей (опрос, тест) */
  one?: boolean;
  /** группы палитры */
  groups: { t: string; items: BldPaletteItem[] }[];
  /** у вопросов отмечаются верные ответы (тест) */
  correct?: boolean;
}
