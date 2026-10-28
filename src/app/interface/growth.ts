/** Этап цикла оценки на странице «Развитие» */
export type GrowthStage = 'plan' | 'self' | 'wait' | 'done';

/** Оценка за период в блоке «Рейтинг сотрудника» */
export interface GrowthGrade {
  label: string;
  grade: string;
  text: string;
  delta: string;
  up: boolean;
}

/** Показатель рейтинга: значение и изменение */
export interface GrowthStat {
  label: string;
  value: string;
  unit: string;
  delta: string;
}

/** Компетенция оценки 360: оценки в % — самооценка, руководитель, коллеги, эксперты */
export interface Growth360Row {
  name: string;
  v: [number, number, number, number];
}

/** Компетенция профиля должности: уровни 1 Специалист · 2 Старший · 3 Ведущий · 4 Лидер */
export interface GrowthComp {
  name: string;
  need: number;
  now: number;
}
