import { Injectable, computed, inject, signal } from '@angular/core';
import { LegacyService } from '../legacy/legacy.service';
import { NavService } from '../navigation/nav.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { LEARN_COMMENTS, LEARN_COURSE_INFO, LEARN_EVENT_INFO, LEARN_FAIL, LEARN_POS, LEARN_TRY } from '../../data/learn-course.data';
import {
  LEARN_ACCESS,
  LEARN_BLOCKS,
  LEARN_CATALOG,
  LEARN_CAT_EVENT_STATUS,
  LEARN_COURSES,
  LEARN_DONE,
  LEARN_EVENTS,
  LEARN_EV_CLOSED,
  LEARN_MY,
  LEARN_MY_EVENT_STATUS,
  LEARN_NO_REPEAT,
  LEARN_PROGRAMS,
} from '../../data/learn.data';
import { LearnAction, LearnBlock, LearnCard, LearnComment, LearnKind, LearnProgram, LearnProgress } from '../../interface/learn';
import { LearningItem } from '../../interface/learning';
import { Tone } from '../../interface/common';

/** цвет бейджа статуса (LF_STC прототипа) */
export const LEARN_TONE: Record<string, string> = {
  'В процессе': 'warn',
  Просрочен: 'dg',
  Завершен: 'ok',
  Завершена: 'ok',
  'Открыта запись': 'info',
  'Вы записаны': 'ok',
};
/** сотрудник уже работает с курсом / программой */
export const LEARN_WORK = /Назначен|В процессе|Просрочен|Завершен|Вы записаны|Проведен|Идет сейчас/;

/** тип блока курса: явный, иначе по названию (lfType) */
export const learnType = (b: LearnBlock): string => {
  const t = b[0];
  return (
    b[3] ||
    (/тест|провер|итоговая оценка/i.test(t)
      ? 'test'
      : /задани|кейс|практик|проект|защита|постановка задачи|разбор/i.test(t)
        ? 'task'
        : /регламент|памятк|шаблон|документ|чек-лист|требовани|норматив/i.test(t)
          ? 'pdf'
          : /обзор|карта|структура|схема/i.test(t)
            ? 'pres'
            : /основ|введение|что такое|типы|принцип|понятия|термин/i.test(t)
              ? 'text'
              : 'video')
  );
};
/** блок плеера: раздел, название, описание, длительность, тип, текст */
export interface LearnFlatBlock {
  sec: string;
  si: number;
  t: string;
  d: string;
  m: string;
  k: string;
  x?: string;
}
/** все модули курса подряд (lfBlocks) */
export const learnBlocks = (id: string): LearnFlatBlock[] =>
  (LEARN_COURSE_INFO[id]?.s || []).flatMap((sec, si) => sec[1].map((b) => ({ sec: sec[0], si, t: b[0], d: b[1], m: b[2], k: learnType(b), x: b[4] })));
/** «15 мин» / «1 ч 30 мин» / «11:00–11:40» → минуты */
export const learnMin = (t: string): number => {
  const r = /(\d+):(\d+)\s*[–-]\s*(\d+):(\d+)/.exec(t);
  if (r) return +r[3] * 60 + +r[4] - (+r[1] * 60 + +r[2]);
  const h = /(\d+)\s*ч/.exec(t), m = /(\d+)\s*мин/.exec(t);
  return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0);
};
export const learnDur = (n: number): string => (n >= 60 ? Math.floor(n / 60) + ' ч' + (n % 60 ? ' ' + (n % 60) + ' мин' : '') : n + ' мин');
/** иконка и подпись типа блока (конструктор курса) */
export const LEARN_MICO: Record<string, [string, string]> = {
  video: ['mMedia', 'Медиа-файл'],
  text: ['mText', 'Текст'],
  pres: ['mPres', 'Презентация'],
  pdf: ['mDoc', 'Документ'],
  test: ['mQuiz', 'Тестирование'],
  task: ['mTask', 'Задание'],
  kb: ['mKb', 'Статья из БЗ'],
};
/** прохождение курса в плеере: модули просмотрены, тест не сдан, задание на проверке */
export interface LearnPlayState {
  done: number[];
  fail: number[];
  review: number[];
}

