import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { OrgChart } from './org-chart/org-chart';
import { OrgSearch } from './org-search/org-search';
import { OrgState } from './org.state';

/**
 * Страница «Структура компании» (ключ прототипа: org).
 * Шапка: поиск с подсказками (org-search), «Развернуть все»; в фильтрах — подразделение и «Мой департамент».
 * Ниже — интерактивная схема (org-chart). Общее состояние — OrgState.
 */
@Component({
  selector: 'app-org',
  imports: [PageHead, FilterBar, Select, OrgSearch, OrgChart],
  providers: [OrgState],
  template: `
    <app-page-head title="Структура компании" [subtitle]="s.subtitle()" />
    <div class="c ogc0">
      <app-filter-bar
        placeholder="Найти сотрудника на схеме"
        [query]="search.q()"
        (queryChange)="search.q.set($event)"
        (focusin)="search.onFocus($event)"
        (keydown)="search.key($event)"
        (click)="$event.stopPropagation()"
      >
        <button ftAction class="btn raised" (click)="s.toggleAll()">
          {{ s.all() ? 'Свернуть все' : 'Развернуть все' }}
        </button>
        <app-select
          label="Подразделение"
          [options]="s.units"
          [value]="s.unit()"
          (valueChange)="s.setUnit($event)"
        />
        <button class="lnk" [class.hidden]="!s.away()" (click)="s.reset()">Мой департамент</button>
        <span class="bkgap"></span>
      </app-filter-bar>
      <app-org-search #search />
      <div org-chart></div>
    </div>
  `,
  styleUrl: './org.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-org' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Org {
  protected readonly s = inject(OrgState);
}
