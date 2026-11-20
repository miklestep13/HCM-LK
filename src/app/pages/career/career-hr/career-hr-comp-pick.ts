import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { CareerRoleStore } from '../../../core/demo/career-role.service';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { Modal } from '../../../shared/ui/modal/modal';

const PS = 5;

/**
 * Окно «Добавить компетенции» — то же, что при добавлении задачи в ИПР:
 * поиск, фильтр, по 5 на странице, «Выбрано N», уже добавленные не снимаются.
 * Без должности и уровня: в таблице только компетенция. Справочник — компетенции трека.
 */
@Component({
  selector: 'app-career-hr-comp-pick',
  imports: [Modal, FilterBar, Icon],
  template: `
    <app-modal title="Добавить компетенции" panel="mdl-lg" [open]="true" (openChange)="closed.emit()">
      <div class="c cmbar">
        <app-filter-bar placeholder="Поиск по названию или описанию" [query]="q()" (queryChange)="reset(); q.set($event)">
          <select class="sel" ftName="Группа" (change)="reset(); group.set($any($event.target).value)">
            <option value="">Все группы</option>
            @for (g of groups; track g) {
              <option>{{ g }}</option>
            }
          </select>
        </app-filter-bar>
      </div>
      <div class="cpwrap">
        @if (sel().size) {
          <div class="cpss">
            <span>
              <b>Выбрано {{ sel().size }}</b>
              @if (off()) {
                <small>из них на других страницах: {{ off() }}</small>
              }
            </span>
            <button type="button" class="lnk" (click)="only.set(!only()); pg.set(0)">{{ only() ? 'Показать все' : 'Показать выбранные' }}</button>
            <button type="button" class="lnk" (click)="clear()">Сбросить</button>
          </div>
        }
        <div class="tw">
          <table class="tbl iprc">
            <thead>
              <tr>
                <th class="chk" style="width: 38px">
                  <label class="ckb" title="Выбрать все на странице">
                    <input type="checkbox" [checked]="allOn()" [indeterminate]="someOn()" [disabled]="!free().length" (change)="all($any($event.target).checked)" /><i></i>
                  </label>
                </th>
                <th>Компетенция</th>
              </tr>
            </thead>
            <tbody>
              @for (c of page(); track c.name) {
                @let on = has().includes(c.name);
                <tr [class.cpdone]="on">
                  <td class="chk">
                    <label class="ckb"><input type="checkbox" [checked]="on || sel().has(c.name)" [disabled]="on" (change)="flip(c.name)" /><i></i></label>
                  </td>
                  <td><b>{{ c.name }}</b><small>{{ c.desc }}</small></td>
                </tr>
              } @empty {
                <tr><td colspan="2" class="gr">Ничего не найдено</td></tr>
              }
            </tbody>
          </table>
        </div>
        @if (found().length > ps) {
          <div class="cppg">
            <small>{{ from() + 1 }}–{{ from() + page().length }} из {{ found().length }}</small>
            <div class="cppn">
              <button type="button" class="cppb" title="Предыдущая страница" [disabled]="!cur()" (click)="pg.set(cur() - 1)"><app-icon name="pgPrev" /></button>
              @for (i of pages(); track i) {
                <button type="button" class="cppb" [class.on]="i === cur()" (click)="pg.set(i)">{{ i + 1 }}</button>
              }
              <button type="button" class="cppb" title="Следующая страница" [disabled]="cur() >= pages().length - 1" (click)="pg.set(cur() + 1)"><app-icon name="pgNext" /></button>
            </div>
          </div>
        }
      </div>
      <div class="ipff">
        <button type="button" class="btn raised" (click)="closed.emit()">Отменить</button>
        <button type="button" class="btn pri" [disabled]="!sel().size" (click)="add()">{{ sel().size ? 'Добавить · ' + sel().size : 'Добавить' }}</button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrCompPick {
  private readonly s = inject(CareerRoleStore);
  readonly closed = output<void>();

  protected readonly ps = PS;
  protected readonly groups = [...new Set(this.s.compCatalog.map((c) => c.group))];
  protected readonly q = signal('');
  protected readonly group = signal('');
  protected readonly pg = signal(0);
  protected readonly only = signal(false);
  protected readonly sel = signal(new Set<string>());
  protected readonly has = computed(() => this.s.comps().map((c) => c.name));

  protected readonly found = computed(() => {
    const q = this.q().trim().toLowerCase();
    const picked = this.sel();
    return this.s.compCatalog.filter((c) =>
      this.only() && picked.size
        ? picked.has(c.name)
        : (!q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)) && (!this.group() || c.group === this.group()),
    );
  });
  protected readonly pages = computed(() => Array.from({ length: Math.max(1, Math.ceil(this.found().length / PS)) }, (_, i) => i));
  protected readonly cur = computed(() => Math.min(this.pg(), this.pages().length - 1));
  protected readonly from = computed(() => this.cur() * PS);
  protected readonly page = computed(() => this.found().slice(this.from(), this.from() + PS));
  protected readonly off = computed(() => [...this.sel()].filter((n) => !this.page().some((c) => c.name === n)).length);
  protected readonly free = computed(() => this.page().filter((c) => !this.has().includes(c.name)));
  protected readonly allOn = computed(() => !!this.free().length && this.free().every((c) => this.sel().has(c.name)));
  protected readonly someOn = computed(() => !this.allOn() && this.free().some((c) => this.sel().has(c.name)));

  protected all(on: boolean): void {
    this.sel.update((s) => {
      const x = new Set(s);
      this.free().forEach((c) => (on ? x.add(c.name) : x.delete(c.name)));
      if (!x.size) this.only.set(false);
      return x;
    });
  }
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
    this.s.addComps([...this.sel()]);
    this.closed.emit();
  }
}
