import { AttachFile } from './attach';

/** Этап бланка аттестации */
export type AttStage = 'self' | 'mgr' | 'comm' | 'meet' | 'final' | 'ipr' | 'iprok' | 'fail';

/**
 * Требуемая оценка: man — ручная (A–E), r360 — оценка 360, auto — проверка дисциплины.
 * st: wait — ждет оценки, todo — можно оценить, done — проставлена. own — чья оценка (emp, mgr, comm).
 */
export interface AttRate {
  k: string;
  kind: 'man' | 'r360' | 'auto';
  t: string;
  who: string;
  role: string;
  /** 'me' — сотрудник, число — портрет, иначе иконка (grp, sys) */
  av: string | number;
  st: 'wait' | 'todo' | 'done';
  own?: string;
  due?: string;
  d?: string;
  /** значение (A–E, число или текст) */
  r?: string;
  /** способ ввода значения при последнем сохранении */
  rm?: string;
  cr?: string;
  v?: string;
  cv?: string;
  score?: string;
  of?: string;
  pass?: number;
  docs?: AttachFile[];
}

/** Пройденная оценочная активность (360, оценка по целям) */
export interface AttActivity {
  k: string;
  t: string;
  who: string;
  role: string;
  ico: string;
  d: string;
  res: string;
  sq: string;
  /** значение — буква шкалы */
  lt?: number;
  cr: string;
  /** страница источника */
  go: string;
}

/** Мероприятие аттестации */
export interface AttEvent {
  t: string;
  /** описание */
  s: string;
  /** «20.09.2026 10:00» */
  d: string;
  /** участники: 'me' или номер портрета; добавленные — ФИО */
  p: (string | number)[];
  f: string;
  u: string;
  /** минуты */
  dur: number;
  ty: string;
  /** этап, на котором проводится */
  es?: number;
  /** статус, выставленный вручную */
  stO?: 'done' | 'plan' | 'cancel';
}

/** Участник аттестации */
export interface AttPerson {
  /** роли через запятую */
  role: string;
  name: string;
  post: string;
  av: number;
  mail: string;
  tel: string;
  /** участвовал до (не действует) */
  till?: string;
  /** участвует с */
  since?: string;
}

/** Итоги аттестации (решение комиссии) */
export interface AttResult {
  dec: string;
  cand: number;
  d: string;
  cm: string;
  docs: AttachFile[];
}
