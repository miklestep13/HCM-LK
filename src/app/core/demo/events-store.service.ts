import { Injectable, computed, inject, signal } from '@angular/core';
import { CAL_MONTHS_GEN as MONTHS_GEN } from '../../data/cal.data';
import { EVENT_TYPES } from '../../data/events.data';
import { LEARN_EVENT_INFO } from '../../data/learn-course.data';
import { LEARN_CATALOG, LEARN_EVENTS } from '../../data/learn.data';
import { ME } from '../../data/people.data';
import { LearnCard } from '../../interface/learn';
import { CompanyEvent } from '../../interface/news';
import { Member } from '../../interface/member';
import { LearnStore } from './learn-store.service';

/** Поля формы мероприятия (как в «Добавлении встречи» Q.HCM): основные, дополнительные настройки и повторение, обложка, участники */
export interface EventForm {
  type: string;
  title: string;
  /** начало: дд.мм.гггг и чч:мм */
  date: string;
  time: string;
  /** окончание: дд.мм.гггг и чч:мм */
  endDate: string;
  endTime: string;
  /** место: адрес или ссылка встречи (ссылка — онлайн) */
  place: string;
  status: string;
  desc: string;
  // дополнительные настройки
  remind: string;
  busy: string;
  /** направить ИИ-протокол участникам после окончания */
  aiProto: boolean;
  /** весь день — без точного времени */
  allDay: boolean;
  tpl: boolean;
  /** повторение: правило («Не повторять» — разовое); начало — дата мероприятия */
  repFrom: string;
  repKind: string;
  /** интервал: каждые N дней / недель / месяцев / лет */
  repN: number;
  /** дни недели (0 — пн … 6 — вс) — для «Еженедельно» */
  repDays: number[];
  /** ежемесячно: в то же число (day) или в тот же день недели месяца (week) */
  repMonth: 'day' | 'week';
  /** окончание: никогда / в дату (repTo) / после N повторений (repCount) */
  repEnd: 'never' | 'date' | 'cnt';
  repTo: string;
  repCount: number;
  /** обложка (data URL) */
  cover: string | null;
  people: Member[];
}

/** пустая форма: организатор — текущий пользователь */
export const emptyEvent = (): EventForm => ({
  type: 'Мероприятие', title: '', date: '', time: '', endDate: '', endTime: '', place: '', status: 'Запланирована', desc: '',
  remind: 'За 15 минут', busy: 'Занят', aiProto: false, allDay: false, tpl: false,
  repFrom: '', repKind: 'Не повторять', repN: 1, repDays: [], repMonth: 'day', repEnd: 'never', repTo: '', repCount: 10,
  cover: null, people: [{ n: ME[0], pos: ME[1], av: 1, role: 'Организатор' }],
});

const z = (n: number) => String(n).padStart(2, '0');
/** «дд.мм.гггг» + «чч:мм» → дата (или null) */
export const parseDT = (d: string, t: string): Date | null => {
  const a = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d.trim()), b = /^(\d{1,2}):(\d{2})$/.exec(t.trim() || '00:00');
  return a && b ? new Date(+a[3], +a[2] - 1, +a[1], +b[1], +b[2]) : null;
};
const fmtD = (x: Date) => `${z(x.getDate())}.${z(x.getMonth() + 1)}.${x.getFullYear()}`;
const fmtT = (x: Date) => `${z(x.getHours())}:${z(x.getMinutes())}`;
/** «1 ч 30 мин» / «45 мин» / «7 ч» → минуты */
const durMin = (s = '') => (+(/(\d+)\s*ч/.exec(s)?.[1] ?? 0)) * 60 + +(/(\d+)\s*мин/.exec(s)?.[1] ?? 0);
/** минуты → «1 ч 30 мин» */
export const durText = (m: number) => [Math.floor(m / 60) ? Math.floor(m / 60) + ' ч' : '', m % 60 ? (m % 60) + ' мин' : ''].filter(Boolean).join(' ');

