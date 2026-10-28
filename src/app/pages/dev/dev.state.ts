import { Injectable, computed, inject, signal } from '@angular/core';
import { LearnStore } from '../../core/demo/learn-store.service';
import { NavService } from '../../core/navigation/nav.service';
import { LEARN_CATALOG, LEARN_COURSES, LEARN_EVENTS, LEARN_POSITION, LEARN_PROGRAMS } from '../../data/learn.data';
import { LearnCard, LearnKind } from '../../interface/learn';
import { ToastService } from '../../shared/ui/toast/toast.service';

/** чипсы статусов «Моего обучения»: у мероприятий свои */
export const DEV_CHIPS: Record<'crs' | 'ev', [string, string][]> = {
  crs: [
    ['asg', 'Назначенные'],
    ['prog', 'В процессе'],
    ['over', 'Просроченные'],
    ['done', 'Завершенные'],
  ],
  ev: [
    ['reg', 'Вы записаны'],
    ['past', 'Проведенные'],
  ],
};
const CHIP_ST: Record<string, string[]> = {
  asg: ['Назначен', 'Назначена'],
  prog: ['В процессе'],
  done: ['Завершен', 'Завершена'],
  over: ['Просрочен'],
  reg: ['Вы записаны'],
  past: ['Проведен'],
};
export const DEV_KINDS: [LearnKind, string][] = [
  ['crs', 'Курсы'],
  ['prog', 'Программы'],
  ['ev', 'Мероприятия'],
];
export const DEV_PLACEHOLDER: Record<LearnKind, string> = { crs: 'Поиск по курсам', prog: 'Поиск по программам', ev: 'Поиск по мероприятиям' };
const chipKind = (k: LearnKind): 'crs' | 'ev' => (k === 'ev' ? 'ev' : 'crs');
/** по умолчанию зажаты все статусы, кроме «Завершенные» / «Проведенные» */
const defChips = (k: LearnKind) => new Set(DEV_CHIPS[chipKind(k)].map((x) => x[0]).filter((x) => x !== 'done' && x !== 'past'));
const has = (c: LearnCard, q: string, extra = '') => !q || (c.title + ' ' + (c.date || '') + ' ' + (c.dur || '') + ' ' + (c.line || '') + ' ' + extra).toLowerCase().includes(q);

/** Состояние страницы «Обучение»: раздел, вкладки, поиск, чипсы статусов (мое) и фильтры (каталог); действия карточек */
@Injectable()
export class DevState {
  readonly store = inject(LearnStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);

  readonly lt = signal<'my' | 'cat'>('my');
  /* «Мое обучение» */
  readonly kind = signal<LearnKind>('crs');
  readonly q = signal('');
  readonly chips = signal<Set<string>>(defChips('crs'));
  /* каталог */
  readonly ckind = signal<LearnKind>('crs');
  readonly cq = signal('');
  readonly sph = signal('');
  readonly role = signal('');
  readonly grd = signal('');
  readonly tag = signal('');

  setLt(lt: 'my' | 'cat'): void {
    if (lt === 'my') this.chips.set(defChips(this.kind()));
    else this.ckind.set('crs');
    this.lt.set(lt);
    this.store.lt.set(lt);
  }
  setKind(k: LearnKind): void {
    this.kind.set(k);
    this.chips.set(defChips(k));
  }
  toggleChip(k: string): void {
    const s = new Set(this.chips());
    s.has(k) ? s.delete(k) : s.add(k);
    this.chips.set(s);
  }

  /** статусные чипсы с количеством */
  readonly chipList = computed(() => {
    const k = this.kind(),
      cards = this.store.my()[k],
      on = this.chips();
    return DEV_CHIPS[chipKind(k)].map(([key, label]) => ({
      key,
      label,
      on: on.has(key),
      count: cards.filter((c) => CHIP_ST[key].includes(this.store.status(k, c.id, 'my'))).length,
    }));
  });
  /** видимые карточки «Моего обучения» */
  readonly myCards = computed(() => {
    const k = this.kind(),
      q = this.q().trim().toLowerCase(),
      want = [...this.chips()].flatMap((f) => CHIP_ST[f] || []);
    return this.store.my()[k].filter((c) => {
      const st = this.store.status(k, c.id, 'my');
      return (!want.length || want.includes(st)) && has(c, q, st);
    });
  });
  /** видимые карточки каталога */
  readonly catCards = computed(() => {
    const q = this.cq().trim().toLowerCase(),
      role = this.role(),
      sph = this.sph(),
      grd = this.grd(),
      tag = this.tag();
    return LEARN_CATALOG[this.ckind()].filter(
      (c) =>
        !(role && c.role !== 'Всем' && LEARN_POSITION[c.role || ''] !== role) &&
        !(sph && c.sph !== sph) &&
        !(grd && c.grd !== grd) &&
        !(tag && c.tag !== tag) &&
        has(c, q),
    );
  });

  /** открыть курс / мероприятие / программу (страницы пока в старом прототипе) */
  open(kind: LearnKind, id: string): void {
    const lt = this.lt();
    if (kind === 'prog') this.nav.go('program', { prog: id, lt });
    else this.nav.go('course', kind === 'ev' ? { crs: id, kind: 'trn', lt } : { crs: id, lt });
  }

  /** кнопка карточки (lfAction прототипа) */
  act(kind: LearnKind, id: string, act: string): void {
    this.store.run(kind, id, act, this.lt());
  }
}
