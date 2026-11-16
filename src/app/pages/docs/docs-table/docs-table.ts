import { Pager, paginate } from '../../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, input, output, signal } from '@angular/core';
import { DOC_STATUS_TONE } from '../../../data/docs.data';
import { MyDoc } from '../../../interface/doc';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Таблица документов: документ, источник, дата, статус; справа — «Скачать» и «⋯» (открыть, отправить на почту). Клик по строке открывает документ. */
@Component({
  selector: '[docs-table]',
  imports: [Pager, Float, Icon],
  template: `
    <div class="tw">
      <table class="tbl rtbl dctbl">
        <thead>
          <tr>
            <th>Документ</th>
            <th style="width: 190px">Источник</th>
            <th style="width: 130px">Дата</th>
            <th style="width: 160px">Статус</th>
            <th class="tact"></th>
          </tr>
        </thead>
        <tbody>
          @for (d of pg.view(); track d.id) {
            <tr (click)="open.emit(d)">
              <td><b>{{ d.name }}</b></td>
              <td class="gr">{{ d.src }}</td>
              <td class="gr">{{ d.date }}</td>
              <td><span class="bdg" [class]="tone[d.status]">{{ d.status }}</span></td>
              <td class="tact">
                <span class="acts">
                  <button class="actb" title="Скачать" aria-label="Скачать" (click)="$event.stopPropagation(); download(d)"><app-icon name="download" /></button>
                  <button class="actb dots" title="Еще" aria-label="Еще" [class.on]="menu()?.d === d" (click)="toggle(d, $event)"><app-icon name="dots" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty sm">Документов не нашли — измените запрос или фильтры</td></tr>
          }
        </tbody>
      </table>
    </div>
    <app-pager [p]="pg" />
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m.a" (click)="$event.stopPropagation()">
        <button class="ami" (click)="openDoc()"><app-icon name="open" />Открыть</button>
        <button class="ami" (click)="mail()"><app-icon name="sendArrow" />Отправить по почте</button>
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'dc-table', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsTable {
  readonly list = input.required<MyDoc[]>();
  readonly open = output<MyDoc>();
  /** постранично: <app-pager [p]="pg" /> под таблицей */
  protected readonly pg = paginate(() => this.list());
  protected readonly tone = DOC_STATUS_TONE;
  private readonly toast = inject(ToastService);
  protected readonly menu = signal<{ d: MyDoc; a: HTMLElement } | null>(null);

  protected toggle(d: MyDoc, e: MouseEvent): void {
    e.stopPropagation();
    this.menu.set(this.menu()?.d === d ? null : { d, a: e.currentTarget as HTMLElement });
  }
  protected download(d: MyDoc): void {
    this.toast.show('Документ скачан', d.name + ' — в формате PDF.');
  }
  protected openDoc(): void {
    const d = this.menu()!.d;
    this.menu.set(null);
    this.open.emit(d);
  }
  protected mail(): void {
    const d = this.menu()!.d;
    this.menu.set(null);
    this.toast.show('Документ отправлен', d.name + ' — на рабочую почту.');
  }
}
