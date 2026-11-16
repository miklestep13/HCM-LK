import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { Select } from '../select/select';

/** состояние постраничного вывода: страница (с 0), размер, текущая страница (не дальше последней), строки страницы */
export interface Paged<T> {
  page: WritableSignal<number>;
  size: WritableSignal<number>;
  total: Signal<number>;
  pages: Signal<number>;
  cur: Signal<number>;
  view: Signal<T[]>;
}

/**
 * Пагинация списка: protected readonly pg = paginate(() => this.s.rows());  в таблице — @for (r of pg.view(); …), под таблицей — <app-pager [p]="pg" />.
 * После фильтра страница сама становится последней доступной (cur).
 */
export function paginate<T>(rows: () => T[], size = 10): Paged<T> {
  const page = signal(0),
    sz = signal(size);
  const total = computed(() => rows().length);
  const pages = computed(() => Math.max(1, Math.ceil(total() / sz())));
  const cur = computed(() => Math.min(page(), pages() - 1));
  const view = computed(() => rows().slice(cur() * sz(), (cur() + 1) * sz()));
  return { page, size: sz, total, pages, cur, view };
}

const SIZES = [10, 20, 50];

/**
 * Пагинация под таблицей (.pgr): слева «Показано 1–10 из 85», справа — страницы (‹ 1 2 … 9 ›, если их больше одной) и число записей на странице (10 / 20 / 50, поле xs).
 * Одинаковая во всех таблицах-реестрах.
 */
@Component({
  selector: 'app-pager',
  imports: [Icon, Select],
  template: `
    @let P = p();
    <span class="pgri">{{ info() }}</span>
    <div class="pgrr">
      @if (P.pages() > 1) {
        <div class="pgrn">
          <button class="pgrb" title="Предыдущая страница" aria-label="Предыдущая страница" [disabled]="!P.cur()" (click)="P.page.set(P.cur() - 1)"><app-icon name="pgPrev" /></button>
          @for (i of nums(); track $index) {
            @if (i < 0) {
              <span class="pgrd">…</span>
            } @else {
              <button class="pgrb" [class.on]="i === P.cur()" (click)="P.page.set(i)">{{ i + 1 }}</button>
            }
          }
          <button class="pgrb" title="Следующая страница" aria-label="Следующая страница" [disabled]="P.cur() >= P.pages() - 1" (click)="P.page.set(P.cur() + 1)"><app-icon name="pgNext" /></button>
        </div>
      }
      <app-select class="pgrsz xs" title="Записей на странице" [options]="sizes" [value]="'' + P.size()" (valueChange)="setSize($event)" />
    </div>
  `,
  host: { class: 'pgr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pager {
  readonly p = input.required<Paged<unknown>>();
  protected readonly sizes = SIZES.map(String);
  protected readonly info = computed(() => {
    const P = this.p(),
      n = P.total();
    if (!n) return 'Нет записей';
    const a = P.cur() * P.size() + 1;
    return `Показано ${a}–${Math.min(n, a + P.size() - 1)} из ${n}`;
  });
  /** номера страниц: первая, последняя, соседи текущей; пропуски — «…» (-1) */
  protected readonly nums = computed(() => {
    const P = this.p(),
      n = P.pages(),
      c = P.cur();
    if (n <= 7) return Array.from({ length: n }, (_, i) => i);
    const s = new Set([0, n - 1, c - 1, c, c + 1].filter((i) => i >= 0 && i < n));
    const a = [...s].sort((x, y) => x - y),
      out: number[] = [];
    a.forEach((i, k) => {
      if (k && i - a[k - 1] > 1) out.push(-1);
      out.push(i);
    });
    return out;
  });
  protected setSize(v: string): void {
    const P = this.p();
    P.size.set(parseInt(v, 10) || 10);
    P.page.set(0);
  }
}
