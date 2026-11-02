import { Injectable, computed, inject, signal } from '@angular/core';
import { EventsStore } from '../../core/demo/events-store.service';
import { LearnStore } from '../../core/demo/learn-store.service';
import { LearnCard } from '../../interface/learn';
import { DateRange, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';

/** чипсы статусов — как в «Моем обучении» (мероприятия) + «Открыта запись» для мероприятий из каталога */
export const EVENTS_CHIPS: [string, string, string[]][] = [
  ['open', 'Открыта запись', ['Открыта запись', 'Мест нет', 'Регистрация закрыта']],
  ['reg', 'Вы записаны', ['Вы записаны']],
  ['past', 'Проведенные', ['Проведен']],
];

/** формат: по признаку карточки, иначе по месту (нет места — онлайн) */
export const evFormat = (c: LearnCard) => (c.tag === 'Очно' || c.tag === 'Онлайн' ? c.tag : c.place ? 'Очно' : 'Онлайн');

/**
 * Состояние страницы «Мероприятия»: поиск, чипсы статусов (по умолчанию — все, кроме «Проведенные»)
 * и фильтры по полям мероприятия — дата проведения, формат, место.
 */
@Injectable()
export class EventsState {
  readonly store = inject(EventsStore);
  private readonly learn = inject(LearnStore);
  readonly q = signal('');
  readonly chips = signal(new Set(['open', 'reg']));
  readonly range = signal<DateRange>(EMPTY_RANGE);
  readonly format = signal('');
  readonly place = signal('');

  /** варианты селектов — из самих мероприятий */
  readonly opts = computed(() => ({ format: ['Очно', 'Онлайн'], place: this.store.opts().place }));

  toggleChip(k: string): void {
    const s = new Set(this.chips());
    s.has(k) ? s.delete(k) : s.add(k);
    this.chips.set(s);
  }
  private st = (id: string) => this.learn.eventStatus(id);

  readonly chipList = computed(() => {
    const L = this.store.list(), on = this.chips();
    return EVENTS_CHIPS.map(([key, label, sts]) => ({ key, label, on: on.has(key), count: L.filter((c) => sts.includes(this.st(c.id))).length }));
  });
  readonly cards = computed(() => {
    const q = this.q().trim().toLowerCase(),
      want = EVENTS_CHIPS.filter(([k]) => this.chips().has(k)).flatMap(([, , s]) => s);
    const r = this.range(), fm = this.format(), pl = this.place();
    return this.store.list().filter((c) => {
      const st = this.st(c.id);
      return (
        (!want.length || want.includes(st)) &&
        inRange(r, (c.date || '').split(' ')[0]) &&
        (!fm || evFormat(c) === fm) &&
        (!pl || (c.place || 'Онлайн') === pl) &&
        (!q || [c.title, c.date, c.dur, c.place || 'Онлайн', st].join(' ').toLowerCase().includes(q))
      );
    });
  });
}
