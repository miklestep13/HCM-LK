import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { AttPerson } from '../../../interface/attest';
import { Chips } from '../../../shared/ui/chips/chips';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { avFor } from '../attncard.utils';

const RESP = 'Ответственный за бланк';

/** Участники таблицей (раскладка «Одна колонка»): участник, роль, дата с, дата по, статус; поиск, роль и статус */
@Component({
  selector: '[attncard-people-table]',
  imports: [FilterBar, Chips, Select, Icon, Float],
  template: `
    <div class="ch">
      <h3>Участники</h3>
      <span class="chip">{{ actN() }}</span>
      @if (s.canEditPeople()) {
        <button class="btn pri afpadd" (click)="edit.emit(null)">Добавить</button>
      }
    </div>
    <app-filter-bar placeholder="Поиск по ФИО или должности" [(query)]="q">
      @if (!emp()) {
        <app-chips label="Статус" [options]="statuses" [(value)]="st" />
      }
      <app-select label="Роль" [options]="roleOpts()" allLabel="Все роли" placeholder="Все роли" [(value)]="r" />
    </app-filter-bar>
    <div class="cb">
      <div class="tw">
        <table class="tbl asttbl afpt">
          <thead>
            <tr><th>Участник</th><th>Роль</th><th>Дата с</th><th>Дата по</th><th>Статус</th><th></th></tr>
          </thead>
          <tbody>
            @for (x of rows(); track x.name + x.role) {
              @let off = !!x.till;
              <tr [class.afoff]="off">
                <td>
                  <span class="pcell2 clbper astper"
                    ><span class="av astav" [class]="av(x.name, x.av)"></span><span class="cnm"><b>{{ x.name }}</b><small>{{ x.post }}</small></span></span
                  >
                </td>
                <td>
                  <span class="gltags">
                    @for (z of roles(x); track z) {
                      <span class="bdg">{{ z }}</span>
                    }
                  </span>
                </td>
                <td>{{ x.since || '01.09.2026' }}</td>
                <td>
                  @if (x.till) {
                    {{ x.till }}
                  } @else {
                    <span class="gr">—</span>
                  }
                </td>
                <td>
                  @if (off) {
                    <span class="bdg gry">Не действует</span>
                  } @else {
                    <span class="bdg ok">Действует</span>
                  }
                </td>
                <td>
                  <span class="acts">
                    @if (s.canEditPeople() && !off && x.role !== 'Руководитель') {
                      <button class="actb dots afpm" title="Действия" (click)="openMenu(x, $event)"><app-icon name="dots" /></button>
                    }
                  </span>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="gr curnone">Участники не найдены. Измените запрос или фильтры.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m.a" (click)="$event.stopPropagation()">
        <button class="ami" (click)="menu.set(null); edit.emit(m.x)"><app-icon name="edit" />Редактировать</button>
        <button class="ami dg" (click)="menu.set(null); remove.emit(m.x)"><app-icon name="trashSm" />Исключить из аттестации</button>
      </div>
    }
  `,
  host: { '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardPeopleTable {
  protected readonly s = inject(AttestStore);
  readonly edit = output<AttPerson | null>();
  readonly remove = output<AttPerson>();
  protected readonly av = avFor;
  protected readonly statuses = ['Действует', 'Не действует'];
  protected readonly q = signal('');
  protected readonly r = signal('');
  protected readonly st = signal('');
  protected readonly menu = signal<{ x: AttPerson; a: HTMLElement } | null>(null);
  protected readonly emp = computed(() => this.s.role() === 'emp');
  protected readonly actN = computed(() => this.s.people().filter((x) => !x.till).length);
  protected readonly roleOpts = computed(() => [...new Set([...this.s.people().flatMap((x) => (x.role ? x.role.split(', ') : [])), RESP])]);
  protected roles(x: AttPerson): string[] {
    return [...(x.role ? x.role.split(', ') : []), ...(x.name === this.s.responsible() && !x.till ? [RESP] : [])];
  }
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(),
      emp = this.emp();
    return this.s
      .people()
      .filter(
        (x) =>
          (!emp || !x.till) &&
          (!q || (x.name + ' ' + x.post).toLowerCase().includes(q)) &&
          (!this.r() || this.roles(x).includes(this.r())) &&
          (!this.st() || (this.st() === 'Действует') === !x.till),
      )
      .sort((a, b) => (a.till ? 1 : 0) - (b.till ? 1 : 0));
  });
  protected openMenu(x: AttPerson, e: Event): void {
    e.stopPropagation();
    const a = e.currentTarget as HTMLElement;
    this.menu.set(this.menu()?.a === a ? null : { x, a });
  }
}
