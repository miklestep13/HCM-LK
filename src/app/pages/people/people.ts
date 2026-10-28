import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { plural } from '../../data/org.data';
import { EMPLOYEES } from '../../data/people.data';
import { EmployeeCard as EmployeeCardData } from '../../interface/org';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { EmployeeCard } from '../../widgets/employee-card/employee-card';

/**
 * Страница «Сотрудники» (ключ прототипа: people): поиск и фильтры (департамент, подразделение, город), сетка карточек.
 * Клик по карточке — профиль сотрудника.
 */
@Component({
  selector: 'app-people',
  imports: [PageHead, FilterBar, Select, EmployeeCard],
  template: `
    <app-page-head title="Сотрудники" [subtitle]="subtitle()" />
    <div class="c mb">
      <app-filter-bar
        placeholder="Поиск по имени, должности, подразделению или городу"
        [(query)]="q"
      >
        <app-select label="Департамент" allLabel="Все" [options]="depts" [(value)]="dept" />
        <app-select label="Подразделение" allLabel="Все" [options]="units" [(value)]="unit" />
        <app-select label="Город" allLabel="Все" [options]="cities" [(value)]="city" />
      </app-filter-bar>
    </div>
    <div class="pgrid">
      @for (e of shown(); track e.name) {
        <app-employee-card [card]="e" (click)="open(e)" />
      } @empty {
        <div class="empty">Никого не нашли — измените запрос или фильтры</div>
      }
    </div>
  `,
  styleUrl: './people.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-people' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class People {
  private readonly nav = inject(NavService);
  protected readonly q = signal('');
  protected readonly dept = signal('');
  protected readonly unit = signal('');
  protected readonly city = signal('');

  protected readonly depts = [
    'Дирекция развития',
    'Департамент розничного бизнеса',
    'Корпоративный блок',
    'HR-дирекция',
  ];
  protected readonly units = [
    'Управление банковских продуктов',
    'Управление рисков',
    'Управление кредитования',
    'Операционный департамент',
  ];
  protected readonly cities = ['Москва', 'Санкт-Петербург'];

  protected readonly shown = computed(() => {
    const q = this.q().trim().toLowerCase(),
      d = this.dept(),
      u = this.unit(),
      c = this.city();
    const v = (e: EmployeeCardData, k: string) => e.rows.find((r) => r.key === k)?.value ?? '';
    return EMPLOYEES.filter(
      (e) =>
        (!d || v(e, 'dept') === d) &&
        (!u || v(e, 'unit') === u) &&
        (!c || v(e, 'city') === c) &&
        (!q ||
          [e.name, e.role, v(e, 'dept'), v(e, 'unit'), v(e, 'city')]
            .join(' ')
            .toLowerCase()
            .includes(q)),
    );
  });
  protected readonly subtitle = computed(() => {
    const n = this.shown().length;
    return `${n} ${plural(n, 'сотрудник', 'сотрудника', 'сотрудников')} · сначала недавно присоединившиеся`;
  });

  protected open(e: EmployeeCardData): void {
    this.nav.go('emp', { emp: e.name });
  }
}
