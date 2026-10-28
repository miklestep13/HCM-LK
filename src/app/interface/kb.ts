/** Тип материала базы знаний: learn, doc, news, egl, page, pat */
export type KbType = 'learn' | 'doc' | 'news' | 'egl' | 'page' | 'pat';

/** Блок тела статьи: [тип, содержимое] — p, h, ul, ol, img (номер фото курса) */
export type KbBlock = [string, string | number | string[]];

/** Комментарий: [портрет av1–8 (0 — свой), автор, дата, текст, лайки] */
export type KbComment = [number, string, string, string, number];

export interface KbFile { id: string; name: string; size: number; date: string; }

/** Статья базы знаний (const KB_ART прототипа) */
export interface KbArticle {
  id: string;
  type: KbType;
  /** обложка (путь), если есть */
  cover?: string;
  files?: KbFile[];
  /** подзаголовок раздела, например «Первые шаги» */
  group?: string;
  title: string;
  /** раздел (KB_SEC) */
  sec: string;
  /** «12.05.2026 10:30» */
  date: string;
  tags: string[];
  likes: number;
  views: number;
  excerpt: string;
  body: KbBlock[];
  comments?: KbComment[];
}

export interface KbSection { id: string; name: string; children?: KbSection[]; }

/** Идея в «Банке идей» */
export interface Idea {
  id: string;
  /** своя идея */
  my?: boolean;
  /** автор (идея коллеги) */
  author?: string;
  title: string;
  status: IdeaStatus;
  date: string;
  votes: number;
  dir: string;
  problem?: string;
  solution?: string;
  /** только экспертам */
  private?: boolean;
  /** ответ эксперта: [ФИО, должность, дата, текст] */
  answer?: [string, string, string, string];
  /** пользователь поддержал */
  voted?: boolean;
}
export type IdeaStatus = 'На модерации' | 'На рассмотрении' | 'Принята' | 'Внедрена' | 'Отклонена';

/** Частый вопрос: тема, вопрос, ответ, ссылка [текст, 'go:страница' | 'kb:название статьи'] */
export interface Faq { topic: string; q: string; a: string; link?: [string, string]; }
