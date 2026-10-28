/** Модели страницы «О компании» */
export interface AboutFact {
  /** значение крупно: «34», «1 млн+» */
  v: string;
  l: string;
}
export interface AboutProject {
  title: string;
  sub: string;
  text: string;
  /** короткие факты-чипсы внизу карточки */
  facts: string[];
}
export interface AboutHistoryRow {
  year: string;
  text: string;
}
export interface AboutValue {
  /** эмодзи */
  icon: string;
  name: string;
  text: string;
}
export interface AboutLeader {
  name: string;
  role: string;
  photo: string;
}
export interface AboutStep {
  title: string;
  text: string;
}
