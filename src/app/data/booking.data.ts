import { BkCtx, BkDeskBooking, BkRoom, BkRoomBooking, BkSeat } from '../interface/booking';
import { hash01 } from './org.data';
import { ME, PEOPLE, Person, pplList } from './people.data';

/** Города и офисы */
export const BK_CITY: Record<string, string[]> = {
  Екатеринбург: ['Малопрудная 5', 'Ленина 24'],
  'Санкт-Петербург': ['Коворкинг 815'],
  Москва: ['Пресненская наб. 12'],
};
export const BK_FEAT = ['Два монитора', 'Док-станция', 'У окна', 'Регулируемый стол'];
export const BK_EQ = [
  'Доска',
  'ПК',
  'Стол',
  'ТВ',
  'Толк',
  'Кондиционер',
  'Проектор',
  'Вторая камера',
];
/** иконки оборудования (по индексу BK_EQ) */
export const BK_EQ_ICONS: string[] = [
  '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2.6" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M5 13.8 6.4 10.6M11 13.8 9.6 10.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2.4" width="12" height="8.4" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M8 10.8v2.6M5.4 13.6h5.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 16 16" fill="none"><path d="M1.8 5.4h12.4M3.4 5.4v7.4M12.6 5.4v7.4M3.4 8.6h9.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 16 16" fill="none"><rect x="1.8" y="3" width="12.4" height="8" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M5.2 13.4h5.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="9.4" rx="5.8" ry="3" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="9.4" r="1" fill="currentColor"/><path d="M5.6 4.2a3.4 3.4 0 0 1 4.8 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 16 16" fill="none"><rect x="1.8" y="3" width="12.4" height="5.4" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M4.6 10.8v1.8M8 10.8v2.6M11.4 10.8v1.8M4.4 6.2h7.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 16 16" fill="none"><rect x="1.8" y="5" width="12.4" height="6.4" rx="1.4" stroke="currentColor" stroke-width="1.3"/><circle cx="10.4" cy="8.2" r="1.7" stroke="currentColor" stroke-width="1.3"/><path d="M4.2 8.2h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 16 16" fill="none"><rect x="1.8" y="4.4" width="8.6" height="7.2" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="m10.4 7 3.8-2v6l-3.8-2" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
];
export const BK_USER_ICON =
  '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.4" r="2.8" stroke="currentColor" stroke-width="1.4"/><path d="M2.8 13.6a5.2 5.2 0 0 1 10.4 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
const BK_RN = [
  'Зеленый город',
  'Желток',
  'Полянка',
  'Купер',
  'VIP',
  'СанСан',
  'Рубин',
  'Маяк',
  'Остров',
  'Кварц',
  'Ветер',
  'Орбита',
];
const BK_TOPIC = [
  'Кредитный комитет',
  'Встреча с клиентом',
  'Синк команды',
  'Собеседование',
  'Ретроспектива',
  'Встреча 1:1',
];
/** переговорные на плане: x, y, w, h, вместимость, оборудование */
const BK_RM: [number, number, number, number, number, number[]][] = [
  [0, 0, 280, 190, 10, [0, 1, 2, 3, 4, 5]],
  [280, 0, 200, 190, 8, [2, 1]],
  [700, 0, 140, 190, 6, [0, 1, 2, 3]],
  [840, 0, 200, 190, 8, [0, 1, 2, 3, 6, 7]],
  [0, 550, 240, 190, 10, [3, 5, 6]],
  [240, 550, 160, 190, 4, [4]],
  [960, 550, 240, 190, 12, [0, 1, 2, 3, 5, 6, 7]],
];
export const BK_ZN: Record<string, string> = {
  А: 'Опенспейс А',
  Б: 'Опенспейс Б',
  Т: 'Тихая зона',
};
export const BK_WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
/** время с 08:00 до 20:00 через 30 минут */
export const BK_TS = Array.from(
  { length: 25 },
  (_, i) => String(8 + Math.floor(i / 2)).padStart(2, '0') + (i % 2 ? ':30' : ':00'),
);
export const BK_CAPS = [
  'Любая вместимость',
  'От 4 человек',
  'От 6 человек',
  'От 8 человек',
  'От 10 человек',
];

/** демо-брони текущего пользователя: «офис|этаж|дата|место» */
export const BK_MINE_INIT: Record<string, BkDeskBooking> = {
  'Малопрудная 5|1|30.09.2026|А-06': { emp: ME[0], per: 'каждый вт, ср, пт' },
};

// ——— даты ———
export const bkPD = (s: string) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})/.exec(s || '');
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
};
export const bkFD = (d: Date) =>
  String(d.getDate()).padStart(2, '0') +
  '.' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '.' +
  d.getFullYear();
export const bkWd = (d: Date) => (d.getDay() + 6) % 7;
export const bkMin = (t: string) => {
  const m = /(\d{2}):(\d{2})/.exec(t || '');
  return m ? +m[1] * 60 + +m[2] : 0;
};
export const bkBase = (c: BkCtx) => c.office + '|' + c.floor + '|' + c.date;
export function bkAddDays(s: string, n: number, fallback: string): string {
  const d = bkPD(s) || bkPD(fallback)!;
  d.setDate(d.getDate() + n);
  return bkFD(d);
}

