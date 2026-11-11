import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { BldTemplatesStore } from '../../../core/demo/bld-templates.store';
import { BLD_MOD_KINDS, BLD_MOD_KIND_LIST } from '../../../data/builder.data';
import { shortFio } from '../../../data/org.data';
import { BldModTemplate } from '../../../interface/builder';
import { Icon } from '../../../shared/ui/icon/icon';
import { Modal } from '../../../shared/ui/modal/modal';
import { Select } from '../../../shared/ui/select/select';

/**
 * Окно «Шаблоны модулей» (курс, «Добавить модуль → Из шаблонов»): поиск по названию, фильтр по виду,
 * таблица — название и описание, вид, блоков, автор, дата; клик по строке — добавить модуль из шаблона.
 */
@Component({
  selector: '[bld-tpl]',
  imports: [Modal, Select, Icon],
  template: `
    <app-modal title="Шаблоны модулей" panel="bldtplm" [open]="true" (openChange)="closed.emit()">
      <div class="bldtplf">
        <input class="tsearch" placeholder="Поиск по названию" [value]="q()" (input)="q.set($any($event.target).value)" />
        <app-select [options]="kindNames" allLabel="Все виды" placeholder="Вид" valuePrefix="Вид: " [value]="kind()" (valueChange)="kind.set($event)" />
      </div>
      <div class="tw">
        <table class="tbl">
          <thead>
            <tr>
              <th>Название</th>
              <th>Вид</th>
              <th>Блоков</th>
              <th>Автор</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            @for (t of list(); track t.id) {
              <tr class="clk" (click)="picked.emit(t)">
                <td><b>{{ t.t }}</b>@if (t.d) {<small class="bldtpld">{{ t.d }}</small>}</td>
                <td><span class="bldtpk"><app-icon [name]="kinds[t.mk].icon" />{{ kinds[t.mk].name }}</span></td>
                <td>{{ t.blocks.length }}</td>
                <td>{{ fio(t.au) }}</td>
                <td>{{ t.date }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="gr">Ничего не найдено. Измените запрос или вид.</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="mdlf"><button class="btn raised" (click)="closed.emit()">Отменить</button></div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldTpl {
  private readonly store = inject(BldTemplatesStore);
  readonly picked = output<BldModTemplate>();
  readonly closed = output<void>();
  protected readonly kinds = BLD_MOD_KINDS;
  protected readonly kindNames = BLD_MOD_KIND_LIST.map((k) => BLD_MOD_KINDS[k].name);
  protected readonly fio = shortFio;
  protected readonly q = signal('');
  protected readonly kind = signal('');
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(), k = this.kind();
    return this.store.list().filter((t) => (!q || (t.t + ' ' + t.d).toLowerCase().includes(q)) && (!k || BLD_MOD_KINDS[t.mk].name === k));
  });
}
