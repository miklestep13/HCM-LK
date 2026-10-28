import { CAL_MONTHS_GEN, CAL_WD, CAL_WDF } from '../../data/cal.data';
import { plural } from '../../data/org.data';
import { CalEvent, CalRepeat } from '../../interface/cal';
import { TODAY } from '../../shared/ui/date-range/date-range';

/** «сегодня» демо — 30.09.2026 */
export const CAL_TODAY = new Date(TODAY);
export const cAdd = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
/** понедельник недели */
export const cMon = (d: Date): Date => cAdd(d, -((d.getDay() + 6) % 7));
export const cKey = (d: Date): string => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
export const cFromKey = (k: string): Date => {
  const p = k.split('-');
  return new Date(+p[0], +p[1], +p[2]);
};
/** минуты → «09:30» */
export const cHM = (m: number): string => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
export const cMin = (t: string): number => {
  const p = /(\d{1,2}):(\d{2})/.exec(t || '');
  return p ? +p[1] * 60 + +p[2] : 0;
};
export const cDur = (m: number): string => (m < 60 ? m + ' мин' : Math.floor(m / 60) + ' ч' + (m % 60 ? ' ' + (m % 60) + ' мин' : ''));
/** «гггг-мм-дд» ↔ Date */
export const cParse = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const cIso = (d: Date): string => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
/** «дд.мм.гггг» ↔ Date */
export const cFD = (d: Date): string => String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
export const cPD = (s: string): Date | null => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((s || '').trim());
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return d.getMonth() === +m[2] - 1 ? d : null;
};
/** день недели 0 — понедельник */
export const cWd = (d: Date): number => (d.getDay() + 6) % 7;
export const cWdShort = (d: Date): string => CAL_WD[cWd(d)];

/** встреча приходится на день (с учетом повторов) */
export function calHits(ev: CalEvent, d: Date): boolean {
  const start = cParse(ev.d);
  if (d < start) return false;
  const r = ev.rep;
  if (!r) return cKey(d) === cKey(start);
  if (r.until && d > cParse(r.until)) return false;
  const dd = Math.round((+d - +start) / 864e5), wd = cWd(d), n = r.n || 1;
  let ok =
    r.f === 'wd' ? wd < 5
    : r.f === 'd' ? dd % n === 0
    : r.f === 'w' ? !!r.days?.includes(wd) && Math.floor(dd / 7) % n === 0
    : r.f === 'm'
      ? (r.dow ? wd === cWd(start) && Math.ceil(d.getDate() / 7) === Math.ceil(start.getDate() / 7) : d.getDate() === start.getDate()) &&
        ((d.getFullYear() - start.getFullYear()) * 12 + d.getMonth() - start.getMonth()) % n === 0
    : r.f === 'y' ? d.getDate() === start.getDate() && d.getMonth() === start.getMonth()
    : false;
  if (ok && r.cnt) {
    let k = 0;
    const one = { ...ev, rep: { ...r, cnt: 0 } };
    for (let x = new Date(start); x <= d; x = cAdd(x, 1)) if (calHits(one, x)) k++;
    ok = k <= r.cnt;
  }
  return ok;
}
/** «Каждую неделю по пн, ср до 01.12.2026» */
export function calRepText(r: CalRepeat | null | undefined, d: Date): string {
  if (!r) return '';
  const n = r.n || 1;
  const end = r.until ? ' до ' + cFD(cParse(r.until)) : r.cnt ? ', ' + r.cnt + ' ' + plural(r.cnt, 'раз', 'раза', 'раз') : '';
  const t =
    r.f === 'wd' ? 'По рабочим дням'
    : r.f === 'd' ? (n > 1 ? 'Каждые ' + n + ' дня' : 'Каждый день')
    : r.f === 'w' ? (n > 1 ? 'Каждые ' + n + ' недели' : 'Каждую неделю') + ' по ' + (r.days || []).map((i) => CAL_WD[i].toLowerCase()).join(', ')
    : r.f === 'm'
      ? (n > 1 ? 'Каждые ' + n + ' месяца' : 'Каждый месяц') +
        (r.dow ? ' в ' + ['первый', 'второй', 'третий', 'четвертый', 'пятый'][Math.ceil(d.getDate() / 7) - 1] + ' ' + CAL_WDF[cWd(d)].toLowerCase() : ' ' + d.getDate() + '-го числа')
    : 'Каждый год ' + d.getDate() + ' ' + CAL_MONTHS_GEN[d.getMonth()];
  return t + end;
}
/** место встречи: ссылка или адрес */
export const calIsUrl = (v?: string): boolean => /^(https?:\/\/|www\.)/i.test(String(v || '').trim());
export const calPlace = (e: CalEvent): string =>
  e.link && (!e.loc || /^Онлайн/.test(e.loc)) ? e.link : e.loc && !/^Онлайн/.test(e.loc) ? e.loc : e.link || '';
/** хеш строки 0..1 (bkHash прототипа) */
export { hash01 as cHash } from '../../data/org.data';
