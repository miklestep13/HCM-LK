import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { COMM_CATS, COMM_SORTS } from '../../../data/comm.data';
import { CommCat } from '../../../interface/comm';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { SortButton } from '../../../shared/ui/sort-button/sort-button';
import { CommState } from '../comm.state';

/** Блок «Поиск и фильтры»: поиск и сортировка; в фильтрах — категория. Кнопка «Добавить» — в шапке страницы. */
@Component({
  selector: '[comm-filters]',
  imports: [FilterBar, Select, SortButton],
  template: `
    <app-filter-bar placeholder="Название или тема" [(query)]="s.q">
      <button ftAction app-sort-button [options]="sorts" [(value)]="s.sort"></button>
      <app-select label="Категория" allLabel="Все категории" [options]="cats" [value]="catName()" (valueChange)="setCat($event)" />
    </app-filter-bar>
  `,
  styleUrl: './comm-filters.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommFilters {
  protected readonly s = inject(CommState);
  protected readonly sorts = COMM_SORTS;
  protected readonly cats = Object.values(COMM_CATS);
  protected readonly catName = computed(() => (this.s.cat() ? COMM_CATS[this.s.cat() as CommCat] : ''));
  protected setCat(name: string): void {
    this.s.cat.set((Object.keys(COMM_CATS) as CommCat[]).find((k) => COMM_CATS[k] === name) ?? '');
  }
}
