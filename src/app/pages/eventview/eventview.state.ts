import { Injectable, computed, inject, signal } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { EventsStore } from '../../core/demo/events-store.service';
import { LearnStore } from '../../core/demo/learn-store.service';
import { COMM_POOL } from '../../data/comm.data';
import { LEARN_EVENT_INFO } from '../../data/learn-course.data';
import { Member } from '../../interface/member';
import { eventWhen } from '../../widgets/event-head/event-head';

/** Страница «Мероприятие»: какое мероприятие открыто, его карточка и все поля формы; роль (сотрудник / админ); данные шапки */
@Injectable()
export class EventviewState {
  readonly store = inject(EventsStore);
  readonly learn = inject(LearnStore);
  private readonly demo = inject(DemoState);
  readonly id = signal('');
  readonly card = computed(() => this.store.card(this.id()));
  readonly f = computed(() => (this.card() ? this.store.formOf(this.id()) : null));
  readonly adm = computed(() => this.demo.eventsRole() === 'adm');

  /** время с — по */
  readonly when = computed(() => (this.f() ? eventWhen(this.f()!, this.card()?.date) : ''));
  /** кнопка участия по статусу участия сотрудника; у админа — нет */
  readonly action = computed(() => (this.adm() ? null : this.learn.eventAction(this.learn.eventStatus(this.id()), this.id(), !!this.card()?.live)));
  /** приглашено: группы — всеми сотрудниками; у мероприятий из обучения — как на карточке */
  readonly invited = computed(() => {
    const p = this.f()?.people || [], i = LEARN_EVENT_INFO[this.id()];
    return i && p.length <= 2 ? i.l * 6 + 40 : p.reduce((a, m) => a + (m.cnt || 1), 0);
  });
  /**
   * участники (виджет внизу карточки): из формы мероприятия; у мероприятий из обучения в форме только организатор и спикер —
   * добавляем записавшихся сотрудников, сколько есть в справочнике (до числа приглашенных)
   */
  readonly people = computed<Member[]>(() => {
    const p = this.f()?.people || [];
    if (!LEARN_EVENT_INFO[this.id()] || p.length > 2) return p;
    const has = new Set(p.map((m) => m.n));
    const reg = COMM_POOL.filter((m) => !m.kind && !has.has(m.n)).slice(0, Math.max(0, this.invited() - p.length));
    return [...p, ...reg.map((m) => ({ ...m, role: 'Участник' }))];
  });
}
