import { Pager } from '../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { DateRangeField } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { AdapttplTable } from './adapttpl-table/adapttpl-table';
import { AdapttplState } from './adapttpl.state';

/**
 * «Управление персоналом → Адаптация → Шаблоны плана адаптации» (pg-adapttpl):
 * поиск, фильтры по датам, таблица и пагинация с разделительной линией.
 */
@Component({
  selector: 'app-adapttpl',
  imports: [Pager, PageHead, FilterBar, DateRangeField, AdapttplTable, Icon],
  template: `
    <app-page-head title="Шаблоны плана адаптации" [noBack]="true">
      <button class="btn pri" (click)="s.create()">Добавить</button>
    </app-page-head>
    <div class="c">
      <app-filter-bar placeholder="Поиск по названию или ответственному" [(query)]="s.q" [(opened)]="s.opened">
        <app-date-range label="Дата создания" [(value)]="s.created" />
        <app-date-range label="Дата изменения" [(value)]="s.updated" />
      </app-filter-bar>
      <div class="cb plbox">
        @if (s.rows().length) {
          <div adapttpl-table></div>
          <app-pager [p]="s.pg" />
        } @else {
          <div class="empty">
            <div class="wipi"><app-icon name="cross" /></div>
            <b>Ничего не найдено</b>
            <small>Шаблонов с такими условиями нет. Измените поиск или фильтры.</small>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: '../adaptplans/adaptplans.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-adapttpl' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Adapttpl {
  protected readonly s = inject(AdapttplState);
}
