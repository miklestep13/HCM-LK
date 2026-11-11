import { Pager } from '../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { TASK_DIRECT_PAGES, TASK_QUICK, TASK_SORTS, TASK_STATUSES } from '../../data/tasks.data';
import { MyTask } from '../../interface/task';
import { DateRangeField } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { SortButton } from '../../shared/ui/sort-button/sort-button';
import { ViewSwitch } from '../../shared/ui/view-switch/view-switch';
import { MytasksCards } from './mytasks-cards/mytasks-cards';
import { MytasksTable } from './mytasks-table/mytasks-table';
import { MytasksPanel } from './mytasks-panel/mytasks-panel';
import { MytasksState } from './mytasks.state';

/**
 * «Мой кабинет → Задания»: шапка с поиском и фильтрами (инициатор, срок, статус), вид «Таблица» или «Карточки».
 * Небольшое задание (TASK_QUICK; рядом с названием — значок «Открыть справа») открывается справа от списка: разделенный экран
 * с панелью обработки (mytasks-panel). Остальные — там, где их выполняют: самооценка, опрос 9-box, страница задания.
 */
@Component({
  selector: 'app-mytasks',
  imports: [Pager, PageHead, FilterBar, Select, DateRangeField, SortButton, ViewSwitch, MytasksTable, MytasksCards, MytasksPanel],
  template: `
    <app-page-head title="Задания" [chip]="s.rows().length" />
    <!-- небольшое задание открывается справа: список слева, панель обработки справа -->
    <div class="mtsplit" [class.on]="!!s.quick()">
      <div class="mtlist">
      <div class="c" [class.full]="s.view() === 'table'" [class.mb]="s.view() === 'cards'">
        <app-filter-bar placeholder="Поиск по названию" [(query)]="s.q" [(opened)]="s.opened">
          @if (s.view() === 'cards') {
            <button ftAction app-sort-button class="ft2sort" [options]="sortNames" [value]="sortName()" (valueChange)="setSort($event)"></button>
          }
          <app-view-switch ftAction class="mtvsw" [value]="s.view()" (valueChange)="s.setView($event)" />
          <app-select label="Инициатор" allLabel="Все" [options]="s.authors" [(value)]="s.author" />
          <app-date-range label="Срок выполнения" [(value)]="s.due" />
          <app-select label="Статус" allLabel="Все" [options]="statuses" [(value)]="s.status" />
        </app-filter-bar>
        @if (s.view() === 'table') {
          <div class="cb" style="padding-top: 4px" mytasks-table (open)="open($event)"></div>
          <div class="cb" style="padding-top: 0"><app-pager [p]="s.pg" /></div>
        }
      </div>
      @if (s.view() === 'cards') {
        <div class="vgrid mtvgrid" mytasks-cards (open)="open($event)"></div>
        <app-pager class="mtccnt" [p]="s.pg" />
      }
      </div>
      @if (s.quick()) {
        <div mytasks-panel></div>
      }
    </div>
  `,
  styleUrl: './mytasks.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-mytasks' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mytasks {
  protected readonly s = inject(MytasksState);
  private readonly nav = inject(NavService);
  protected readonly statuses = TASK_STATUSES;
  protected readonly sortNames = TASK_SORTS.map((x) => x[0]);
  protected readonly sortName = computed(() => (TASK_SORTS.find((x) => x[1] === this.s.sort().k && x[2] === this.s.sort().dir) || TASK_SORTS[0])[0]);
  protected readonly count = computed(() => `Показано ${this.s.rows().length} из ${this.s.active.length} заданий`);

  protected setSort(name: string): void {
    const x = TASK_SORTS.find((y) => y[0] === name)!;
    this.s.sort.set({ k: x[1], dir: x[2] });
  }
  /** задание открывается там, где его выполняют; остальные — страница внешней ссылки в старом прототипе */
  protected open(t: MyTask): void {
    // небольшое задание — в панели справа (разделенный экран)
    if (TASK_QUICK[t.id]) return this.s.toggleQuick(t.id);
    if (t.page && TASK_DIRECT_PAGES.includes(t.page)) this.nav.go(t.page);
    else this.nav.go('mtext', { task: t.id });
  }
}
