import { paginate } from '../../shared/ui/pager/pager';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { ADAPT_PLANS, ADAPT_PLAN_STATUSES, ADAPT_PLAN_TYPES } from '../../data/adapt-plans.data';
import { AdaptPlanRow, AdaptPlanStatus } from '../../interface/adapt-plan';
import { DateRange, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';

const iso = (d: string) => (d && d !== '—' ? d.split('.').reverse().join('') : '99999999');

/** сегодня в демо — 30.09.2026 */
const TODAY = '20260930';

/** план пересекается с выбранным периодом (или период не задан) */
const overlaps = (r: DateRange, from: string, to: string): boolean => {
  if (!r.a) return true;
  const a = iso(from),
    b = iso(to),
    fa = r.a,
    fb = r.b || r.a;
  return a <= fb && b >= fa;
};

const SORT_KEYS: Record<string, (p: AdaptPlanRow) => string | number> = {
  name: (p) => p.name,
  type: (p) => p.type,
  period: (p) => iso(p.from),
  prog: (p) => (p.total ? p.done / p.total : 0),
  status: (p) => p.status,
  created: (p) => iso(p.created),
};

/**
 * «Управление персоналом → Адаптация → Список планов сотрудников»:
 * поиск, фильтры, сортировка, пагинация; клик — карточка плана (adapt).
 */
@Injectable({ providedIn: 'root' })
export class AdaptplansState {
  private readonly nav = inject(NavService);
  readonly list = signal<AdaptPlanRow[]>(ADAPT_PLANS.map((p) => ({ ...p })));
  readonly q = signal('');
  readonly type = signal('');
  readonly status = signal('');
  /** фильтр по периоду адаптации (пересечение с from–to) */
  readonly periodRange = signal<DateRange>(EMPTY_RANGE);
  readonly created = signal<DateRange>(EMPTY_RANGE);
  readonly opened = signal(false);
  readonly sort = signal<{ k: string; dir: number }>({ k: '', dir: 1 });

  readonly types = [...ADAPT_PLAN_TYPES];
  readonly statuses = [...ADAPT_PLAN_STATUSES];
  readonly pg = paginate(() => this.rows());

  readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(),
      type = this.type(),
      st = this.status(),
      per = this.periodRange(),
      cr = this.created(),
      { k, dir } = this.sort();
    const rows = this.list().filter(
      (p) =>
        (!type || p.type === type) &&
        (!st || p.status === st) &&
        overlaps(per, p.from, p.to) &&
        inRange(cr, p.created) &&
        (!q || p.name.toLowerCase().includes(q) || p.pos.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)),
    );
    const f = SORT_KEYS[k];
    return f ? [...rows].sort((x, y) => (f(x) < f(y) ? -dir : f(x) > f(y) ? dir : 0)) : rows;
  });

  sortBy(k: string): void {
    const s = this.sort();
    this.sort.set({ k, dir: s.k === k ? -s.dir : 1 });
  }

  pct(p: AdaptPlanRow): number {
    return p.total ? Math.round((100 * p.done) / p.total) : 0;
  }

  period(p: AdaptPlanRow): string {
    return p.from + '–' + p.to;
  }

  /** просрочен: срок плана прошел, статус не итоговый */
  overdue(p: AdaptPlanRow): boolean {
    if (p.status === 'Завершен' || p.status === 'Не пройдена') return false;
    return iso(p.to) < TODAY;
  }

  tone(p: AdaptPlanRow): '' | 'ok' | 'dg' | 'warn' {
    if (p.status === 'Завершен' || this.pct(p) === 100) return 'ok';
    if (this.overdue(p) || p.status === 'Не пройдена') return 'dg';
    return 'warn';
  }

  statusTone(p: AdaptPlanRow): string {
    if (p.status === 'Завершен') return 'ok';
    if (p.status === 'Не пройдена' || this.overdue(p)) return 'dg';
    if (p.status === 'В процессе') return 'warn';
    if (p.status === 'На согласовании' || p.status === 'Согласовано') return 'info';
    return '';
  }

  statusLabel(p: AdaptPlanRow): AdaptPlanStatus | string {
    return this.overdue(p) && p.status === 'В процессе' ? 'Просрочен' : p.status;
  }

  open(p: AdaptPlanRow): void {
    this.nav.go('adapt');
  }
}