// ——— геометрия этажа: столы (T) и места (S) ———
interface Geo {
  T: [number, number, number, number][];
  S: Omit<BkSeat, 'f' | 'st' | 'till'>[];
}
let GEO: Geo | null = null;
export function bkGeo(): Geo {
  if (GEO) return GEO;
  const T: Geo['T'] = [],
    S: Geo['S'] = [],
    n: Record<string, number> = { А: 0, Б: 0, Т: 0 };
  const cl = (z: string, x: number, y: number, k: number) => {
    const c = T.length;
    T.push([x, y, k * 44 + 12, 46]);
    for (let r = 0; r < 2; r++)
      for (let i = 0; i < k; i++)
        S.push({
          id: z + '-' + String(++n[z]).padStart(2, '0'),
          z,
          c,
          x: x + 28 + i * 44,
          y: r ? y + 66 : y - 20,
        });
  };
  [
    [70, 270],
    [330, 270],
    [70, 420],
    [330, 420],
  ].forEach((p) => cl('А', p[0], p[1], 3));
  [
    [670, 270],
    [930, 270],
    [670, 420],
    [930, 420],
  ].forEach((p) => cl('Б', p[0], p[1], 3));
  cl('Т', 660, 622, 2);
  cl('Т', 820, 622, 2);
  return (GEO = { T, S });
}

/** места этажа на дату: свободные, занятые коллегами (детерминированно), брони пользователя */
export function bkSeats(c: BkCtx, mine: Record<string, BkDeskBooking>): BkSeat[] {
  const base = bkBase(c),
    pp = PEOPLE.filter((p) => p[0] !== ME[0]),
    off = Math.floor(hash01(base) * pp.length);
  let k = 0;
  return bkGeo().S.map((s, j) => {
    const r = hash01(base + s.id);
    const o: BkSeat = {
      ...s,
      f: [j % 3 !== 2, j % 2 === 0, s.x < 150 || s.x > 1000, j % 4 === 1],
      st: 'free',
      till: 'весь день',
    };
    const my = mine[base + '|' + s.id];
    if (my)
      return my.emp === ME[0]
        ? { ...o, st: 'mine', till: my.per }
        : { ...o, st: 'busy', p: PEOPLE.find((p) => p[0] === my.emp) || pp[0], till: my.per };
    if (r < 0.42)
      return {
        ...o,
        st: 'busy',
        p: pp[(off + k++) % pp.length],
        till: r < 0.24 ? 'весь день' : 'до ' + (13 + (Math.floor(r * 100) % 6)) + ':00',
      };
    return o;
  });
}

/** переговорные этажа на дату */
export function bkRooms(c: BkCtx, rbk: Record<string, BkRoomBooking>): BkRoom[] {
  const base = bkBase(c),
    fl = c.floor,
    pad = (h: number) => String(h).padStart(2, '0');
  return BK_RM.map((m, i) => {
    const r = hash01(base + 'r' + i);
    const o: BkRoom = {
      i,
      no: fl + '0' + (i + 1),
      n: BK_RN[(i + (fl - 1) * 3) % BK_RN.length],
      x: m[0],
      y: m[1],
      w: m[2],
      h: m[3],
      cap: m[4],
      eq: m[5].map((e) => BK_EQ[e]),
      st: 'free',
    };
    const my = rbk[base + '|' + i];
    if (my)
      return {
        ...o,
        st: 'mine',
        t: my.t,
        topic: my.topic,
        ppl: [
          ME,
          ...my.ppl.map((n) => PEOPLE.find((p) => p[0] === n)).filter((p): p is Person => !!p),
        ],
      };
    if (r < 0.42) {
      const h = 9 + (Math.floor(r * 100) % 8),
        e = pad(h + 1) + (r < 0.2 ? ':30' : ':00');
      return {
        ...o,
        st: 'busy',
        t: pad(h) + ':00 – ' + e,
        till: 'до ' + e,
        topic: BK_TOPIC[Math.floor(r * 100) % BK_TOPIC.length],
        ppl: pplList(Math.min(o.cap, 3 + (Math.floor(r * 10) % 3)), Math.floor(r * 50)),
      };
    }
    return {
      ...o,
      till: r < 0.75 ? 'до ' + (12 + (Math.floor(r * 100) % 6)) + ':00' : 'весь день',
    };
  });
}

// ——— повтор бронирования ———
export interface BkRepeat {
  type: 'day' | 'per';
  d1: string;
  d2: string;
  days: number[];
}
export function bkDates(F: BkRepeat): string[] {
  const a = bkPD(F.d1);
  if (!a) return [];
  if (F.type === 'day') return [bkFD(a)];
  const b = bkPD(F.d2);
  if (!b || b < a) return [];
  const out: string[] = [];
  for (const d = new Date(a); d <= b && out.length < 400; d.setDate(d.getDate() + 1))
    if (F.days[bkWd(d)]) out.push(bkFD(d));
  return out;
}
export function bkRepL(F: { days: number[] }): string {
  const j = F.days.join('');
  return j === '1111100'
    ? 'каждый рабочий день'
    : j === '1111111'
      ? 'каждый день'
      : 'каждый ' +
        BK_WD.filter((_, i) => F.days[i])
          .map((d) => d.toLowerCase())
          .join(', ');
}
