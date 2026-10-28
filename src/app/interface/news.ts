/** Блок тела новости: [тип, содержимое] — p (абзац), h (подзаголовок), ul (список), q (цитата) и т.п. */
export type NewsBodyBlock = [string, string | string[]];

/** Новость корпоративной ленты (данные прототипа, const NEWS) */
export interface NewsPost {
  id: string;
  cat: string;
  title: string;
  lead: string;
  tags: string[];
  date: string;
  time: string;
  /** комментарии / просмотры / лайки */
  cm: number;
  vw: number;
  lk: number;
  author: number;
  authorFio: string;
  body: NewsBodyBlock[];
  /** путь к обложке; нет — пост без картинки */
  img?: string;
}

/** Мероприятие компании: «18 сентября, 19:00», название, описание, формат, действие, участники */
export interface CompanyEvent {
  when: string;
  title: string;
  desc: string;
  format: string;
  action: string;
  people: number;
}

/** Опрос: вопрос + варианты с процентами (видны после голосования) */
export interface Poll {
  question: string;
  options: { text: string; pct: number }[];
  closes: string;
  votedTotal: number;
}