/** обложка нового мероприятия */
const NEW_IMG = 'assets/img/learn/c26.webp';

/**
 * Мероприятия компании для страницы «Мероприятия»: мои (из «Моего обучения») и из каталога — карточки как в обучении.
 * Админ добавляет, редактирует и удаляет мероприятия (в демо — до перезагрузки). Новые мероприятия попадают в LEARN_EVENTS,
 * чтобы кнопка записи и страница мероприятия работали как у остальных.
 */
@Injectable({ providedIn: 'root' })
export class EventsStore {
  private readonly learn = inject(LearnStore);
  private readonly added = signal<LearnCard[]>([]);
  private readonly edits = signal<Record<string, Partial<LearnCard>>>({});
  private readonly removed = signal<Set<string>>(new Set());
  /** поля формы, которых нет на карточке (тип, статус, описание, участники …) */
  private readonly extra = signal<Record<string, EventForm>>({});

  /** все мероприятия: дата и место — из данных мероприятия */
  readonly list = computed(() => {
    const my = this.learn.my().ev,
      ids = new Set(my.map((c) => c.id)),
      cat = LEARN_CATALOG.ev.filter((c) => !ids.has(c.id)).map((c) => ({ ...c, date: dateOf(c.id), dur: LEARN_EVENTS[c.id]?.dur, place: LEARN_EVENTS[c.id]?.pl ?? null })),
      ed = this.edits(),
      del = this.removed();
    return [...this.added(), ...my, ...cat].filter((c) => !del.has(c.id)).map((c) => (ed[c.id] ? { ...c, ...ed[c.id] } : c));
  });

  /** варианты места — из самих мероприятий (фильтр «Место») */
  readonly opts = computed(() => {
    const L = this.list(), uniq = (l: (string | null | undefined)[]) => [...new Set(l.filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, 'ru'));
    return { place: uniq(L.map((c) => c.place || 'Онлайн')) };
  });

  /** карточка мероприятия по id */
  card(id: string): LearnCard | undefined {
    return this.list().find((x) => x.id === id);
  }

  /** ближайшие запланированные мероприятия для виджета «Мероприятия» (обзор компании, новости) */
  upcoming(n = 4): CompanyEvent[] {
    return this.list()
      .map((c) => ({ c, f: this.formOf(c.id)! }))
      .filter(({ f }) => f && f.status === 'Запланирована' && parseDT(f.date, f.time))
      .sort((a, b) => +parseDT(a.f.date, a.f.time)! - +parseDT(b.f.date, b.f.time)!)
      .slice(0, n)
      .map(({ c, f }) => {
        const d = parseDT(f.date, f.time)!, info = LEARN_EVENT_INFO[c.id], p = f.people;
        return {
          ev: c.id,
          live: !!c.live,
          when: d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + (f.time ? ', ' + f.time : ''),
          title: c.title,
          desc: isLink(f.place) ? 'Онлайн' : f.place || 'Онлайн',
          // приглашено — как в карточке мероприятия
          people: info && p.length <= 2 ? info.l * 6 + 40 : p.reduce((a, m) => a + (m.cnt || 1), 0),
        };
      });
  }

  /** статус мероприятия (Запланирована / Проведена / Отменена) — бейдж на карточке и в просмотре */
  statusOf(id: string): string {
    return this.formOf(id)?.status || '';
  }
  /** место проведения: адрес или ссылка онлайн-встречи */
  placeOf(id: string): string {
    return this.formOf(id)?.place || '';
  }

