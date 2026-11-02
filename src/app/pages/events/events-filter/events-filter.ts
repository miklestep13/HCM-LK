import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DateRangeField } from '../../../shared/ui/date-range/date-range';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { EventsState } from '../events.state';

/** Поиск, чипсы статусов (несколько сразу, как в «Моем обучении») и фильтры по полям: дата проведения, формат, место */
@Component({
  selector: '[events-filter]',
  imports: [FilterBar, DateRangeField, Select],
  template: `
    <app-filter-bar placeholder="Поиск по мероприятиям" [(query)]="s.q">
      <div class="fchips" ftName="Статус">
        @for (c of s.chipList(); track c.key) {
          <button class="fchip" [class.on]="c.on" (click)="s.toggleChip(c.key)">{{ c.label }} <em>{{ c.count }}</em></button>
        }
      </div>
      <app-date-range label="Дата проведения" [(value)]="s.range" />
      <app-select label="Формат" allLabel="Все форматы" [options]="s.opts().format" [(value)]="s.format" />
      <app-select label="Место" allLabel="Любое место" [options]="s.opts().place" [(value)]="s.place" />
    </app-filter-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsFilter {
  protected readonly s = inject(EventsState);
}
