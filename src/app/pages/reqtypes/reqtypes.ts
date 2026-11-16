import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { ReqTypeItem } from '../../interface/req';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { ReqtypesTable } from './reqtypes-table/reqtypes-table';
import { ReqTypesStore } from './reqtypes.store';

/**
 * «Управление персоналом → Заявки → Типы заявок» — справочник типов заявок:
 * шапка с поиском и «Добавить»; таблица — название, «Создано», «Изменено», «⋯».
 */
@Component({
  selector: 'app-reqtypes',
  imports: [PageHead, FilterBar, ReqtypesTable],
  template: `
    <app-page-head title="Типы заявок" />
    <div class="c full">
      <app-filter-bar placeholder="Поиск по названию" [(query)]="q">
        <button ftAction class="btn pri" (click)="create()">Добавить</button>
      </app-filter-bar>
      <div class="cb" style="padding-top: 4px" reqtypes-table [list]="shown()" (edit)="edit($event)" (remove)="remove($event)"></div>
    </div>
  `,
  styleUrl: './reqtypes.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-reqtypes' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reqtypes {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly nav = inject(NavService);
  private readonly store = inject(ReqTypesStore);
  protected readonly list = this.store.list;
  protected readonly q = signal('');

  protected readonly shown = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.list().filter((r) => !q || r.n.toLowerCase().includes(q));
  });

  protected create(): void {
    this.nav.go('reqtypenew');
  }
  protected edit(r: ReqTypeItem): void {
    this.nav.go('reqtypenew', { rt: r.id });
  }
  protected async remove(r: ReqTypeItem): Promise<void> {
    if (!(await this.confirm.ask({ title: 'Удалить тип заявки?', text: 'Тип **' + r.n + '** будет удален из справочника.', ok: 'Удалить', danger: true }))) return;
    this.store.remove(r.id);
    this.toast.show('Тип заявки удален', r.n);
  }
}
