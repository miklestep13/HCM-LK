import { Injectable, signal } from '@angular/core';
import { DateRange, EMPTY_RANGE } from '../../shared/ui/date-range/date-range';

/** Фильтры истории операций кошелька (CUR прототипа) */
@Injectable({ providedIn: 'root' })
export class CurFilters {
  readonly q = signal('');
  readonly type = signal('');
  readonly st = signal('');
  readonly per = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
}
