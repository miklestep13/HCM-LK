/** Повтор встречи */
export interface CalRepeat {
  /** d — каждый день, wd — по рабочим дням, w — по неделям, m — по месяцам, y — каждый год */
  f: 'd' | 'wd' | 'w' | 'm' | 'y' | string;
  /** интервал: каждые n дней / недель / месяцев */
  n?: number;
  /** дни недели (0 — понедельник) */
  days?: number[];
  /** в месяц — по дню недели («в первый вторник»), иначе по числу */
  dow?: boolean;
  /** дата окончания «гггг-мм-дд» */
  until?: string | null;
  /** число повторений */
  cnt?: number;
}
/** Встреча календаря */
export interface CalEvent {
  id: string;
  t: string;
  /** дата (первая для серии) «гггг-мм-дд» */
  d: string;
  /** начало и конец, минуты от полуночи */
  s: number;
  e: number;
  /** весь день */
  all?: number;
  loc?: string;
  link?: string;
  /** ИИ-протокол участникам */
  aip?: number;
  org: string;
  ppl: string[];
  /** мой ответ: yes | maybe | none | no */
  my: string;
  col?: string;
  /** личное */
  priv?: number;
  rep?: CalRepeat | null;
  remind?: string;
  show?: string;
  desc?: string;
}
