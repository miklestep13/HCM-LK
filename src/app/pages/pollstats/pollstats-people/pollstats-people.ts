import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { POLL_DEPS } from '../../../data/poll-stats.data';
import { PollPart } from '../../../interface/poll-stats';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { PollstatsState } from '../pollstats.state';

const ST_TONE: Record<string, string> = { Завершен: 'ok', 'В работе': 'warn', Ожидает: '' };
const PAGE = 10;

/**
 * Таблица участников: поиск, фильтры (статус, подразделение, у теста — сдал / не сдал), сортировка по столбцам, страницы по 10.
 * Столбцы: сотрудник, подразделение, статус, у теста — попыток и результат (ниже проходного — красным), дата и время прохождения.
 */
@Component({
  selector: '[pollstats-people]',
  imports: [FilterBar, Select, Icon],
  template: `
    <div class="ch"><h3>Участники</h3><span class="chip">{{ s.stats()!.parts.length }}</span></div>
    <app-filter-bar placeholder="Поиск по ФИО или должности" [(query)]="q" [(opened)]="opened">
      <button ftAction class="ib3 ic" title="Выгрузить в Excel" (click)="excel()"><app-icon name="excel" /></button>
      <app-select label="Статус" allLabel="Все" [options]="statuses" [(value)]="st" />
      <app-select label="Подразделение" allLabel="Все" [search]="true" [options]="deps" [(value)]="dep" />
      @if (s.test()) {
        <app-select label="Результат" allLabel="Все" [options]="results" [(value)]="res" />
      }
    </app-filter-bar>
    <div class="cb" style="padding-top: 4px">
      <div class="tw">
        <table class="tbl rtbl pstbl">
          <thead>
            <tr>
              @for (c of cols(); track c[0]) {
                <th [style.width.px]="c[2] || null">
                  <span class="thh">{{ c[1] }}<button class="sortb mts" [class.on]="sort().k === c[0]" title="Сортировать" [style.transform]="sort().k === c[0] && sort().dir < 0 ? 'scaleY(-1)' : null" (click)="sortBy(c[0])"><app-icon name="sort" /></button></span>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (p of page(); track p.n) {
              <tr>
                <td><span class="cnm"><b>{{ s.poll()!.anon ? 'Участник ' + (rows().indexOf(p) + 1) : p.n }}</b><small>{{ p.pos }}</small></span></td>
                <td class="gr">{{ p.dep }}</td>
                <td><span class="bdg" [class]="tone[p.st]">{{ p.st }}</span></td>
                @if (s.test()) {
                  <td class="gr">{{ p.tries || '—' }}</td>
                  <td>@if (p.score != null) {<b [class.dgt]="p.score < s.pass()">{{ p.score }}%</b>} @else {<span class="gr">—</span>}</td>
                }
                <td class="gr">{{ p.doneAt || '—' }}</td>
                <td class="gr">{{ p.min ? p.min + ' мин' : '—' }}</td>
              </tr>
            } @empty {
              <tr><td [attr.colspan]="cols().length" class="empty sm">Никого не нашли — измените поиск или фильтры</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="pspg">
        <span class="gr">{{ from() + 1 }}–{{ from() + page().length }} из {{ rows().length }}</span>
        <span class="pspgb">
          <button class="ib" title="Назад" [disabled]="pg() === 0" (click)="pg.set(pg() - 1)"><app-icon name="pgPrev" /></button>
          @for (i of pages(); track i) {
            <button class="pspn" [class.on]="i === pg()" (click)="pg.set(i)">{{ i + 1 }}</button>
          }
          <button class="ib" title="Вперед" [disabled]="pg() >= pages().length - 1" (click)="pg.set(pg() + 1)"><app-icon name="pgNext" /></button>
        </span>
      </div>
      @if (s.poll()!.anon) {
        <p class="pshint psanonh">Опрос анонимный: в таблице только статус прохождения, ответы с сотрудниками не связаны.</p>
      }
    </div>
  `,
  host: { class: 'c pspeople' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollstatsPeople {
  protected readonly s = inject(PollstatsState);
  protected readonly tone = ST_TONE;
  protected readonly statuses = ['Завершен', 'В работе', 'Ожидает'];
  protected readonly deps = POLL_DEPS;
  protected readonly results = ['Сдал', 'Не сдал'];
  protected readonly q = signal('');
  protected readonly opened = signal(false);
  protected readonly st = signal('');
  protected readonly dep = signal('');
  protected readonly res = signal('');
  protected readonly sort = signal<{ k: string; dir: number }>({ k: '', dir: 1 });
  protected readonly cols = computed<[string, string, number?][]>(() => [
    ['n', 'Сотрудник'],
    ['dep', 'Подразделение', 220],
    ['st', 'Статус', 130],
    ...(this.s.test() ? ([['tries', 'Попыток', 110], ['score', 'Результат', 120]] as [string, string, number][]) : []),
    ['doneAt', 'Завершил', 130],
    ['min', 'Время', 100],
  ]);
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(), st = this.st(), dep = this.dep(), res = this.res(), pass = this.s.pass();
    const { k, dir } = this.sort();
    const l = this.s.stats()!.parts.filter(
      (p) =>
        (!q || (p.n + ' ' + p.pos).toLowerCase().includes(q)) &&
        (!st || p.st === st) &&
        (!dep || p.dep === dep) &&
        (!res || (p.score != null && (res === 'Сдал') === p.score >= pass)),
    );
    if (!k) return l;
    const v = (p: PollPart) => (k === 'doneAt' ? p.doneAt.split('.').reverse().join('') : (p as unknown as Record<string, string | number | null>)[k] ?? -1);
    return [...l].sort((a, b) => (v(a)! < v(b)! ? -dir : v(a)! > v(b)! ? dir : 0));
  });
  protected readonly pg = linkedSignal({ source: () => [this.q(), this.st(), this.dep(), this.res(), this.sort()], computation: () => 0 });
  protected readonly pages = computed(() => {
    const n = Math.ceil(this.rows().length / PAGE), c = this.pg();
    return Array.from({ length: n }, (_, i) => i).filter((i) => n <= 7 || i === 0 || i === n - 1 || Math.abs(i - c) <= 1);
  });
  protected readonly from = computed(() => this.pg() * PAGE);
  protected readonly page = computed(() => this.rows().slice(this.from(), this.from() + PAGE));
  protected sortBy(k: string): void {
    const s = this.sort();
    this.sort.set({ k, dir: s.k === k ? -s.dir : 1 });
  }
  private readonly toast = inject(ToastService);
  protected excel(): void {
    this.toast.show('Готово', 'Список участников выгружен в Excel.');
  }
}
