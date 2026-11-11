import { AudCond, AudGroup } from '../interface/audience';
import { Member } from '../interface/member';
import { COMM_POOL } from './comm.data';
import { POLL_CONDITIONS } from './polls.data';

/** Условия отбора участников (widgets/audience): поля и значения, подбор сотрудников */

/** сотрудники для подбора (без групп) */
export const AUD_POOL: Member[] = COMM_POOL.filter((m) => !m.kind);
const uniq = (l: (string | undefined)[]) => [...new Set(l.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'ru'));
/** поля условий и их значения: подразделение и должность — как в карточках сотрудников, остальные — справочники */
export const AUD_FIELDS: Record<string, string[]> = {
  ...POLL_CONDITIONS,
  Подразделение: uniq(AUD_POOL.map((m) => m.dep)),
  Должность: uniq(AUD_POOL.map((m) => m.pos)),
};
export const AUD_OPS: { value: 'in' | 'out'; label: string }[] = [
  { value: 'in', label: 'Включает' },
  { value: 'out', label: 'Исключает' },
];

export const audCond = (): AudCond => ({ f: '', op: 'in', v: [] });
export const audGroup = (): AudGroup => ({ c: [audCond()] });

const hash = (s: string) => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return h;
};
/** значение поля у сотрудника: подразделение и должность — из карточки, остальное — демо (стабильно по ФИО) */
export function audAttr(m: Member, f: string): string {
  if (f === 'Подразделение' && m.dep) return m.dep;
  if (f === 'Должность') return m.pos;
  const l = AUD_FIELDS[f] ?? [];
  return l.length ? l[hash(m.n + f) % l.length] : '';
}
/** условие заполнено: есть поле и хотя бы одно значение */
export const audReady = (c: AudCond) => !!c.f && c.v.length > 0;
/** подходит ли сотрудник: хотя бы одна группа, где выполнены все заполненные условия */
export function audFits(m: Member, groups: AudGroup[]): boolean {
  return groups.some((g) => {
    const cs = g.c.filter(audReady);
    return cs.length > 0 && cs.every((c) => (c.op === 'in') === c.v.includes(audAttr(m, c.f)));
  });
}
/** подобранные сотрудники */
export function audMatch(pool: Member[], groups: AudGroup[]): Member[] {
  return pool.filter((m) => audFits(m, groups));
}
/** есть хотя бы одно заполненное условие */
export const audAny = (groups: AudGroup[]) => groups.some((g) => g.c.some(audReady));
