import { BadgeData, MetaData, Tone } from './common';

export type LearningKind = 'crs' | 'prog' | 'ev';

/** Курс / программа / мероприятие в виджете «Обучение» */
export interface LearningItem {
  /** курс / программа / мероприятие (для перехода) */
  id?: string;
  title: string;
  image: string;
  badges: BadgeData[];
  meta: MetaData[];
  place?: string;
  /** мероприятие онлайн; link — «Онлайн» ссылкой на трансляцию (сотрудник записан) */
  online?: boolean;
  link?: boolean;
  progress?: { label: string; value: string; percent: number; tone: Tone } | null;
}

export interface LearningTab {
  key: LearningKind;
  title: string;
  count: number;
}
