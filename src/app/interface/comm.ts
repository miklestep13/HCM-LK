/** Категория сообщества */
export type CommCat = 'prof' | 'sport' | 'hobby' | 'lang' | 'vol';

/** Ближайшая встреча сообщества */
export interface CommEvent { day: string; mon: string; when: string; title: string; place: string; }

/** Сообщество (const COMMS прототипа) */
export interface Community {
  id: string;
  cat: CommCat;
  name: string;
  /** кратко — на карточке */
  short: string;
  about: string;
  /** подробное описание (HTML), если есть */
  aboutHtml?: string;
  members: number;
  event: CommEvent | null;
  freq: string;
  place: string;
  channel: string;
  /** «март 2023» */
  since: string;
  /** дата создания «18.03.2023» */
  created: string;
  /** куратор — индекс в списке людей прототипа */
  curator: number;
  /** пользователь — участник */
  joined?: boolean;
  /** вступление по заявке */
  byRequest?: boolean;
  /** заявка отправлена */
  sent?: boolean;
}
