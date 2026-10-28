export type LearnKind = 'crs' | 'prog' | 'ev';

/** Курс: название, срок / дата прохождения, длительность, статус сотрудника */
export interface LearnCourse {
  t: string;
  d: string;
  dur: string;
  st: string;
}

/** Программа: статус и этапы — [курс, статус этапа] */
export interface LearnProgram {
  t: string;
  st: string;
  s: [string, string][];
}

/** Мероприятие */
export interface LearnEvent {
  t: string;
  d: string;
  dur: string;
  /** место; нет — онлайн */
  pl?: string;
  /** есть запись */
  rec?: number;
}

/** Карточка «Моего обучения» или каталога */
export interface LearnCard {
  id: string;
  title: string;
  img: string;
  /** категория курса (Обязательный / Рекомендуемый / По выбору) */
  cat?: string;
  /** направление (для фильтра «Должность») */
  role?: string;
  grd?: string;
  /** категория разделов */
  sph?: string;
  tag?: string;
  /** «до 20.11.2026» / «пройден 01.06.2026» / дата мероприятия */
  date?: string;
  dur?: string;
  /** программа: «6 курсов» */
  count?: string;
  /** каталог: «51 ч · 6 курсов», «1 октября, 10:00 · 7 ч» */
  line?: string;
  /** мероприятие: место (null — онлайн) */
  place?: string | null;
  /** мероприятие идет сейчас */
  live?: boolean;
}

/** Прогресс прохождения */
export interface LearnProgress {
  value: number;
  tone: '' | 'ok' | 'dg';
  /** «Пройдено 2 из 6 курсов» */
  sub?: string;
}

/** Действие с карточки */
export type LearnAction =
  | { kind: 'btn'; act: string; label: string; raised?: boolean }
  | { kind: 'note'; label: string; tip?: string; lock: boolean }
  | null;

/** Блок программы курса: [название, описание, длительность, тип?, текст?] */
export type LearnBlock = [string, string, string, string?, string?];
/** Раздел программы: [название, блоки] */
export type LearnSection = [string, LearnBlock[]];

export interface LearnCourseInfo {
  cat?: string;
  /** нравится / не нравится / комментарии */
  l: number;
  dis: number;
  cm?: number;
  /** прошли курс (если нет — считается по лайкам) */
  ps?: number;
  /** описание (HTML) */
  ab: string;
  s: LearnSection[];
}
export interface LearnEventInfo extends LearnCourseInfo {
  sp?: string;
  st?: string;
  /** докладчик */
  tr?: string;
  rec?: number;
}
export interface LearnProgInfo {
  d: string;
  dur: string;
  ab: string;
}
/** Тест программы */
export interface LearnTest {
  t: string;
  dur: string;
  /** вопросов, попыток, проходной балл, статус, лучший результат */
  q: number;
  a: number;
  p: number;
  st: string;
  r: number;
}
/** Комментарий к курсу: [аватар, автор, дата, оценка, текст] */
export type LearnComment = [string, string, string, number, string];
