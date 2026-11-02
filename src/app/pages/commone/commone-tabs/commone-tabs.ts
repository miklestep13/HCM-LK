import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { COMM_NEWS_SORTS } from '../../../data/comm.data';
import { DateRangeField } from '../../../shared/ui/date-range/date-range';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { SortButton } from '../../../shared/ui/sort-button/sort-button';
import { CommoneState } from '../commone.state';

/**
 * Вкладки «Новости / Участники»; у новостей под вкладками — поиск и фильтры ленты (автор, теги, дата), сортировка и «Добавить».
 * Шапку участников рисует виджет «Участники» — сразу под этой карточкой.
 */
@Component({
  selector: '[commone-tabs]',
  imports: [FilterBar, Select, DateRangeField, SortButton],
  template: `
    @if (s.c(); as c) {
      <div class="ctabs">
        <span [class.on]="s.tab() === 'news'" (click)="s.tab.set('news')">Новости</span>
        <span [class.on]="s.tab() === 'mem'" (click)="s.tab.set('mem')">Участники<span class="pntc">{{ c.members }}</span></span>
      </div>
      @if (s.tab() === 'news') {
        <app-filter-bar placeholder="Поиск новости" [(query)]="s.q">
          <button ftAction app-sort-button [options]="sorts" [(value)]="s.sort"></button>
          @if (c.joined || s.adm()) {
            <button ftAction class="btn pri" (click)="nav.go('newsnew', { cm: c.id })">Добавить</button>
          }
          <app-select label="Автор" allLabel="Все авторы" [options]="s.authors()" [(value)]="s.author" />
          <app-select label="Теги" allLabel="Все теги" [options]="s.tags()" [(value)]="s.tag" />
          <app-date-range label="Дата публикации" [(value)]="s.range" />
        </app-filter-bar>
      }
    }
  `,
  host: { class: 'c cmtabc', '[class.flat]': "s.tab() === 'mem'" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommoneTabs {
  protected readonly s = inject(CommoneState);
  protected readonly nav = inject(NavService);
  protected readonly sorts = COMM_NEWS_SORTS;
}
