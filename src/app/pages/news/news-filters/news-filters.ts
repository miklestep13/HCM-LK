import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { DateRangeField } from '../../../shared/ui/date-range/date-range';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { SortButton } from '../../../shared/ui/sort-button/sort-button';
import { NEWS_AUTHORS, NEWS_SORTS, NEWS_TAGS, NewsState } from '../news.state';

/** Блок «Поиск и фильтры» ленты: поиск, сортировка; в фильтрах — автор, теги, дата публикации. */
@Component({
  selector: '[news-filters]',
  imports: [FilterBar, Select, DateRangeField, SortButton],
  template: `
    <app-filter-bar placeholder="Поиск новости" [(query)]="s.q">
      <button ftAction app-sort-button [options]="sorts" [(value)]="s.sort"></button>
      <app-select label="Автор" allLabel="Все авторы" [options]="authors" [(value)]="s.author" />
      <app-select
        label="Теги"
        allLabel="Все теги"
        [search]="true"
        [options]="tags"
        [(value)]="s.tag"
      />
      <app-date-range label="Дата публикации" [(value)]="s.range" />
    </app-filter-bar>
  `,
  styleUrl: './news-filters.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsFilters {
  protected readonly s = inject(NewsState);
  protected readonly sorts = NEWS_SORTS;
  protected readonly authors = NEWS_AUTHORS;
  protected readonly tags = NEWS_TAGS;
}
