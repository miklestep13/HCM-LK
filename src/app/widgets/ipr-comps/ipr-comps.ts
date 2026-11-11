import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { iprPl } from '../../core/demo/ipr-store.service';
import { IPR_LEVELS } from '../../data/ipr.data';
import { IprComp, IprTask } from '../../interface/ipr';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../shared/ui/icon/icon';
import { Select } from '../../shared/ui/select/select';
import { IprLevel } from './ipr-level';

const LV = (n: string) => IPR_LEVELS.indexOf(n);
const COLS: [string, number | null][] = [
  ['Компетенция', null],
  ['Обязательность', 170],
  ['Текущий уровень', 190],
  ['Целевой уровень', 190],
  ['Задачи', 130],
];

/**
 * Раздел «Компетенции» ИПР (страница «ИПР», ИПР по итогам аттестации): поиск и фильтры, таблица с сортировкой по всем столбцам,
 * ссылка «N задач» ведет к задачам, которые развивают компетенцию. Сворачивается стрелкой в шапке.
 */
@Component({
  selector: '[ipr-comps]',
  imports: [FilterBar, Select, Icon, IprLevel],
  template: `
    <div class="ch">
      <button class="actb ipcol" title="Свернуть" (click)="cold.set(!cold())"><app-icon name="chevSm" /></button>
      <h3>Компетенции</h3>
      <span class="chip">{{ comps().length }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по компетенциям" [(query)]="q">
      @if (comps().length) {
        <app-select label="Обязательность" [options]="opts(1)" allLabel="Все" placeholder="Обязательность" [(value)]="fo" />
        <app-select label="Компетенция" [options]="opts(0)" allLabel="Все" placeholder="Компетенция" [(value)]="fn" />
        <app-select label="Текущий уровень" [options]="opts(2)" allLabel="Все" placeholder="Текущий уровень" [(value)]="fc" />
        <app-select label="Целевой уровень" [options]="opts(3)" allLabel="Все" placeholder="Целевой уровень" [(value)]="ft" />
      }
    </app-filter-bar>
    @if (!comps().length) {
      <div class="cb iptcb">
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTarget" /></div>
          <b>Компетенций пока нет</b>
          <small>{{ editable() ? 'Добавьте компетенции, которые развивает план, и свяжите их с задачами.' : 'В этом плане нет компетенций.' }}</small>
        </div>
      </div>
    } @else {
      <div class="tw">
        <table class="tbl iprc">
          <thead>
            <tr>
              @for (c of cols; track c[0]; let k = $index) {
                <th [style.width.px]="c[1]">
                  <span class="thh"
                    >{{ c[0]
                    }}<button class="sortb mts" [class.on]="sort().k === k" title="Сортировать" [style.transform]="sort().k === k && sort().d < 0 ? 'scaleY(-1)' : null" (click)="sortBy(k)">
                      <app-icon name="sort" /></button
                  ></span>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.c.name) {
              <tr [attr.data-cn]="r.c.name" [class.hl]="hl() === r.c.name">
                <td><b>{{ r.c.name }}</b></td>
                <td>{{ r.c.req }}</td>
                <td><span ipr-level [level]="r.c.cur"></span></td>
                <td><span ipr-level [level]="r.c.target"></span></td>
                <td>
                  @if (r.n) {
                    <button class="lnk" title="Показать задачи, которые развивают компетенцию" (click)="tasksOf.emit(r.c.name)">{{ r.n }} {{ pl(r.n, 'задача', 'задачи', 'задач') }}</button>
                  } @else {
                    <span class="gr">Нет задач</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="gr">Ничего не найдено</td></tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  host: { class: 'c mt ipsect', '[class.ipcold]': 'cold()' },
  styleUrl: './ipr-comps.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprComps {
  readonly comps = input.required<IprComp[]>();
  readonly tasks = input.required<IprTask[]>();
  /** план редактируется (текст пустого состояния) */
  readonly editable = input(false, { transform: booleanAttribute });
  /** свернут по умолчанию */
  readonly collapsed = input(false, { transform: booleanAttribute });
  /** «N задач» — показать задачи компетенции */
  readonly tasksOf = output<string>();

  private readonly el = inject(ElementRef<HTMLElement>);
  protected readonly cols = COLS;
  protected readonly pl = iprPl;
  protected readonly cold = signal(false);
  protected readonly q = signal('');
  protected readonly fn = signal('');
  protected readonly fo = signal('');
  protected readonly fc = signal('');
  protected readonly ft = signal('');
  protected readonly sort = signal({ k: 0, d: 1 });
  protected readonly hl = signal('');

  ngOnInit(): void {
    this.cold.set(this.collapsed());
  }

  private readonly vals = (c: IprComp) => [c.name, c.req, c.cur, c.target];
  protected opts(i: number): string[] {
    return [...new Set(this.comps().map((c) => this.vals(c)[i]))].sort((x, y) => (i > 1 ? LV(x) - LV(y) : x.localeCompare(y, 'ru')));
  }
  private count(n: string): number {
    return this.tasks().filter((t) => t.comps.includes(n)).length;
  }
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(),
      s = this.sort();
    const keys: ((c: IprComp) => string | number)[] = [(c) => c.name.toLowerCase(), (c) => c.req, (c) => LV(c.cur), (c) => LV(c.target), (c) => this.count(c.name)];
    return this.comps()
      .filter(
        (c) =>
          (!q || c.name.toLowerCase().includes(q)) &&
          (!this.fn() || c.name === this.fn()) &&
          (!this.fo() || c.req === this.fo()) &&
          (!this.fc() || c.cur === this.fc()) &&
          (!this.ft() || c.target === this.ft()),
      )
      .sort((a, b) => {
        const x = keys[s.k](a),
          y = keys[s.k](b);
        return (x < y ? -1 : x > y ? 1 : 0) * s.d;
      })
      .map((c) => ({ c, n: this.count(c.name) }));
  });

  protected sortBy(k: number): void {
    this.sort.update((s) => ({ k, d: s.k === k ? -s.d : 1 }));
  }

  /** из задачи — к строке компетенции: прокрутка и подсветка */
  show(name: string): void {
    this.q.set('');
    this.cold.set(false);
    this.hl.set(name);
    setTimeout(() => {
      const r = (this.el.nativeElement as HTMLElement).querySelector(`tr[data-cn="${name}"]`);
      r?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    setTimeout(() => this.hl.set(''), 1800);
  }
}
