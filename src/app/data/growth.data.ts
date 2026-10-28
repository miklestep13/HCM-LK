import { Growth360Row, GrowthComp, GrowthGrade, GrowthStage, GrowthStat } from '../interface/growth';

/* «Развитие» сотрудника: рейтинг 9-box, оценка 360, компетенции по профилю должности (из прототипа, #pg-growth) */

export const GROWTH_PERIOD = { cur: 'I полугодие 2026', prev: 'II полугодие 2025' };

/** этапы цикла оценки (общие с картой целей: этап «Итог» — свой) */
export const GROWTH_STAGES: { value: GrowthStage; label: string }[] = [
  { value: 'plan', label: 'Период идет' },
  { value: 'self', label: 'Самооценка' },
  { value: 'wait', label: 'На рассмотрении' },
  { value: 'done', label: 'Итог' },
];
/** этап карты целей → этап цикла оценки */
export const GROWTH_BY_GOAL_STAGE: Record<string, GrowthStage> = { draft: 'plan', appr: 'plan', plan: 'plan', self: 'self', wait: 'wait', meet: 'wait', done: 'done' };

export const GROWTH_RATING = {
  /** позиция в 9-box (0–8, слева направо, сверху вниз) */
  box: 7,
  title: 'Высокий потенциал',
  axes: ['Потенциал →', 'Результативность ↑'],
  grades: [
    { label: 'II полугодие 2025 · результативность', grade: 'B', text: 'превосходит ожидания', delta: 'выше на ступень: было C', up: true },
    { label: 'II полугодие 2025 · ценности', grade: 'A', text: 'значительно превосходит', delta: 'выше на ступень: было B', up: true },
    { label: 'I полугодие 2026 · результативность', grade: 'C', text: 'соответствует ожиданиям', delta: 'ниже на ступень: было B', up: false },
  ] as GrowthGrade[],
  stats: [
    { label: 'Достижение целей', value: '76', unit: '%', delta: '+5% за квартал' },
    { label: 'Готовность к росту', value: '68', unit: '%', delta: '+12% за полугодие' },
    { label: 'Перцентиль в управлении', value: '78', unit: '-й', delta: '+6 позиций за год' },
  ] as GrowthStat[],
};

/** источники оценки 360 и их цвета */
export const GROWTH_360_SOURCES: [string, string][] = [
  ['Самооценка', 'var(--q-primary-500)'],
  ['Руководитель', 'var(--q-badge-turquoise-color)'],
  ['Коллеги', 'var(--q-warning-500)'],
  ['Эксперты', 'var(--q-error-500)'],
];
export const GROWTH_360: Growth360Row[] = [
  { name: 'Кредитный анализ и оценка рисков', v: [72, 78, 75, 74] },
  { name: 'Знание кредитных продуктов банка', v: [80, 82, 79, 81] },
  { name: 'Использование AI-ассистентов', v: [70, 76, 78, 74] },
  { name: 'Управление сроками и приоритетами', v: [74, 57, 60, 58] },
  { name: 'Наставничество', v: [62, 70, 72, 68] },
  { name: 'Работа с возражениями клиента', v: [66, 64, 63, 65] },
];
export const GROWTH_360_INFO = { avg: '3,0', respondents: 14, delta: '+0,2 к прошлому циклу', answered: 9 };

export const GROWTH_LEVELS = ['', 'Специалист', 'Старший', 'Ведущий', 'Лидер'];
/** компетенции по профилю должности (текущий ИПР: целевой уровень — «Нужен для должности», текущий — «Сейчас») */
export const GROWTH_COMPS: GrowthComp[] = [
  { name: 'Кредитный анализ и оценка рисков', need: 3, now: 2 },
  { name: 'Знание кредитных продуктов банка', need: 3, now: 3 },
  { name: 'Управление сроками и приоритетами', need: 3, now: 1 },
  { name: 'Работа с возражениями клиента', need: 4, now: 3 },
  { name: 'Наставничество', need: 2, now: 1 },
  { name: 'Использование AI-ассистентов', need: 2, now: 1 },
];
export const GROWTH_POSITION = 'Кредитный специалист';
