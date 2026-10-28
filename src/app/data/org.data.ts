import { EmployeeCard, OrgNode } from '../interface/org';
import { EMPLOYEES } from './people.data';

/** Оргструктура «Меридиан Банка» (const ORG прототипа) */
export const ORG: OrgNode[] = [
  {
    id: 'ceo',
    parent: null,
    name: 'Сорокин Андрей Викторович',
    role: 'Генеральный директор',
    unit: 'Вся компания',
    av: 'av8',
  },
  {
    id: 'dev',
    parent: 'ceo',
    name: 'Громов Алексей Петрович',
    role: 'Директор по развитию',
    unit: 'Дирекция развития',
    av: 'av4',
  },
  {
    id: 'ux',
    parent: 'dev',
    name: 'Федорова Юлия Сергеевна',
    role: 'Директор департамента',
    unit: 'Управление банковских продуктов',
    photo: 'assets/img/people/colleague-1.webp',
  },
  {
    id: 'u1',
    parent: 'ux',
    name: 'Крылов Михаил Петрович',
    role: 'Специалист по кредитованию, специалист',
    unit: '',
    photo: 'assets/img/people/ivanov.webp',
  },
  {
    id: 'u2',
    parent: 'ux',
    name: 'Лебедев Артем Сергеевич',
    role: 'Специалист по кредитованию, старший специалист',
    unit: '',
    photo: 'assets/img/people/colleague-5.webp',
  },
  {
    id: 'u3',
    parent: 'ux',
    name: 'Гусева Нина Павловна',
    role: 'Менеджер продукта',
    unit: '',
    photo: 'assets/img/people/colleague-2.webp',
  },
  {
    id: 'u4',
    parent: 'ux',
    name: 'Кузьмин Петр Иванович',
    role: 'Специалист, ведущий специалист',
    unit: '',
    photo: 'assets/img/people/colleague-4.webp',
  },
  {
    id: 'n1',
    parent: 'ux',
    name: 'Никитина Ольга Сергеевна',
    role: 'Ведущий аналитик',
    unit: 'Управление методологии',
    av: 'av3',
  },
  {
    id: 'u5',
    parent: 'ux',
    name: 'Белова Мария Андреевна',
    role: 'Менеджер продукта',
    unit: '',
    av: 'av2',
  },
  {
    id: 'u6',
    parent: 'ux',
    name: 'Морозова Ксения Павловна',
    role: 'Менеджер банковских продуктов',
    unit: '',
    av: 'av7',
  },
  {
    id: 'u7',
    parent: 'ux',
    name: 'Панова Алина Викторовна',
    role: 'Ведущий менеджер продукта',
    unit: '',
    av: 'av1',
  },
  {
    id: 'op',
    parent: 'dev',
    name: 'Дронова Мария Ильинична',
    role: 'Руководитель центра',
    unit: 'Операционный департамент',
    photo: 'assets/img/people/p-1ccb408cd3.webp',
  },
  {
    id: 'o1',
    parent: 'op',
    name: 'Мельник Артур Русланович',
    role: 'Методолог банковских процессов',
    unit: '',
    av: 'av7',
  },
  {
    id: 'o2',
    parent: 'op',
    name: 'Соколова Екатерина Дмитриевна',
    role: 'Кредитный аналитик',
    unit: '',
    photo: 'assets/img/people/p-f4655e1890.webp',
  },
  {
    id: 'o3',
    parent: 'op',
    name: 'Егорова Татьяна Юрьевна',
    role: 'Методолог банковских процессов',
    unit: '',
    av: 'av5',
  },
  {
    id: 'd0',
    parent: 'dev',
    name: 'Орлов Дмитрий Викторович',
    role: 'Старший аналитик',
    unit: '',
    photo: 'assets/img/people/p-729158f7d3.webp',
  },
  {
    id: 'tech',
    parent: 'ceo',
    name: 'Лавров Константин Игоревич',
    role: 'Директор по рискам',
    unit: 'Департамент розничного бизнеса',
    av: 'av4',
  },
  {
    id: 'gui',
    parent: 'tech',
    name: 'Волков Андрей Ильич',
    role: 'Руководитель отдела',
    unit: 'Управление кредитования',
    av: 'av4',
  },
  {
    id: 'g1',
    parent: 'gui',
    name: 'Попов Максим Андреевич',
    role: 'Специалист по кредитованию',
    unit: '',
    av: 'av2',
  },
  {
    id: 'g2',
    parent: 'gui',
    name: 'Орлов Денис Викторович',
    role: 'Специалист по кредитованию',
    unit: '',
    av: 'av1',
  },
  {
    id: 'g3',
    parent: 'gui',
    name: 'Шестаков Илья Олегович',
    role: 'Специалист по кредитованию',
    unit: '',
    av: 'av1',
  },
  {
    id: 'arc',
    parent: 'tech',
    name: 'Козлов Сергей Петрович',
    role: 'Руководитель центра',
    unit: 'Управление рисков',
    av: 'av6',
  },
  {
    id: 'a1',
    parent: 'arc',
    name: 'Соловьев Игорь Петрович',
    role: 'Риск-менеджер',
    unit: '',
    av: 'av1',
  },
  {
    id: 'a2',
    parent: 'arc',
    name: 'Никитин Олег Васильевич',
    role: 'Специалист казначейских операций',
    unit: '',
    av: 'av6',
  },
  {
    id: 'qa',
    parent: 'tech',
    name: 'Киселев Роман Олегович',
    role: 'Руководитель отдела',
    unit: 'Отдел операционного контроля',
    av: 'av3',
  },
  {
    id: 'q1',
    parent: 'qa',
    name: 'Кузнецова Полина Сергеевна',
    role: 'Специалист операционного контроля',
    unit: '',
    av: 'av1',
  },
  {
    id: 'q2',
    parent: 'qa',
    name: 'Громов Илья Сергеевич',
    role: 'Специалист операционного контроля',
    unit: '',
    av: 'av5',
  },
  {
    id: 'q3',
    parent: 'qa',
    name: 'Семенов Артем Романович',
    role: 'Специалист операционного контроля',
    unit: '',
    av: 'av8',
  },
  {
    id: 'com',
    parent: 'ceo',
    name: 'Васильев Игорь Николаевич',
    role: 'Коммерческий директор',
    unit: 'Корпоративный блок',
    av: 'av8',
  },
  {
    id: 'c1',
    parent: 'com',
    name: 'Зотова Дарья Андреевна',
    role: 'Менеджер по работе с клиентами',
    unit: '',
    av: 'av3',
  },
  {
    id: 'c2',
    parent: 'com',
    name: 'Павлова Елена Викторовна',
    role: 'Менеджер по работе с клиентами',
    unit: '',
    av: 'av7',
  },
  {
    id: 'c3',
    parent: 'com',
    name: 'Лебедева Анна Игоревна',
    role: 'Менеджер проектов',
    unit: '',
    av: 'av4',
  },
  {
    id: 'hr',
    parent: 'ceo',
    name: 'Смирнова Виктория Олеговна',
    role: 'Директор по персоналу',
    unit: 'HR-дирекция',
    av: 'av3',
  },
  {
    id: 'h1',
    parent: 'ux',
    name: 'Иванов Павел Сергеевич',
    role: 'Кредитный специалист',
    unit: '',
    photo: 'assets/img/people/ivanov.webp',
  },
  {
    id: 'h2',
    parent: 'hr',
    name: 'Титова Ольга Андреевна',
    role: 'Специалист по адаптации',
    unit: '',
    photo: 'assets/img/people/p-2f199cb325.webp',
  },
  {
    id: 'h3',
    parent: 'hr',
    name: 'Фролова Дарья Алексеевна',
    role: 'Рекрутер',
    unit: '',
    av: 'av6',
  },
  {
    id: 'h4',
    parent: 'hr',
    name: 'Кравцова Елена Сергеевна',
    role: 'Специалист по обучению',
    unit: '',
    av: 'av6',
  },
  {
    id: 'h5',
    parent: 'hr',
    name: 'Никифоров Глеб Андреевич',
    role: 'HR-аналитик',
    unit: '',
    av: 'av2',
  },
];

