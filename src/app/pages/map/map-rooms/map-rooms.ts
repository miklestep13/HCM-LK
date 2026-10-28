import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BookingStore } from '../../../core/demo/booking.service';
import { NavService } from '../../../core/navigation/nav.service';
import { BK_EQ, BK_EQ_ICONS, BK_USER_ICON } from '../../../data/booking.data';
import { plural } from '../../../data/org.data';
import { roomArt } from '../map-canvas/map-plan';

/** Блок «Список переговорных»: карточки с иллюстрацией, статусом, вместимостью и оборудованием. */
@Component({
  selector: '[map-rooms]',
  templateUrl: './map-rooms.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapRooms {
  protected readonly s = inject(BookingStore);
  private readonly nav = inject(NavService);
  private readonly san = inject(DomSanitizer);
  protected readonly user = this.san.bypassSecurityTrustHtml(BK_USER_ICON);
  protected readonly eqIcon = (e: string) => this.san.bypassSecurityTrustHtml(BK_EQ_ICONS[BK_EQ.indexOf(e)]);
  protected readonly art = (r: Parameters<typeof roomArt>[0]) => this.san.bypassSecurityTrustHtml(roomArt(r));
  protected readonly ppl = (n: number) => plural(n, 'человек', 'человека', 'человек');
  protected readonly rows = computed(() => {
    const q = this.s.q().trim().toLowerCase(), cap = this.s.cap(), eq = this.s.eq();
    return this.s.rooms().filter((r) => !this.s.filtered() || ((!q || (r.no + ' ' + r.n).toLowerCase().includes(q)) && r.cap >= cap && eq.every((e) => r.eq.includes(e))));
  });
  protected book(i: number): void { this.s.draft.set({ mode: 'room', room: i }); this.nav.go('bkform'); }
}
