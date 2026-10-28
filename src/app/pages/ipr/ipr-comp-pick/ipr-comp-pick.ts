import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { IPR_COMP_CATALOG, IPR_LEVELS } from '../../../data/ipr.data';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { Modal } from '../../../shared/ui/modal/modal';
import { IprLevel } from '../../../widgets/ipr-comps/ipr-level';

const PS = 5;

/**
 * Окно «Добавить компетенции»: справочник постранично (по 5), поиск и фильтры должности и грейда.
 * Выбор не теряется при смене страницы и фильтров: «Выбрано N», «Показать выбранные», «Сбросить».
 * Уже выбранные в задаче — отмеченный неактивный чекбокс. Название открывает страницу компетенции (в разработке).
 */
@Component({
  selector: 'app-ipr-comp-pick',
  imports: [Modal, FilterBar, Icon, IprLevel],
  template: `
    <app-modal title="Добавить компетенции" panel="mdl-lg" [open]="true" (openChange)="closed.emit()">
      <div class="c cmbar">
        <app-filter-bar placeholder="Поиск по названию или описанию" [query]="q()" (queryChange)="reset(); q.set($event)">
          <select class="sel" (change)="reset(); role.set($any($event.target).value)">
            <option value="">Все должности</option>
            @for (r of roles; track r) {
              <option>{{ r }}</option>
            }
          </select>
          <select class="sel" (change)="reset(); grade.set($any($event.target).value)">
            <option value="">Все грейды</option>
            @for (g of grades; track g) {
              <option>{{ g }}</option>
            }
          </select>
        </app-filter-bar>
      </div>
      <div class="cpwrap">
        @if (sel().size) {
          <div class="cpss">
            <span
              ><b>Выбрано {{ sel().size }}</b>
              @if (off()) {
                <small>из них на других страницах: {{ off() }}</small>
              }
            </span>
            <button class="lnk" (click)="only.set(!only()); pg.set(0)">{{ only() ? 'Показать все' : 'Показать выбранные' }}</button
            ><button class="lnk" (click)="clear()">Сбросить</button>
          </div>
        }
        <div class="tw">
          <table class="tbl iprc">
            <thead>
              <tr><th style="width: 38px"></th><th>Компетенция</th><th style="width: 170px">Должность</th><th style="width: 160px">Текущий уровень</th></tr>
            </thead>
            <tbody>
              @for (c of page(); track c.name) {
                @let on = has().includes(c.name);
                <tr [class.cpdone]="on">
                  <td class="chk">
                    <label class="ckb"><input type="checkbox" [checked]="on || sel().has(c.name)" [disabled]="on" (change)="flip(c.name)" /><i></i></label>
                  </td>
                  <td><b class="tklnk" (click)="open(c.name)">{{ c.name }}</b><small>{{ c.desc }}</small></td>
                  <td>{{ c.role }}<small>грейд «{{ c.grade }}»</small></td>
                  <td><span ipr-level [level]="c.cur"></span></td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="gr">Ничего не найдено</td></tr>
              }
            </tbody>
          </table>
        </div>
        @if (found().length > ps) {
          <div class="cppg">
            <small>{{ from() + 1 }}–{{ from() + page().length }} из {{ found().length }}</small>
            <div class="cppn">
              <button class="cppb" title="Предыдущая страница" [disabled]="!cur()" (click)="pg.set(cur() - 1)"><app-icon name="pgPrev" /></button>
              @for (i of pages(); track i) {
                <button class="cppb" [class.on]="i === cur()" (click)="pg.set(i)">{{ i + 1 }}</button>
              }
              <button class="cppb" title="Следующая страница" [disabled]="cur() >= pages().length - 1" (click)="pg.set(cur() + 1)"><app-icon name="pgNext" /></button>
            </div>
          </div>
        }
      </div>
      <div class="ipff">
        <button class="btn raised" (click)="closed.emit()">Отменить</button
        ><button class="btn pri" [disabled]="!sel().size" (click)="add()">{{ sel().size ? 'Добавить · ' + sel().size : 'Добавить' }}</button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprCompPick {
  private readonly nav = inject(NavService);
  /** уже выбранные компетенции */
  readonly has = input<string[]>([]);
  readonly picked = output<string[]>();
  readonly closed = output<void>();

  protected readonly ps = PS;
  protected readonly roles = [...new Set(IPR_COMP_CATALOG.map((c) => c.role))];
  protected readonly grades = IPR_LEVELS;
  protected readonly q = signal('');
  protected readonly role = signal('');
  protected readonly grade = signal('');
  protected readonly pg = signal(0);
  protected readonly only = signal(false);
  protected readonly sel = signal(new Set<string>());

  protected readonly found = computed(() => {
    const q = this.q().trim().toLowerCase(),
      S = this.sel();
    return IPR_COMP_CATALOG.filter((c) =>
      this.only() && S.size
        ? S.has(c.name)
        : (!q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)) && (!this.role() || c.role === this.role()) && (!this.grade() || c.grade === this.grade()),
    );
  });
  protected readonly pages = computed(() => Array.from({ length: Math.max(1, Math.ceil(this.found().length / PS)) }, (_, i) => i));
  protected readonly cur = computed(() => Math.min(this.pg(), this.pages().length - 1));
  protected readonly from = computed(() => this.cur() * PS);
  protected readonly page = computed(() => this.found().slice(this.from(), this.from() + PS));
  protected readonly off = computed(() => [...this.sel()].filter((n) => !this.page().some((c) => c.name === n)).length);

  protected reset(): void {
    this.pg.set(0);
    this.only.set(false);
  }
  protected clear(): void {
    this.sel.set(new Set());
    this.only.set(false);
    this.pg.set(0);
  }
  protected flip(n: string): void {
    this.sel.update((s) => {
      const x = new Set(s);
      x.has(n) ? x.delete(n) : x.add(n);
      if (!x.size) this.only.set(false);
      return x;
    });
  }
  protected add(): void {
    this.picked.emit([...this.sel()]);
    this.closed.emit();
  }
  protected open(n: string): void {
    this.closed.emit();
    this.nav.go('wip', { name: 'Компетенция «' + n + '»', sub: 'Страница компетенции в справочнике — в разработке' });
  }
}