/** узел текущего пользователя (Иванов П. С.) и подразделение, которое схема показывает по умолчанию */
export const ORG_ME = 'h1';
export const ORG_HOME = 'hr';

export const ORG_BY_ID: Record<string, OrgNode> = Object.fromEntries(ORG.map((n) => [n.id, n]));
export const orgKids = (id: string): string[] =>
  ORG.filter((n) => n.parent === id).map((n) => n.id);
/** подразделение узла: свое или ближайшего руководителя */
export const orgUnit = (id: string): string => {
  for (
    let n: OrgNode | undefined = ORG_BY_ID[id];
    n;
    n = n.parent ? ORG_BY_ID[n.parent] : undefined
  )
    if (n.unit) return n.unit;
  return '';
};
/** всего в подчинении (все уровни) */
export const orgTotal = (id: string): number =>
  orgKids(id).reduce((a, k) => a + 1 + orgTotal(k), 0);
/** цепочка от генерального директора до узла */
export const orgPath = (id: string): string[] => {
  const out: string[] = [];
  for (let a: string | null = id; a; a = ORG_BY_ID[a].parent) out.unshift(a);
  return out;
};
/** «Смирнова Виктория Олеговна» → «Смирнова В. О.» */
export const shortFio = (n: string): string => {
  const p = n.split(' ');
  return (
    p[0] +
    ' ' +
    p
      .slice(1)
      .map((x) => x[0] + '.')
      .join(' ')
  );
};