  /** форма для редактирования и просмотра: сохраненная или собранная из карточки и данных обучения */
  formOf(id: string): EventForm | null {
    const saved = this.extra()[id];
    if (saved) {
      const f = { ...emptyEvent(), ...structuredClone(saved) };
      // прежние типы (тренинг, вебинар …) — «Мероприятие»
      if (!EVENT_TYPES.includes(f.type)) f.type = 'Мероприятие';
      return f;
    }
    const c = this.list().find((x) => x.id === id);
    if (!c) return null;
    const [date = '', time = ''] = (c.date || '').split(' '),
      st = parseDT(date, time),
      end = st && new Date(st.getTime() + durMin(c.dur) * 60000);
    // из данных обучения: описание, докладчик (спикер), проведено ли
    const info = LEARN_EVENT_INFO[id],
      sp: Member[] = info?.tr ? [{ n: info.tr, pos: info.cat || info.sp || '', av: 2, role: 'Спикер' }] : [];
    return {
      ...emptyEvent(),
      type: 'Мероприятие',
      title: c.title,
      date,
      time,
      endDate: end ? fmtD(end) : '',
      endTime: end ? fmtT(end) : '',
      place: c.place || meetLinkOf(id),
      status: this.learn.eventStatus(id) === 'Проведен' ? 'Проведена' : 'Запланирована',
      desc: info?.ab || '',
      people: [...emptyEvent().people, ...sp],
    };
  }

  add(f: EventForm): void {
    const id = 'tn' + Date.now();
    this.sync(id, f);
    this.extra.update((x) => ({ ...x, [id]: f }));
    this.added.update((l) => [{ id, ...this.fields(f) } as LearnCard, ...l]);
  }
  update(id: string, f: EventForm): void {
    this.sync(id, f);
    this.extra.update((x) => ({ ...x, [id]: f }));
    this.edits.update((e) => ({ ...e, [id]: this.fields(f, true) }));
  }
  remove(id: string): void {
    this.removed.update((s) => new Set(s).add(id));
  }

  /** поля карточки; при правке без новой обложки картинка остается прежней */
  private fields(f: EventForm, edit = false): Partial<LearnCard> {
    const place = isLink(f.place) ? '' : f.place.trim();
    return {
      title: f.title,
      ...(f.cover || !edit ? { img: f.cover || NEW_IMG } : {}),
      date: f.allDay ? f.date : f.date + ' ' + f.time,
      dur: durOf(f),
      place: place || null,
      tag: place ? 'Очно' : 'Онлайн',
    };
  }
  /** данные мероприятия для записи и страницы мероприятия */
  private sync(id: string, f: EventForm): void {
    LEARN_EVENTS[id] = { ...LEARN_EVENTS[id], t: f.title, d: f.allDay ? f.date : f.date + ' ' + f.time + '–' + f.endTime, dur: durOf(f), pl: (!isLink(f.place) && f.place.trim()) || undefined };
  }
}

/** «01.10.2026 10:00–17:00» → «01.10.2026 10:00» */
const dateOf = (id: string) => (LEARN_EVENTS[id]?.d || '').split('–')[0];
/** ссылка встречи (онлайн) — не место */
export const isLink = (s: string) => /^https?:\/\//.test(s.trim());
/** ссылка на онлайн-встречу: https://meet.meridian.bank/abc-defg-hij */
export const meetLink = () => {
  const r = (n: number) => Array.from({ length: n }, () => 'abcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 25)]).join('');
  return `https://meet.meridian.bank/${r(3)}-${r(4)}-${r(3)}`;
};
/** постоянная ссылка онлайн-встречи для мероприятия без места (одна и та же для одного id) */
export const meetLinkOf = (id: string) => {
  const A = 'abcdefghijkmnopqrstuvwxyz';
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 1000003;
  const r = (n: number) => Array.from({ length: n }, () => A[(h = (h * 48271 + 11) % 2147483647) % A.length]).join('');
  return `https://meet.meridian.bank/${r(3)}-${r(4)}-${r(3)}`;
};
/** ссылка без https:// — для показа */
export const linkText = (s: string) => s.trim().replace(/^https?:\/\//, '');
/** длительность для карточки: «Весь день» или разница начала и окончания */
const durOf = (f: EventForm) => {
  if (f.allDay) return 'Весь день';
  const a = parseDT(f.date, f.time), b = parseDT(f.endDate || f.date, f.endTime);
  return a && b && b > a ? durText(Math.round((b.getTime() - a.getTime()) / 60000)) : '';
};
