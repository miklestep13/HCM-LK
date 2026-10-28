import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { ATT_ACTIVITIES } from '../../../data/attest.data';
import { Chips } from '../../../shared/ui/chips/chips';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { AttncardCol } from '../attncard-col/attncard-col';
import { avFor } from '../attncard.utils';

/** Пройденные оценки (до аттестации): оценка 360 и оценка по целям; строка открывает источник */
@Component({
  selector: '[attncard-acts]',
  imports: [AttncardCol, FilterBar, Chips, Select],
  template: `
    <div class="ch">
      <button attncard-col="Пройденные оценки"></button>
      <h3>Пройденные оценки</h3>
      <span class="chip">{{ all.length }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по способу оценки" [(query)]="q">
      <app-chips label="Статус" [options]="statuses" [(value)]="st" />
      <app-select label="Способ" [options]="types" allLabel="Все способы" placeholder="Все способы" [(value)]="t" />
    </app-filter-bar>
    <div class="cb">
      <div class="tw">
        <table class="tbl clbtbl asttbl afacttbl">
          <thead>
            <tr><th>Способ оценки</th><th>Оценивающий</th><th>Дата оценки</th><th>Значение</th><th>Статус</th><th></th></tr>
          </thead>
          <tbody>
            @for (a of rows(); track a.k) {
              <tr class="afrow afgo" [title]="a.go === 'growth' ? 'Открыть оценку 360' : 'Открыть Карту целей'" (click)="nav.go(a.go)">
                <td><b class="asttp">{{ a.t }}</b></td>
                <td>
                  @if (a.k === 'goals') {
                    <span class="pcell2 clbper astper"
                      ><span class="av astav" [class]="fed"></span><span class="cnm"><b>Федорова Ю. С.</b><small>Руководитель</small></span></span
                    >
                  } @else {
                    <span class="gr">—</span>
                  }
                </td>
                <td>{{ a.d }}</td>
                <td>
                  @if (a.lt) {
                    <span [class]="'clbg g' + a.sq" [title]="a.res">{{ a.sq }}</span>
                  } @else {
                    <span class="gr">—</span>
                  }
                </td>
                <td><span class="bdg ok">Проставлена</span></td>
                <td></td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="gr curnone">Оценки не найдены. Измените запрос или фильтры.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  host: { class: 'afsect', '[class.afcold]': 's.isCold("Пройденные оценки")' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardActs {
  protected readonly s = inject(AttestStore);
  protected readonly nav = inject(NavService);
  protected readonly all = ATT_ACTIVITIES;
  protected readonly fed = avFor('Федорова Ю. С.', 5);
  protected readonly types = ATT_ACTIVITIES.map((a) => a.t);
  protected readonly statuses = ['Проставлена', 'Ждет оценки'];
  protected readonly q = signal('');
  protected readonly t = signal('');
  protected readonly st = signal('');
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.all.filter(
      (a) => (!q || (a.t + ' ' + a.who + ' ' + a.role).toLowerCase().includes(q)) && (!this.t() || a.t === this.t()) && (!this.st() || this.st() === 'Проставлена'),
    );
  });
}
