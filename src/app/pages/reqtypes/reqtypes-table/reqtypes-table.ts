import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ReqTypeItem } from '../../../interface/req';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Pager, paginate } from '../../../shared/ui/pager/pager';

type SortKey = 'n' | 'created' | 'changed';
/** «дд.мм.гггг, чч:мм» → «ггггммддччмм» для сравнения */
const dkey = (d: string) => {
  const [dt, tm = ''] = d.split(', ');
  return dt.split('.').reverse().join('') + tm.replace(':', '');
};

/**
 * Таблица типов заявок: название, «Создано» и «Изменено» (дата и время); справа — карандаш «Редактировать» и «⋯» (редактировать, удалить).
 * Сортировка — щелчком по заголовку колонки (повторный — обратный порядок), под таблицей — пагинация.
 */
@Component({
  selector: '[reqtypes-table]',
  imports: [NgTemplateOutlet, Pager, Float, Icon],
  template: `
    <!-- заголовок колонки с сортировкой: текст и ⇅, у активной — синие; повторный щелчок — обратный порядок -->
    <ng-template #sh let-k="k" let-t="t">
      <button type="button" class="rtsh" [class.on]="srt().k === k" (click)="sortBy(k)">
        {{ t }}
        @if (srt().k !== k) {
          <svg viewBox="0 0 12 12" fill="none"><path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /><path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
        } @else if (srt().d > 0) {
          <svg viewBox="0 0 12 12" fill="none" aria-label="по возрастанию"><path d="M6 10V2M2.8 5.2 6 2l3.2 3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        } @else {
          <svg viewBox="0 0 12 12" fill="none" aria-label="по убыванию"><path d="M6 2v8M2.8 6.8 6 10l3.2-3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        }
      </button>
    </ng-template>
    <div class="tw">
      <table class="tbl rtbl rttbl">
        <thead>
          <tr>
            <th [attr.aria-sort]="aria('n')"><ng-container *ngTemplateOutlet="sh; context: { k: 'n', t: 'Название' }" /></th>
            <th style="width: 200px" [attr.aria-sort]="aria('created')"><ng-container *ngTemplateOutlet="sh; context: { k: 'created', t: 'Создано' }" /></th>
            <th style="width: 200px" [attr.aria-sort]="aria('changed')"><ng-container *ngTemplateOutlet="sh; context: { k: 'changed', t: 'Изменено' }" /></th>
            <th class="tact"></th>
          </tr>
        </thead>
        <tbody>
          @for (r of pg.view(); track r.id) {
            <tr>
              <td>{{ r.n }}</td>
              <td class="rtdt">{{ r.created }}</td>
              <td class="rtdt">{{ r.changed }}</td>
              <td class="tact">
                <span class="acts">
                  <button class="actb" title="Редактировать" aria-label="Редактировать" (click)="edit.emit(r)"><app-icon name="edit" /></button>
                  <button class="actb dots" title="Еще" aria-label="Еще" [class.on]="menu()?.r === r" (click)="toggle(r, $event)"><app-icon name="dots" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="4" class="empty sm">Типов заявок не нашли — измените запрос или фильтры</td></tr>
          }
        </tbody>
      </table>
    </div>
    <app-pager [p]="pg" />
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m.a" (click)="$event.stopPropagation()">
        <button class="ami" (click)="pick('edit')"><app-icon name="edit" />Редактировать</button>
        <button class="ami dg" (click)="pick('del')"><app-icon name="trashSm" />Удалить</button>
      </div>
    }
  `,
  styleUrl: './reqtypes-table.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'rt-table', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqtypesTable {
  readonly list = input.required<ReqTypeItem[]>();
  readonly edit = output<ReqTypeItem>();
  readonly remove = output<ReqTypeItem>();

  protected readonly srt = signal<{ k: SortKey | ''; d: 1 | -1 }>({ k: '', d: 1 });
  protected readonly sorted = computed(() => {
    const { k, d } = this.srt(), l = this.list();
    if (!k) return l;
    const key = (r: ReqTypeItem) => (k === 'n' ? r.n : dkey(r[k]));
    return [...l].sort((a, b) => d * key(a).localeCompare(key(b), 'ru'));
  });
  protected readonly pg = paginate(() => this.sorted());
  protected readonly menu = signal<{ r: ReqTypeItem; a: HTMLElement } | null>(null);

  protected aria(k: SortKey): string | null {
    const s = this.srt();
    return s.k === k ? (s.d > 0 ? 'ascending' : 'descending') : null;
  }
  protected sortBy(k: SortKey): void {
    const s = this.srt();
    this.srt.set({ k, d: s.k === k ? (-s.d as 1 | -1) : 1 });
  }
  protected toggle(r: ReqTypeItem, e: MouseEvent): void {
    e.stopPropagation();
    this.menu.set(this.menu()?.r === r ? null : { r, a: e.currentTarget as HTMLElement });
  }
  protected pick(a: 'edit' | 'del'): void {
    const r = this.menu()!.r;
    this.menu.set(null);
    (a === 'edit' ? this.edit : this.remove).emit(r);
  }
}
