import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { GoalsStore } from '../../../core/demo/goals-store.service';
import { GOAL_AUTHORS, GOAL_GROUPS, GOAL_GTYPES, GOAL_KINDS, GOAL_LEVELS, GOAL_UNITS } from '../../../data/goals.data';
import { shortFio } from '../../../data/org.data';
import { GoalTemplate } from '../../../interface/goal';
import { Icon } from '../../../shared/ui/icon/icon';
import { Modal } from '../../../shared/ui/modal/modal';
import { Select } from '../../../shared/ui/select/select';

const DT = ['За неделю', 'За месяц', 'За квартал', 'За год'];
const DAYS = [7, 31, 92, 366];
type Key = 'gt' | 'lvl' | 'grp' | 'k' | 'u' | 'au' | 'cr' | 'upd';

/**
 * Окно «Шаблоны целей»: поиск, «Мои», фильтры (тип, уровень, группа, тип и единица измерения, автор, даты создания и изменения),
 * таблица с постраничным выводом; клик по строке — выбор шаблона.
 */
@Component({
  selector: 'app-mygoalnew-tpl',
  imports: [Modal, Select, Icon],
  template: `
    <app-modal title="Шаблоны целей" panel="glmtpl glmtpl2" [open]="true" (openChange)="closed.emit()">
      <div class="gltf2">
        <div class="gltfr">
          <input class="tsearch" placeholder="Поиск по наименованию" [value]="q()" (input)="q.set($any($event.target).value); pg.set(0)" />
          <button class="glq" [class.on]="my()" [attr.aria-pressed]="my()" (click)="my.set(!my()); pg.set(0)">Мои</button>
          <button class="lnk" (click)="reset()">Сбросить фильтры</button>
        </div>
        <div class="gltfg">
          @for (f of filters; track f.k) {
            <app-select
              class="gltfs"
              [class.on]="!!F()[f.k]"
              [options]="f.opts"
              [allLabel]="f.all || 'Все'"
              [placeholder]="f.ph"
              [valuePrefix]="f.ph + ': '"
              [value]="F()[f.k]"
              (valueChange)="setF(f.k, $event)"
            />
          }
        </div>
      </div>
      <div class="tw gltt gltt2">
        <table class="tbl">
          <thead>
            <tr>
              <th style="min-width: 260px">Наименование</th>
              <th>Тип</th>
              <th>Уровень</th>
              <th>Группа</th>
              <th>Тип измерения</th>
              <th>Ед. измерения</th>
              <th>Автор</th>
              <th>Дата создания</th>
              <th>Дата изменения</th>
            </tr>
          </thead>
          <tbody>
            @for (t of page(); track t.t) {
              <tr class="clk" (click)="picked.emit(t); closed.emit()">
                <td><b>{{ t.t }}</b></td>
                <td>{{ t.gt || '—' }}</td>
                <td>{{ t.lvl || '—' }}</td>
                <td>{{ t.grp || '—' }}</td>
                <td>{{ kinds[t.kind] }}</td>
                <td>{{ t.kind === 'num' && t.u ? t.u : '—' }}</td>
                <td class="gltau">{{ t.au ? fio(t.au) : '—' }}</td>
                <td>{{ t.cr || '—' }}</td>
                <td>{{ t.upd || '—' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="9" class="gr">Ничего не найдено. Измените запрос или сбросьте фильтры.</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="gltfoot">
        <span>Итого записей: {{ list().length }}</span>
        <span class="gltps"><span class="gr">Показывать по</span><app-select [options]="sizes" [value]="String(ps())" (valueChange)="ps.set(+$event); pg.set(0)" /></span>
        <div class="cppn">
          @if (pages().length > 1) {
            <button class="cppb" title="Предыдущая страница" [disabled]="!cur()" (click)="pg.set(cur() - 1)"><app-icon name="pgPrev" /></button>
            @for (i of pages(); track i) {
              <button class="cppb" [class.on]="i === cur()" (click)="pg.set(i)">{{ i + 1 }}</button>
            }
            <button class="cppb" title="Следующая страница" [disabled]="cur() >= pages().length - 1" (click)="pg.set(cur() + 1)"><app-icon name="pgNext" /></button>
          }
        </div>
      </div>
      <div class="gltact"><button class="btn raised" (click)="closed.emit()">Отменить</button></div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalnewTpl {
  private readonly store = inject(GoalsStore);
  readonly picked = output<GoalTemplate>();
  readonly closed = output<void>();
  protected readonly kinds = GOAL_KINDS;
  protected readonly fio = shortFio;
  protected readonly String = String;
  protected readonly sizes = ['5', '10', '20'];
  protected readonly filters: { k: Key; ph: string; opts: string[]; all?: string }[] = [
    { k: 'gt', ph: 'Тип', opts: GOAL_GTYPES },
    { k: 'lvl', ph: 'Уровень', opts: GOAL_LEVELS },
    { k: 'grp', ph: 'Группа', opts: GOAL_GROUPS },
    { k: 'k', ph: 'Тип измерения', opts: Object.values(GOAL_KINDS) },
    { k: 'u', ph: 'Единица измерения', opts: GOAL_UNITS },
    { k: 'au', ph: 'Автор', opts: [...new Set(this.store.templates().map((t) => t.au || '').filter(Boolean))] },
    { k: 'cr', ph: 'Дата создания', opts: DT, all: 'Любая дата' },
    { k: 'upd', ph: 'Дата изменения', opts: DT, all: 'Любая дата' },
  ];
  protected readonly q = signal('');
  protected readonly my = signal(false);
  protected readonly F = signal<Record<Key, string>>({ gt: '', lvl: '', grp: '', k: '', u: '', au: '', cr: '', upd: '' });
  protected readonly pg = signal(0);
  protected readonly ps = signal(5);

  private inDt(d: string | undefined, f: string): boolean {
    const k = DT.indexOf(f);
    if (k < 0 || !d) return true;
    const dd = (Date.now() - new Date(+d.slice(6), +d.slice(3, 5) - 1, +d.slice(0, 2)).getTime()) / 864e5;
    return dd <= DAYS[k];
  }
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(), F = this.F(), ok = (v: string | undefined, f: string) => !f || v === f;
    return this.store.templates().filter(
      (t) =>
        (!q || t.t.toLowerCase().includes(q)) &&
        (!this.my() || t.au === GOAL_AUTHORS[0]) &&
        ok(t.gt, F.gt) &&
        ok(t.lvl, F.lvl) &&
        ok(t.grp, F.grp) &&
        ok(GOAL_KINDS[t.kind], F.k) &&
        (!F.u || (t.kind === 'num' && t.u === F.u)) &&
        ok(t.au, F.au) &&
        this.inDt(t.cr, F.cr) &&
        this.inDt(t.upd, F.upd),
    );
  });
  protected readonly pages = computed(() => Array.from({ length: Math.max(1, Math.ceil(this.list().length / this.ps())) }, (_, i) => i));
  protected readonly cur = computed(() => Math.min(this.pg(), this.pages().length - 1));
  protected readonly page = computed(() => this.list().slice(this.cur() * this.ps(), this.cur() * this.ps() + this.ps()));

  protected setF(k: Key, v: string): void {
    this.F.update((f) => ({ ...f, [k]: v }));
    this.pg.set(0);
  }
  protected reset(): void {
    this.q.set('');
    this.my.set(false);
    this.F.set({ gt: '', lvl: '', grp: '', k: '', u: '', au: '', cr: '', upd: '' });
    this.pg.set(0);
  }
}
