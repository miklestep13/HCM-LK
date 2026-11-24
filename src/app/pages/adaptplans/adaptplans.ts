import { Pager } from '../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { DateRangeField } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { AdaptplansTable } from './adaptplans-table/adaptplans-table';
import { AdaptplansState } from './adaptplans.state';

/**
 * «Управление персоналом → Адаптация → Список планов сотрудников» (pg-adaptplans):
 * поиск, фильтры (тип, состояние, период адаптации, дата создания), таблица и пагинация с разделительной линией.
 */
@Component({
  selector: 'app-adaptplans',
  imports: [Pager, PageHead, FilterBar, Select, DateRangeField, AdaptplansTable, Icon],
  template: `
    <app-page-head title="Список планов сотрудников" [noBack]="true" />
    <div class="c">
      <app-filter-bar placeholder="Поиск по сотруднику или типу плана" [(query)]="s.q" [(opened)]="s.opened">
        <app-select label="Тип плана" allLabel="Все" [options]="s.types" [(value)]="s.type" />
        <app-select label="Состояние" allLabel="Все" [options]="s.statuses" [(value)]="s.status" />
        <app-date-range label="Период адаптации" [(value)]="s.periodRange" />
        <app-date-range label="Дата создания" [(value)]="s.created" />
      </app-filter-bar>
      <div class="cb plbox">
        @if (s.rows().length) {
          <div adaptplans-table></div>
          <app-pager [p]="s.pg" />
        } @else {
          <div class="empty">
            <div class="wipi"><app-icon name="cross" /></div>
            <b>Ничего не найдено</b>
            <small>Планов адаптации с такими условиями нет. Измените поиск или фильтры.</small>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './adaptplans.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-adaptplans' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Adaptplans {
  protected readonly s = inject(AdaptplansState);
}
