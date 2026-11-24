import { paginate } from '../../shared/ui/pager/pager';
import { Injectable, computed, inject, signal } from '@angular/core';
import { ADAPT_TEMPLATES } from '../../data/adapt-templates.data';
import { AdaptTemplateRow } from '../../interface/adapt-template';
import { DateRange, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';
import { ToastService } from '../../shared/ui/toast/toast.service';

const iso = (d: string) => (d && d !== '—' ? d.split('.').reverse().join('') : '99999999');

const SORT_KEYS: Record<string, (p: AdaptTemplateRow) => string | number> = {
  name: (p) => p.name,
  owner: (p) => p.ownerName,
  created: (p) => iso(p.created),
  updated: (p) => iso(p.updated),
};

/**
 * «Управление персоналом → Адаптация → Шаблоны плана адаптации»:
 * поиск, фильтры по датам, сортировка, пагинация.
 */
@Injectable({ providedIn: 'root' })
export class AdapttplState {
  private readonly toast = inject(ToastService);
  readonly list = signal<AdaptTemplateRow[]>(ADAPT_TEMPLATES.map((p) => ({ ...p })));
  readonly q = signal('');
  readonly created = signal<DateRange>(EMPTY_RANGE);
  readonly updated = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
  readonly sort = signal<{ k: string; dir: number }>({ k: '', dir: 1 });
  readonly pg = paginate(() => this.rows());

  readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(),
      cr = this.created(),
      up = this.updated(),
      { k, dir } = this.sort();
    const rows = this.list().filter(
      (p) =>
        inRange(cr, p.created) &&
        inRange(up, p.updated) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.ownerPos.toLowerCase().includes(q)),
    );
    const f = SORT_KEYS[k];
    return f ? [...rows].sort((x, y) => (f(x) < f(y) ? -dir : f(x) > f(y) ? dir : 0)) : rows;
  });

  sortBy(k: string): void {
    const s = this.sort();
    this.sort.set({ k, dir: s.k === k ? -s.dir : 1 });
  }

  create(): void {
    this.toast.show('В разработке', 'Создание шаблона плана адаптации — в разработке.');
  }
}
