/** Модели страницы «О компании». Набор блоков один и тот же для любой компании, тексты приходят из данных. */

/** Общие контакты компании. */
export interface AboutLine {
  phone: string;
  mail: string;
  /** домен без протокола, для подписи ссылки */
  site: string;
  siteHref: string;
}

export interface AboutFact {
  /** короткое значение: «35», «2 000+» */
  v: string;
  l: string;
}

/** Шапка: картинка слева, слоган и текст справа, KPI внизу той же карточки. */
export interface AboutIntro {
  image: string;
  alt: string;
  /** короткая строка над слоганом */
  kicker: string;
  title: string;
  paragraphs: string[];
  facts: AboutFact[];
}

export interface AboutValue {
  name: string;
  text: string;
  /** имя иконки из реестра app-icon */
  icon: string;
}

export interface AboutLeader {
  name: string;
  role: string;
  /** класс портрета из оргструктуры: av1–av8 */
  av: string;
  photo?: string;
}

export interface AboutHistoryRow {
  year: string;
  /** короткая строка под годом */
  lead: string;
  text: string;
}

export interface AboutDirection {
  title: string;
  text: string;
}

export interface AboutContact {
  /** канал: «Кадровая служба» */
  title: string;
  name: string;
  role: string;
  /** пусто, если почты в легенде нет */
  mail: string;
}

export interface AboutPlace {
  title: string;
  text: string;
}
