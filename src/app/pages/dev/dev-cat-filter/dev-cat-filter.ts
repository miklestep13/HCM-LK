import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LEARN_CAT_FILTERS } from '../../../data/learn.data';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { DEV_KINDS, DevState } from '../dev.state';

const PH = { crs: 'Поиск по каталогу', prog: 'Поиск по программам', ev: 'Поиск по мероприятиям' };

/** Каталог обучения: вкладки, поиск и фильтры — категория разделов, должность, грейд, тег */
@Component({
  selector: '[dev-cat-filter]',
  imports: [FilterBar, Select],
  template: `
    <div class="ctabs">
      @for (k of kinds; track k[0]) {
        <span [class.on]="s.ckind() === k[0]" (click)="s.ckind.set(k[0])">{{ k[1] }}</span>
      }
    </div>
    <app-filter-bar [placeholder]="ph[s.ckind()]" [(query)]="s.cq">
      <app-select label="Категория разделов" allLabel="Все" [options]="f.sph" [(value)]="s.sph" />
      <app-select label="Должность" allLabel="Все" [options]="f.role" [(value)]="s.role" />
      <app-select label="Грейд" allLabel="Все" [options]="f.grd" [(value)]="s.grd" />
      <app-select label="Тег" allLabel="Все" [options]="f.tag" [(value)]="s.tag" />
    </app-filter-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevCatFilter {
  protected readonly s = inject(DevState);
  protected readonly kinds = DEV_KINDS;
  protected readonly ph = PH;
  protected readonly f = LEARN_CAT_FILTERS;
}
