import { ATT_EVENT_PEOPLE, ATT_SCALE } from '../../data/attest.data';
import { avCls } from '../../data/people.data';
import { WALLET_EMPLOYEES } from '../../data/wallet.data';
import { AttEvent, AttPerson, AttRate } from '../../interface/attest';
import { AttestStore } from '../../core/demo/attest-store.service';
import { todayDmy } from '../../shared/ui/attach/attach.utils';
import { cDur, cHM, cMin } from '../cal/cal.utils';
import { PickPerson } from '../../shared/ui/emp-pick/emp-pick';

/** «Иванов Павел Сергеевич» → «Иванов П. С.» */
export const shortFio = (n: string): string => {
  const [f, i, o] = n.split(' ');
  return o ? `${f} ${i[0]}. ${o[0]}.` : n;
};

/** участник мероприятия: ключ портрета ('me', номер) или ФИО добавленного сотрудника */
export function evPerson(x: string | number): { name: string; post: string; av: number; me: boolean } {
  const p = ATT_EVENT_PEOPLE[String(x)];
  if (p) return { name: p[0], post: p[1], av: x === 'me' ? 1 : +x, me: x === 'me' };
  const c = attPeoplePick().find((e) => e.name === x);
  return c ? { name: c.name, post: c.post, av: c.av, me: false } : { name: String(x), post: '', av: 1, me: false };
}
/** класс портрета в аватарках мероприятия (рядом нет имени — без фото по ФИО) */
export const evAvCls = (x: string | number): string => 'av' + evPerson(x).av;
/** класс портрета рядом с именем: фото по ФИО (полному или «Фамилия И. О.»), иначе портрет av */
export function avFor(name: string, av: number | string): string {
  const full = attPeoplePick().find((e) => e.name === name || shortFio(e.name) === name)?.name ?? name;
  return avCls(full, typeof av === 'number' ? av : 1);
}
/** список выбора сотрудников: люди мероприятий и сотрудники компании */
export function attPeoplePick(): PickPerson[] {
  const L: PickPerson[] = Object.entries(ATT_EVENT_PEOPLE).map(([k, v]) => ({ name: v[0], post: v[1], av: k === 'me' ? 1 : +k }));
  WALLET_EMPLOYEES.forEach((e) => {
    if (!L.some((x) => x.name === e.name)) L.push({ name: e.name, post: e.post, av: e.av });
  });
  return L;
}
/** ключ участника мероприятия по ФИО */
export function evKey(name: string): string | number {
  const k = Object.keys(ATT_EVENT_PEOPLE).find((x) => ATT_EVENT_PEOPLE[x][0] === name);
  return k == null ? name : k === 'me' ? 'me' : +k;
}

/** «20.09.2026 10:00 – 10:40» */
export const evWhen = (e: AttEvent): string => {
  const [d, t] = e.d.split(' ');
  return `${d} ${t} – ${cHM(cMin(t) + e.dur)}`;
};
export { cDur, cHM, cMin };

/** формат мероприятия для таблицы */
export const evFormat = (f: string): string => ({ Очно: 'Офлайн', Смешанный: 'Онлайн, офлайн' })[f] || f;

/** способ оценки комиссии — по роли оценивающего */
export const rateMethod = (a: AttRate): string =>
  a.t === 'Оценка комиссии'
    ? ({
        'Председатель комиссии': 'Оценка председателя комиссии',
        Председатель: 'Оценка председателя комиссии',
        'Секретарь комиссии': 'Оценка секретаря комиссии',
        Секретарь: 'Оценка секретаря комиссии',
        Эксперт: 'Оценка эксперта',
      }[a.role] ?? a.t)
    : a.t;

/** значение по шкале A–E */
export const isLetter = (v?: string): boolean => !!v && !!ATT_SCALE[v];

/** склонение: 1 оценке, 2 оценкам */
export const pl = (n: number, a: string, b: string, c: string): string =>
  a && n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c;

/** роль «Ответственный за бланк» — одна на бланк, в списке ролей участника */
export const ATT_RESP = 'Ответственный за бланк';
/** сотрудник недоступен для добавления: уже участвует или сам аттестуемый */
export const attBusy = (s: AttestStore, n: string): boolean => n === ATT_EVENT_PEOPLE['me'][0] || s.people().some((z) => z.name === n && !z.till);
/**
 * Добавить участников (сайдбар и строка под списком): роли — выбранные, кроме «Ответственный за бланк» (он один — переходит к первому);
 * возвращает текст уведомления.
 */
export function attAddPeople(s: AttestStore, names: string[], sel: string[]): string {
  const own = sel.includes(ATT_RESP),
    role = sel.filter((r) => r !== ATT_RESP).join(', '),
    since = todayDmy(),
    pick = attPeoplePick();
  s.people.update((l) => [
    ...l,
    ...names.map((n): AttPerson => {
      const e = pick.find((z) => z.name === n) || { name: n, post: '', av: 1 };
      return { role, name: n, post: e.post, av: e.av || 1, mail: '', tel: '', since };
    }),
  ]);
  if (own) s.responsible.set(names[0]);
  return (names.length > 1 ? 'Добавлено участников: ' + names.length + '.' : 'Участник ' + names[0] + ' добавлен.') + (own ? ' Ответственный за бланк сменен.' : '');
}
/** роли участника для выбора: его роли и «Ответственный за бланк», если он ответственный */
export const attRolesOf = (s: AttestStore, x: AttPerson): string[] => [...(x.role ? x.role.split(', ') : []), ...(x.name === s.responsible() ? [ATT_RESP] : [])];
/** изменить роли участника (сайдбар и строка): «Ответственный за бланк» переходит к нему или, если снят, — к руководителю; возвращает текст уведомления */
export function attSavePerson(s: AttestStore, x: AttPerson, sel: string[]): string {
  const own = sel.includes(ATT_RESP),
    was = s.responsible() === x.name;
  s.people.update((l) => l.map((z) => (z === x ? { ...z, role: sel.filter((r) => r !== ATT_RESP).join(', ') } : z)));
  if (own) s.responsible.set(x.name);
  else if (was) s.responsible.set(s.people().find((z) => z.role === 'Руководитель' && !z.till)?.name ?? '');
  return 'Изменения по ' + shortFio(x.name) + ' сохранены.' + (own && !was ? ' Ответственный за бланк сменен.' : '');
}
