import { Injectable, computed, inject, signal } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { EventsStore } from '../../core/demo/events-store.service';

/** Страница «Мероприятие»: какое мероприятие открыто, его карточка и все поля формы; роль (сотрудник / админ) */
@Injectable()
export class EventviewState {
  readonly store = inject(EventsStore);
  private readonly demo = inject(DemoState);
  readonly id = signal('');
  readonly card = computed(() => this.store.card(this.id()));
  readonly f = computed(() => (this.card() ? this.store.formOf(this.id()) : null));
  readonly adm = computed(() => this.demo.eventsRole() === 'adm');
}
