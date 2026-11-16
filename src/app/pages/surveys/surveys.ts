import { Pager } from '../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { SURVEY_KINDS, SURVEY_SORTS, SURVEY_STATUSES } from '../../data/surveys.data';
import { DateRangeField } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { SortButton } from '../../shared/ui/sort-button/sort-button';
import { ViewSwitch } from '../../shared/ui/view-switch/view-switch';
import { SurveysCards } from './surveys-cards/surveys-cards';
import { SurveysTable } from './surveys-table/surveys-table';
import { SurveysState } from './surveys.state';

/**
 * «Компания → Опросы»: опросы и тесты сотрудника (по образцу «Заданий»). Вкладки «Активные / Пройденные» со счетчиками,
 * поиск и фильтры (тип, статус, автор, срок), вид «Карточки» (сетка) или «Таблица» (сортировка по столбцам, «⋯» справа).
 * Карточка: тип, статус, название, автор и срок, прогресс — как в таблице («7 из 12» под полосой и процент справа) или результат теста.
 */
@Component({
  selector: 'app-surveys',
  imports: [Pager, PageHead, FilterBar, Select, DateRangeField, SortButton, ViewSwitch, SurveysCards, SurveysTable],
  template: `
    <app-page-head title="Опросы" [chip]="s.count().act" />
    <div class="c" [class.mb]="s.view() === 'cards'">
      <div class="svtabs">
        <span [class.on]="s.tab() === 'act'" (click)="s.tab.set('act')">Активные<span class="pntc">{{ s.count().act }}</span></span>
        <span [class.on]="s.tab() === 'done'" (click)="s.tab.set('done')">Пройденные<span class="pntc">{{ s.count().done }}</span></span>
      </div>
      <app-filter-bar placeholder="Поиск по названию" [(query)]="s.q" [(opened)]="s.opened">
        @if (s.view() === 'cards') {
          <button ftAction app-sort-button [options]="sortNames" [value]="sortName()" (valueChange)="setSort($event)"></button>
        }
        <app-view-switch ftAction [value]="s.view()" (valueChange)="s.setView($event)" />
        <app-select label="Тип" allLabel="Все" [options]="kinds" [(value)]="s.kind" />
        @if (s.tab() === 'act') {
          <app-select label="Статус" allLabel="Все" [options]="statuses" [(value)]="s.status" />
        }
        <app-select label="Автор" allLabel="Все" [options]="s.authors" [(value)]="s.author" />
        <app-date-range label="Дата окончания" [(value)]="s.end" />
      </app-filter-bar>
      @if (s.view() === 'table') {
        <div class="cb" style="padding-top: 4px" surveys-table></div>
        <div class="cb" style="padding-top: 0"><app-pager [p]="s.pg" /></div>
      }
    </div>
    @if (s.view() === 'cards') {
      <div class="vgrid" surveys-cards></div>
      <app-pager class="mtccnt" [p]="s.pg" />
    }
  `,
  styleUrl: './surveys.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-surveys' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Surveys {
  protected readonly s = inject(SurveysState);
  protected readonly kinds = SURVEY_KINDS;
  protected readonly statuses = SURVEY_STATUSES.filter((x) => x !== 'Завершен');
  protected readonly sortNames = SURVEY_SORTS.map((x) => x[0]);
  protected readonly sortName = computed(() => (SURVEY_SORTS.find((x) => x[1] === this.s.sort().k && x[2] === this.s.sort().dir) || SURVEY_SORTS[0])[0]);
  protected readonly countText = computed(() => {
    const n = this.s.total();
    return `Показано ${this.s.rows().length} из ${n} ${n % 10 === 1 && n % 100 !== 11 ? 'опроса' : 'опросов'}`;
  });

  protected setSort(name: string): void {
    const x = SURVEY_SORTS.find((y) => y[0] === name)!;
    this.s.sort.set({ k: x[1], dir: x[2] });
  }
}
