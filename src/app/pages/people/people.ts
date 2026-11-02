import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { EMPLOYEES } from '../../data/people.data';
import { EmployeeCard as EmployeeCardData } from '../../interface/org';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { ViewMode, ViewSwitch } from '../../shared/ui/view-switch/view-switch';
import { EmployeeCard } from '../../widgets/employee-card/employee-card';
import { PeopleTable } from './people-table/people-table';

/**
 * Страница «Сотрудники» (ключ прототипа: people): поиск и фильтры (департамент, подразделение, город, должность, статус), вид «Карточки / Таблица» (как в виджете «Участники»).
 * Клик по карточке — профиль сотрудника.
 */
@Component({
  selector: 'app-people',
  imports: [PageHead, FilterBar, Select, ViewSwitch, EmployeeCard, PeopleTable],
  template: `
    <app-page-head title="Сотрудники" />
    <div class="c mb">
      <app-filter-bar
        placeholder="Поиск по имени, должности, подразделению или городу"
        [(query)]="q"
      >
        <app-view-switch ftAction [(value)]="view" />
        <app-select label="Департамент" allLabel="Все" [options]="depts" [(value)]="dept" />
        <app-select label="Подразделение" allLabel="Все" [options]="units" [(value)]="unit" />
        <app-select label="Город" allLabel="Все" [options]="cities" [(value)]="city" />
        <app-select label="Должность" allLabel="Все" [search]="true" [options]="roles" [(value)]="role" />
        <app-select label="Статус" allLabel="Все" [options]="statuses" [(value)]="status" />
      </app-filter-bar>
    </div>
    @if (view() === 'cards') {
      <div class="pgrid">
        @for (e of shown(); track e.name) {
          <app-employee-card [card]="e" (click)="open(e)" />
        } @empty {
          <div class="empty">Никого не нашли — измените запрос или фильтры</div>
        }
      </div>
    } @else {
      <div people-table [list]="shown()" (opened)="open($event)"></div>
    }
  `,
  styleUrl: './people.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-people' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class People {
  private readonly nav = inject(NavService);
  protected readonly view = signal<ViewMode>('cards');
  protected readonly q = signal('');
  protected readonly dept = signal('');
  protected readonly unit = signal('');
  protected readonly city = signal('');
  protected readonly role = signal('');
  protected readonly status = signal('');

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
  protected readonly roles = [...new Set(EMPLOYEES.map((e) => e.role))].sort((a, b) => a.localeCompare(b, 'ru'));
  /** статусы с карточек: отпуск, день рождения, руководитель… */
  protected readonly statuses = [...new Set(EMPLOYEES.flatMap((e) => (e.tags ?? []).map((t) => t.text)))];

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
        (!this.role() || e.role === this.role()) &&
        (!this.status() || !!e.tags?.some((t) => t.text === this.status())) &&
        (!q ||
          [e.name, e.role, v(e, 'dept'), v(e, 'unit'), v(e, 'city')]
            .join(' ')
            .toLowerCase()
            .includes(q)),
    );
  });

  protected open(e: EmployeeCardData): void {
    this.nav.go('emp', { emp: e.name });
  }
}
