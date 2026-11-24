import { Pager } from '../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input } from '@angular/core';
import { DateRangeField } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { FilterInput } from '../../shared/ui/filter-input/filter-input';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { PollsPeople } from './polls-people/polls-people';
import { PollsTable } from './polls-table/polls-table';
import { PollsState } from './polls.state';

/**
 * «Управление персоналом → Опросы → Список опросов» / «Обучение → Проверки знаний» (pg-polls):
 * поиск, фильтры (время прохождения — поле, даты, статус), «Добавить», таблица;
 * пустой список — блок «Ничего не найдено».
 * Параметр kind: poll — список опросов; test — проверки знаний; без него — последний открытый раздел.
 */
@Component({
  selector: 'app-polls',
  imports: [Pager, PageHead, FilterBar, FilterInput, Select, DateRangeField, PollsTable, PollsPeople, Icon],
  template: `
    <app-page-head [title]="s.kind() === 'test' ? 'Проверки знаний' : 'Список опросов'" [noBack]="true">
      <button class="btn pri" (click)="s.create()">Добавить</button>
    </app-page-head>
    <div class="c">
      <app-filter-bar [placeholder]="s.kind() === 'test' ? 'Поиск по названию проверки' : 'Поиск по названию опроса'" [(query)]="s.q" [(opened)]="s.opened">
        <app-filter-input label="Время прохождения" digits [max]="3" [group]="false" placeholder="Все" [(value)]="s.dur" />
        <app-date-range label="Дата начала" [(value)]="s.start" />
        <app-date-range label="Дата окончания" [(value)]="s.end" />
        <app-select label="Статус" allLabel="Все" [options]="s.statuses" [(value)]="s.status" />
      </app-filter-bar>
      <div class="cb plbox">
        @if (s.rows().length) {
          <div polls-table></div>
          <app-pager [p]="s.pg" />
        } @else {
          <div class="empty">
            <div class="wipi"><app-icon name="cross" /></div>
            <b>Ничего не найдено</b>
            <small>{{
              s.kind() === 'test'
                ? 'Проверок знаний с такими условиями нет. Измените поиск или фильтры.'
                : 'Опросов с такими условиями нет. Измените поиск или фильтры.'
            }}</small>
          </div>
        }
      </div>
    </div>
    <app-polls-people />
  `,
  styleUrl: './polls.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-polls' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Polls {
  readonly kind = input('');
  protected readonly s = inject(PollsState);
  constructor() {
    // без параметра (возврат из итогов или формы) — остается последний открытый раздел
    effect(() => {
      const k = this.kind();
      if (k) this.s.kind.set(k === 'test' ? 'test' : 'poll');
    });
  }
}
