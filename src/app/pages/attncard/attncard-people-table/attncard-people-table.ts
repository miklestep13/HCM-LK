import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { AttPerson } from '../../../interface/attest';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { AttncardPersonAdd } from '../attncard-person-add/attncard-person-add';
import { AttncardCol } from '../attncard-col/attncard-col';
import { avFor } from '../attncard.utils';

const RESP = 'Ответственный за бланк';

/** Участники таблицей (блок сворачивается стрелкой слева от заголовка): участник и роли (только действующие); поиск, фильтр по роли; «Добавить» — справа от фильтра */
@Component({
  selector: '[attncard-people-table]',
  imports: [FilterBar, Select, Icon, AttncardPersonAdd, AttncardCol],
  template: `
    <div class="ch">
      <button attncard-col="Участники"></button>
      <h3>Участники</h3>
      <span class="chip">{{ actN() }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по ФИО или должности" [(query)]="q">
      @if (s.canEditPeople()) {
        <!-- «Добавить» — последней в строке поиска, справа от фильтра: новая строка наверху таблицы -->
        <button ftAction class="btn pri" (click)="addRow()">Добавить</button>
      }
      <app-select
        label="Роль"
        [options]="roleOpts()"
        allLabel="Все роли"
        placeholder="Все роли"
        [(value)]="r"
      />
    </app-filter-bar>
    <div class="cb">
      <div class="tw">
        <table class="tbl asttbl afpt">
          <thead>
            <tr>
              <th>Участник</th>
              <th>Роль</th>
              <th class="tact"></th>
            </tr>
          </thead>
          <tbody>
            @if (adding() && !editing()) {
              <tr class="afedr">
                <td colspan="3"><div attncard-person-add class="afedit" (done)="adding.set(false)"></div></td>
              </tr>
            }
            @for (x of rows(); track x.name + x.role) {
              @if (editing() === x.name) {
                <tr class="afedr">
                  <td colspan="3">
                    <div
                      attncard-person-add
                      class="afedit"
                     
                      [person]="x"
                      (done)="editing.set(null)"
                    ></div>
                  </td>
                </tr>
              } @else {
                <tr>
                  <td>
                    <span class="pcell2 clbper astper"
                      ><span class="av astav" [class]="av(x.name, x.av)"></span
                      ><span class="cnm"
                        ><b>{{ x.name }}</b
                        ><small>{{ x.post }}</small></span
                      ></span
                    >
                  </td>
                  <td>
                    <span class="gltags">
                      @for (z of roles(x); track z) {
                        <span class="bdg">{{ z }}</span>
                      }
                    </span>
                  </td>
                  <td class="tact">
                    <span class="acts">
                      @if (s.canEditPeople() && x.role !== 'Руководитель') {
                        <!-- действия строки иконками: «Редактировать» слева, «Удалить» справа -->
                        <button class="actb" title="Редактировать" aria-label="Редактировать участника" (click)="editRow(x)">
                          <app-icon name="edit" />
                        </button>
                        <button class="actb dg" title="Удалить" aria-label="Удалить участника" (click)="remove.emit(x)">
                          <app-icon name="trashSm" />
                        </button>
                      }
                    </span>
                  </td>
                </tr>
              }
            } @empty {
              <tr>
                <td colspan="3" class="gr curnone">
                  Участники не найдены. Измените запрос или фильтры.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  host: { class: 'afsect', '[class.afcold]': 's.isCold("Участники")' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardPeopleTable {
  protected readonly s = inject(AttestStore);
  readonly remove = output<AttPerson>();
  protected readonly av = avFor;
  protected readonly q = signal('');
  protected readonly r = signal('');
  /** открыта строка добавления (наверху таблицы) */
  protected readonly adding = signal(false);
  /** участник (ФИО), которого меняют строкой на его месте */
  protected readonly editing = signal<string | null>(null);
  /** «Добавить»: новая строка наверху таблицы */
  protected addRow(): void {
    this.editing.set(null);
    this.adding.set(true);
  }
  /** «Редактировать»: строка на месте участника */
  protected editRow(x: AttPerson): void {
    this.adding.set(false);
    this.editing.set(x.name);
  }
  protected readonly actN = computed(() => this.s.people().filter((x) => !x.till).length);
  protected readonly roleOpts = computed(() => [
    ...new Set([...this.s.people().flatMap((x) => (x.role ? x.role.split(', ') : [])), RESP]),
  ]);
  protected roles(x: AttPerson): string[] {
    return [
      ...(x.role ? x.role.split(', ') : []),
      ...(x.name === this.s.responsible() ? [RESP] : []),
    ];
  }
  /** только действующие участники (исключенные из аттестации не показываются); поиск по ФИО и должности, фильтр по роли */
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.s
      .people()
      .filter(
        (x) =>
          !x.till &&
          (!q || (x.name + ' ' + x.post).toLowerCase().includes(q)) &&
          (!this.r() || this.roles(x).includes(this.r())),
      );
  });
}
