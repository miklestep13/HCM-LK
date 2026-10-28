import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { BookingStore } from '../../core/demo/booking.service';
import { NavService } from '../../core/navigation/nav.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { BkformDesk } from './bkform-desk/bkform-desk';
import { BkformRoom } from './bkform-room/bkform-room';

/** Страница «Бронирование места» / «Бронирование переговорной» (ключ прототипа: bkform) — открывается из «Бронирования». */
@Component({
  selector: 'app-bkform',
  imports: [PageHead, BkformDesk, BkformRoom],
  template: `
    @let desk = s.draft().mode === 'desk';
    <app-page-head [title]="desk ? 'Бронирование места' : 'Бронирование переговорной'" backTo="map" backLabel="К бронированию" />
    <div class="narrow">
      <div class="c">
        <div class="cb rqfrm">
          @if (desk) {
            <div bkform-desk (saved)="done($event)"></div>
          } @else {
            <div bkform-room (saved)="done($event)"></div>
          }
          <div class="acts" style="gap: 8px">
            <button class="btn raised" (click)="nav.go('map')">Отменить</button>
            <button class="btn pri" (click)="save()">Забронировать</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './bkform.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-bkform' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Bkform {
  protected readonly s = inject(BookingStore);
  protected readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly desk = viewChild(BkformDesk);
  private readonly room = viewChild(BkformRoom);
  protected save(): void { (this.desk() ?? this.room())?.save(); }
  protected done(msg: string): void {
    this.nav.go('map');
    this.toast.show('Готово', msg);
  }
}
