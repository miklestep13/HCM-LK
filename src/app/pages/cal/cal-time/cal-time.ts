import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CalEvent } from '../../../interface/cal';
import { cHM } from '../cal.utils';

/** время встречи «10:00–11:00»; весь день — «Весь день». Один формат во всех видах: сетка, месяц, карточка, поиск, быстрое создание. */
export const calTime = (e: Pick<CalEvent, 's' | 'e' | 'all'>): string => (e.all ? 'Весь день' : cHM(e.s) + '–' + cHM(e.e));

/** <span cal-time [ev]="e"></span> */
@Component({
  selector: '[cal-time]',
  template: `{{ text() }}`,
  host: { class: 'cltm' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalTime {
  readonly ev = input.required<Pick<CalEvent, 's' | 'e' | 'all'>>();
  protected readonly text = computed(() => calTime(this.ev()));
}