const plural = (n: number, f: [string, string, string]) =>
  f[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];

/** то, что «Обучение» делит со старым прототипом (страницы курса, программы и плеер пока там) */
interface LearnShared {
  crs: Record<string, string>;
  acc: Record<string, string>;
  trn: Record<string, string>;
  cat: Record<string, string>;
  my: { crs: string[]; ev: string[] };
  done: Record<string, number>;
  progs: Record<string, LearnProgram>;
  lt?: 'my' | 'cat';
}

/**
 * Демо-хранилище обучения сотрудника: статусы курсов, программ и мероприятий, доступ к курсам каталога,
 * карточки «Моего обучения». Правила карточек — как lfCard / lfBtns / lfEvBtns прототипа.
 */
@Injectable({ providedIn: 'root' })
export class LearnStore {
  /** статус сотрудника по курсам (COURSES[].st) */
  readonly courses = signal<Record<string, string>>(Object.fromEntries(Object.entries(LEARN_COURSES).map(([k, v]) => [k, v.st])));
  readonly access = signal<Record<string, string>>({ ...LEARN_ACCESS });
  /** статус участия в мероприятиях «Моего обучения» */
  readonly events = signal<Record<string, string>>({ ...LEARN_MY_EVENT_STATUS });
  /** статус мероприятий в каталоге */
  readonly catEvents = signal<Record<string, string>>({ ...LEARN_CAT_EVENT_STATUS });
  readonly programs = signal<Record<string, LearnProgram>>(structuredClone(LEARN_PROGRAMS));
  readonly done = signal<Record<string, number>>({ ...LEARN_DONE });
  /** порядок карточек «Моего обучения» (записи из каталога добавляются) */
  readonly myIds = signal({ crs: LEARN_MY.crs.map((c) => c.id), ev: LEARN_MY.ev.map((c) => c.id) });
  /** последний раздел: «Мое обучение» / «Каталог» (для возврата со страницы курса) */
  readonly lt = signal<'my' | 'cat'>('my');
  /** комментарии к курсу (отзыв после прохождения — первым) */
  readonly comments = signal<LearnComment[]>(structuredClone(LEARN_COMMENTS));
  /** оставшиеся попытки теста по курсам */
  readonly attempts = signal<Record<string, number>>({});
  /** прохождение курсов в плеере */
  readonly play = signal<Record<string, LearnPlayState>>({});
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);

  private readonly cardOf = (kind: 'crs' | 'ev', id: string): LearnCard => {
    const my = LEARN_MY[kind].find((c) => c.id === id);
    if (my) return my;
    const cat = LEARN_CATALOG[kind].find((c) => c.id === id)!;
    if (kind === 'crs') return { ...cat, cat: 'По выбору', dur: LEARN_COURSES[id]?.dur };
    const e = LEARN_EVENTS[id];
    return { ...cat, date: (cat.line || '').split(' · ')[0], dur: e?.dur, place: e?.pl ?? null };
  };
  /** карточки «Моего обучения» по разделам */
  readonly my = computed(() => {
    const ids = this.myIds();
    return {
      crs: ids.crs.map((id) => this.cardOf('crs', id)),
      prog: LEARN_MY.prog,
      ev: ids.ev.map((id) => this.cardOf('ev', id)),
    };
  });

  /** виджет «Обучение» на обзоре — из карточек «Моего обучения» (hmLearnDraw): в работе, по сроку, первые три */
  readonly widget = computed(() => {
    const my = this.my(),
      rank: Record<string, number> = { Просрочен: 0, 'В процессе': 1, Назначен: 2, Назначена: 2 },
      dn = (s = '') => {
        const m = s.match(/(\d\d)\.(\d\d)\.(\d{4})/);
        return m ? +(m[3] + m[2] + m[1]) : 0;
      };
    const item = (c: LearnCard, st: string, p: LearnProgress | null, ev = false): LearningItem => ({
      id: c.id,
      title: c.title,
      image: c.img,
      badges: [{ text: st, tone: (LEARN_TONE[st] || '') as Tone }, ...(c.live ? [{ text: 'Идет сейчас', tone: 'dg' as Tone, live: true }] : [])],
      meta: [
        ...(c.date ? [{ text: c.date, icon: 'calendar', danger: !ev && st === 'Просрочен' }] : []),
        { text: c.dur || '', icon: 'clock' },
      ],
      place: ev ? (c.place ?? 'Онлайн') : undefined,
      online: ev && !c.place,
      link: ev && !c.place && st === 'Вы записаны',
      progress: p ? { label: 'Выполнено', value: p.value + '%', percent: p.value, tone: p.tone } : null,
    });
    const crs = my.crs
      .map((c) => ({ c, st: this.courses()[c.id] || '' }))
      .filter((x) => x.st in rank)
      .sort((a, b) => rank[a.st] - rank[b.st] || dn(a.c.date) - dn(b.c.date));
    const prg = my.prog
      .map((c) => ({ c, st: this.programs()[c.id]?.st || '' }))
      .sort((a, b) => (rank[a.st] ?? 9) - (rank[b.st] ?? 9) || dn(a.c.date) - dn(b.c.date));
    const ev = my.ev
      .map((c) => ({ c, st: this.events()[c.id] || '' }))
      .filter((x) => !/Проведен/.test(x.st))
      .sort((a, b) => dn(a.c.date) - dn(b.c.date));
    const counts = { crs: crs.length, prog: prg.filter((x) => !/Заверш/.test(x.st)).length, ev: ev.length };
    return {
      total: counts.crs + counts.prog + counts.ev,
      counts,
      crs: crs.slice(0, 3).map((x) => item(x.c, x.st, this.courseProgress(x.c.id, true))),
      prog: prg.slice(0, 3).map((x) => item(x.c, x.st, this.programProgress(x.c.id, true))),
      ev: ev.slice(0, 3).map((x) => item(x.c, x.st, null, true)),
    };
  });

  constructor() {
    inject(LegacyService).share('learn', {
      get: (): LearnShared => ({
        crs: this.courses(),
        acc: this.access(),
        trn: this.events(),
        cat: this.catEvents(),
        my: this.myIds(),
        done: this.done(),
        progs: this.programs(),
        lt: this.lt(),
      }),
      set: (v: Partial<LearnShared>) => {
        if (v.crs) this.courses.set({ ...this.courses(), ...v.crs });
        if (v.acc) this.access.set({ ...v.acc });
        if (v.trn) this.events.set({ ...this.events(), ...v.trn });
        if (v.cat) this.catEvents.set({ ...this.catEvents(), ...v.cat });
        if (v.my) this.myIds.set({ crs: [...v.my.crs], ev: [...v.my.ev] });
        if (v.done) this.done.set({ ...this.done(), ...v.done });
        if (v.progs) this.programs.set(structuredClone(v.progs));
        if (v.lt) this.lt.set(v.lt);
      },
    });
  }

  /** прохождение курса: сохраненное или по модулю, на котором остановились */
  playState(id: string): LearnPlayState {
    const s = this.play()[id];
    if (s) return s;
    const pos = LEARN_POS[id] || 0, fail = LEARN_FAIL[id] || [], done: number[] = [];
    for (let k = 0; k < pos; k++) if (!fail.includes(k)) done.push(k);
    return { done, fail: [...fail], review: [] };
  }
  setPlay(id: string, st: LearnPlayState): void {
    this.play.update((p) => ({ ...p, [id]: st }));
    this.done.update((d) => ({ ...d, [id]: st.done.length }));
  }
  /** «Пройти повторно»: прохождение с начала, попытки теста — заново */
  restart(id: string): void {
    this.setPlay(id, { done: [], fail: [], review: [] });
    this.attempts.update((a) => ({ ...a, [id]: LEARN_TRY }));
  }
  tries(id: string): number {
    return this.attempts()[id] ?? LEARN_TRY;
  }
  setStatus(id: string, st: string): void {
    this.courses.update((c) => ({ ...c, [id]: st }));
  }
  /** картинка курса / программы / мероприятия — как на карточке */
  imgOf(kind: LearnKind, id: string): string {
    return (LEARN_MY[kind].find((c) => c.id === id) || LEARN_CATALOG[kind].find((c) => c.id === id))?.img || '';
  }
  /** число модулей курса */
  blocksCount(id: string): number {
    return LEARN_BLOCKS[id] || learnBlocks(id).length;
  }
  /** мероприятие идет сейчас */
  isLive(id: string): boolean {
    return !!LEARN_MY.ev.find((c) => c.id === id)?.live;
  }
  /** срок курса как на карточке «Моего обучения»: «до …» / «пройден …» */
  dateOf(id: string): string {
    return LEARN_MY.crs.find((c) => c.id === id)?.date || '';
  }
  /** статус мероприятия для страницы: участие сотрудника, иначе по данным */
  eventStatus(id: string): string {
    return this.events()[id] || this.catEvents()[id] || (LEARN_EVENT_INFO[id]?.st === 'Завершен' ? 'Проведен' : 'Открыта запись');
  }

  /** кнопка карточки / страницы курса (lfAction прототипа) */
  run(kind: LearnKind, id: string, act: string, lt?: string): void {
    const q: Record<string, string> = lt ? { lt } : {};
    if (kind === 'prog') {
      // программа: плеер следующего незавершенного курса
      const p = this.programs()[id] || LEARN_PROGRAMS[id],
        nx = p.s.find((x) => !/Завершен/.test(x[1]));
      this.nav.go('player', { crs: (nx || p.s[0])[0], prog: id, ...q });
      return;
    }
    const c = LEARN_COURSES[id],
      t = LEARN_EVENTS[id];
    switch (act) {
      case 'play':
        return this.nav.go('player', { crs: id, ...q });
      case 'again':
        return this.nav.go('player', { crs: id, again: '1', ...q });
      case 'enroll':
        this.enroll(id);
        return this.toast.show('Вы записаны на курс', `Курс «${c.t}» добавлен в «Мое обучение».`);
      case 'apply':
        this.apply(id);
        return this.toast.show('Заявка отправлена', `Курс «${c.t}»: заявка ушла руководителю на согласование.`);
      case 'reg':
        this.register(id);
        return this.toast.show('Вы записаны', `${t.t} · ${t.d}`);
      case 'unreg':
        this.unregister(id);
        return this.toast.show('Участие отменено', t.t);
      case 'join':
        return this.toast.show('Подключение', 'Откроется трансляция в корпоративном сервисе видеовстреч.');
      case 'rec':
        return this.toast.show('Материалы', 'Откроется запись и материалы мероприятия.');
      case 'link':
        return this.toast.show('Трансляция', 'Ссылка на трансляцию откроется в новой вкладке.');
    }
  }

  /** статус карточки: курс / программа — из данных, мероприятие — участие сотрудника (в каталоге — свой) */
  status(kind: 'crs' | 'prog' | 'ev', id: string, where: 'my' | 'cat'): string {
    if (kind === 'crs') return this.courses()[id] || '';
    if (kind === 'prog') return this.programs()[id]?.st || '';
    return (where === 'my' ? this.events() : this.catEvents())[id] || '';
  }

  /** прогресс курса (lfPct): модули пройдены / всего */
  courseProgress(id: string, always = false): LearnProgress | null {
    const st = this.courses()[id] || '',
      n = LEARN_BLOCKS[id];
    if (!n) return null;
    const d = /Завершен/.test(st) ? n : /Назначен/.test(st) ? 0 : this.done()[id] || 0,
      p = Math.round((d / n) * 100);
    if (!always && !p && !/В процессе|Просрочен/.test(st)) return null;
    return { value: p, tone: st === 'Просрочен' ? 'dg' : p === 100 ? 'ok' : '' };
  }

  /** прогресс программы: завершенные этапы */
  programProgress(id: string, always = false): LearnProgress | null {
    const p = this.programs()[id];
    if (!p) return null;
    const d = p.s.filter((x) => /Завершен/.test(x[1])).length,
      v = Math.round((d / p.s.length) * 100);
    if (!always && !v && !/В процессе|Просрочен/.test(p.st)) return null;
    return { value: v, tone: d === p.s.length ? 'ok' : '', sub: `Пройдено ${d} из ${p.s.length} ${plural(p.s.length, ['курса', 'курсов', 'курсов'])}` };
  }

  /** кнопка курса / программы (lfBtns) */
  courseAction(st: string, id: string): LearnAction {
    const acc = this.access()[id] || '';
    if (/Завершен/.test(st))
      return LEARN_NO_REPEAT[id] === false
        ? { kind: 'note', label: 'Прохождение курса недоступно', tip: 'Обратитесь к администратору', lock: true }
        : { kind: 'btn', act: 'again', label: 'Пройти повторно' };
    if (/Назначен/.test(st)) return { kind: 'btn', act: 'play', label: 'Начать' };
    if (/В процессе|Просрочен/.test(st)) return { kind: 'btn', act: 'play', label: 'Продолжить обучение' };
    if (acc === 'closed') return { kind: 'note', label: 'Прохождение курса недоступно', tip: 'Обратитесь к куратору', lock: true };
    if (acc === 'wait') return { kind: 'note', label: 'Заявка на рассмотрении', lock: false };
    if (acc === 'open') return { kind: 'btn', act: 'enroll', label: 'Записаться' };
    return { kind: 'btn', act: 'apply', label: 'Подать заявку' };
  }

  /** кнопка мероприятия (lfEvBtns) */
  eventAction(st: string, id: string, live: boolean): LearnAction {
    if (st === 'Вы записаны')
      return live ? { kind: 'btn', act: 'join', label: 'Подключиться' } : { kind: 'btn', act: 'unreg', label: 'Отменить участие', raised: true };
    if (st === 'Проведен') return LEARN_EVENTS[id]?.rec ? { kind: 'btn', act: 'rec', label: 'Смотреть запись', raised: true } : null;
    if (st === 'Регистрация закрыта' || LEARN_EV_CLOSED[id]) return { kind: 'note', label: 'Регистрация недоступна', tip: 'Обратитесь к администратору', lock: true };
    if (st === 'Мест нет') return { kind: 'note', label: 'Регистрация закрыта', tip: 'Мест нет — запись закрыта', lock: true };
    return { kind: 'btn', act: 'reg', label: 'Подать заявку' };
  }

  /** свободная запись на курс: карточка — первой в «Моем обучении» */
  enroll(id: string): void {
    this.myIds.update((m) => (m.crs.includes(id) ? m : { ...m, crs: [id, ...m.crs] }));
    this.courses.update((c) => ({ ...c, [id]: 'Назначен' }));
  }
  /** заявка на курс — на согласование руководителю */
  apply(id: string): void {
    this.access.update((a) => ({ ...a, [id]: 'wait' }));
  }
  /** запись на мероприятие: карточка — третьей в «Моем обучении» */
  register(id: string): void {
    this.myIds.update((m) => (m.ev.includes(id) ? m : { ...m, ev: [...m.ev.slice(0, 2), id, ...m.ev.slice(2)] }));
    this.events.update((e) => ({ ...e, [id]: 'Вы записаны' }));
    this.catEvents.update((e) => ({ ...e, [id]: 'Вы записаны' }));
  }
  unregister(id: string): void {
    this.events.update((e) => ({ ...e, [id]: 'Открыта запись' }));
    this.catEvents.update((e) => ({ ...e, [id]: 'Открыта запись' }));
  }
}
