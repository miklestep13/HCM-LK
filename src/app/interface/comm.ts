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
  /** своя обложка (картинка из формы); без нее — рисунок по категории */
  cover?: string | null;
  /** куратор — индекс в списке людей прототипа */
  curator: number;
  /** пользователь — участник */
  joined?: boolean;
  /** вступление по заявке */
  byRequest?: boolean;
  /** заявка отправлена */
  sent?: boolean;
}

/** Новость сообщества (cmPosts прототипа): автор — участник, key — для правки и удаления */
export interface CommPost {
  key: string;
  /** автор: [ФИО, должность, подразделение, портрет] (0 — текущий пользователь) */
  au: [string, string, string, number];
  t: string;
  /** «Вчера 16:20» или «05.09.2026 11:40» */
  d: string;
  /** лид */
  x: string;
  html?: string;
  tags: string[];
  lk: number;
  cm: number;
  vw: number;
  /** есть обложка (рисунок сообщества) */
  img?: number;
}

/** Правки ленты сообщества, общие с прототипом: добавленные, отредактированные и удаленные новости */
export interface CommFeed {
  posts?: CommPost[];
  pedit?: Record<string, Partial<CommPost>>;
  pdel?: Record<string, number>;
  /** правки сообщества из формы «Редактировать сообщество» (прототип) */
  info?: { name: string; cat: CommCat; about: string; place: string; created: string; cover?: string | null };
}

/** Мероприятие сообщества: день, месяц, «Пт, 18:30», название, место, участников */
export type CommMeet = [string, string, string, string, string, number];
