import { Pager } from '../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input } from '@angular/core';
import { POLL_TABS } from '../../data/polls.data';
import { DateRangeField } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { PollsPeople } from './polls-people/polls-people';
import { PollsTable } from './polls-table/polls-table';
import { PollsState } from './polls.state';

/**
 * «Управление персоналом → Опросы» (перенесено из старого прототипа, pg-polls): вкладки «Активные / Завершенные / Архив» со счетчиками,
 * поиск, фильтры (статус, дата окончания), «Добавить» — справа от заголовка страницы, сразу открывает новый опрос
 * (создание из шаблона пока скрыто); таблица опросов.
 * Форма опроса («Новый опрос», «Редактирование опроса») — пока в старом прототипе (pollnew).
 * Параметр адреса kind (меню «Обучение»): test — «Проверки знаний» (только тесты), poll — «Опросы» (без тестов); без него — последний раздел.
 */
@Component({
  selector: 'app-polls',
  imports: [Pager, PageHead, FilterBar, Select, DateRangeField, PollsTable, PollsPeople],
  template: `
    <app-page-head [title]="s.kind() === 'test' ? 'Проверки знаний' : 'Опросы'" [noBack]="true">
      <button class="btn pri" (click)="s.create()">Добавить</button>
    </app-page-head>
    <div class="c">
      <div class="svtabs">
        @for (t of tabs; track t[0]) {
          <span [class.on]="s.tab() === t[0]" (click)="s.setTab(t[0])">{{ t[1] }}<span class="pntc">{{ s.count()[t[0]] }}</span></span>
        }
      </div>
      <app-filter-bar [placeholder]="s.kind() === 'test' ? 'Поиск по названию проверки' : 'Поиск по названию опроса'" [(query)]="s.q" [(opened)]="s.opened">
        <app-select label="Статус" allLabel="Все" [options]="s.statuses()" [(value)]="s.status" />
        <app-date-range label="Дата окончания" [(value)]="s.end" />
      </app-filter-bar>
      <div class="cb" style="padding-top: 4px" polls-table></div>
      <div class="cb" style="padding-top: 0"><app-pager [p]="s.pg" /></div>
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
  protected readonly tabs = POLL_TABS;
  protected readonly countText = computed(() => {
    const n = this.s.total();
    const w = this.s.kind() === 'test' ? (n % 10 === 1 && n % 100 !== 11 ? 'проверки' : 'проверок') : n % 10 === 1 && n % 100 !== 11 ? 'опроса' : 'опросов';
    return `Показано ${this.s.rows().length} из ${n} ${w}`;
  });
}
