import { Grade } from '../interface/goal';

/** Описание буквы шкалы A–E */
export const GRADE_LABELS: Record<Grade, string> = {
  A: 'Значительно превосходит ожидания',
  B: 'Превосходит ожидания',
  C: 'Соответствует ожиданиям',
  D: 'Частично соответствует',
  E: 'Не соответствует ожиданиям',
};
export const gradeLabel = (g: Grade): string => GRADE_LABELS[g];

/** Средняя оценка с учетом весов (A=5 … E=1); без весов — простая средняя */
export function weightedGrade(items: [Grade, number][]): Grade {
  const sc: Record<Grade, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const w = items.reduce((a, [, x]) => a + x, 0);
  const avg = w
    ? items.reduce((a, [g, x]) => a + sc[g] * x, 0) / w
    : items.reduce((a, [g]) => a + sc[g], 0) / (items.length || 1);
  return 'EDCBA'[Math.max(0, Math.min(4, Math.round(avg) - 1))] as Grade;
}