/** детерминированное «случайное» число 0…1 по строке (bkHash прототипа) — для демо-телефонов, стажа и т. п. */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TRL: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};
const trl = (s: string) =>
  s
    .toLowerCase()
    .split('')
    .map((c) => TRL[c] ?? c)
    .join('');
/** логин для почты: «Крылов Михаил» → mkrylov */
export const empLogin = (n: string): string => {
  const p = n.split(' ');
  return (p[1] ? trl(p[1][0]) : '') + trl(p[0]);
};
export const plural = (n: number, one: string, few: string, many: string): string => {
  const m10 = n % 10,
    m100 = n % 100;
  return m10 === 1 && m100 !== 11
    ? one
    : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)
      ? few
      : many;
};

/** Карточка сотрудника для узла схемы: из раздела «Сотрудники», а если его там нет — собранная по оргструктуре (как ogEcard) */
export function orgCard(id: string): EmployeeCard {
  const n = ORG_BY_ID[id],
    me = id === ORG_ME;
  const known = EMPLOYEES.find((e) => e.name === n.name);
  if (known) return { ...known, me };
  const hs = hash01(n.name),
    path = orgPath(id),
    dep = path[1] ? orgUnit(path[1]) : orgUnit(id);
  const y = 1 + Math.floor(hs * 9),
    m = Math.floor(hs * 97) % 12,
    ph = String(Math.floor(hs * 9e6)).padStart(7, '0');
  return {
    name: n.name,
    role: n.role,
    photo: n.photo,
    av: n.av,
    me,
    rows: [
      { key: 'dept', label: 'Департамент', value: dep || '—' },
      { key: 'unit', label: 'Подразделение', value: orgUnit(id) || '—' },
      { key: 'city', label: 'Город офиса', value: 'Санкт-Петербург' },
      {
        key: 'phone',
        label: 'Телефон',
        value: `+7 9${ph.slice(0, 2)} ${ph.slice(2, 5)} ${ph.slice(5, 7)} ${String(Math.floor(hs * 97)).padStart(2, '0')}`,
      },
      { key: 'mail', label: 'Почта', value: empLogin(n.name) + '@meridianbank.ru', link: true },
      {
        key: 'mgr',
        label: 'Руководитель',
        value: n.parent ? shortFio(ORG_BY_ID[n.parent].name) : '—',
      },
      {
        key: 'exp',
        label: 'Стаж в компании',
        value: `${y} ${plural(y, 'год', 'года', 'лет')}${m ? ' ' + m + ' мес.' : ''}`,
      },
    ],
  };
}
