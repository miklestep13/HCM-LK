import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { BookingStore } from '../../../core/demo/booking.service';
import { NavService } from '../../../core/navigation/nav.service';
import { BK_FEAT, BK_ZN } from '../../../data/booking.data';
import { avCls, ME, ME_PHOTO, Person } from '../../../data/people.data';
import { BkSeat } from '../../../interface/booking';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MapUi } from '../map.ui';

/** Блок «Список мест»: таблица мест этажа (сначала свободные), оснащение, статус, соседи, бронь/отмена. */
@Component({
  selector: '[map-desks]',
  imports: [NgTemplateOutlet],
  templateUrl: './map-desks.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapDesks {
  protected readonly avCls = avCls;
  protected readonly s = inject(BookingStore);
  private readonly ui = inject(MapUi);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly zn = BK_ZN;
  protected readonly mePhoto = ME_PHOTO;
  protected readonly feats = (f: boolean[]) => BK_FEAT.filter((_, i) => f[i]);
  protected readonly rows = computed(() => {
    const rank = { free: 0, mine: 1, busy: 2 }, q = this.s.q().trim().toLowerCase(), feat = this.s.feat();
    const match = (x: BkSeat) => (!q || x.id.toLowerCase().includes(q) || (!!x.p && x.p[0].toLowerCase().includes(q))) && feat.every((f) => x.f[BK_FEAT.indexOf(f)]);
    return this.s.seats().filter((x) => !this.s.filtered() || match(x)).sort((a, b) => rank[a.st] - rank[b.st]);
  });
  protected near = (x: BkSeat) => this.s.seats().filter((y) => y.c === x.c && y !== x && y.st !== 'free');
  protected who = (y: BkSeat): Person => (y.st === 'mine' ? ME : y.p!);

  protected person(y: BkSeat, e: Event): void {
    e.stopPropagation();
    this.ui.pop.set({ kind: 'person', p: this.who(y), rows: [['Место', y.id + ', ' + BK_ZN[y.z]], ['В офисе', y.till]], ...this.ui.at(e.currentTarget as Element, 320, 230) });
  }
  protected book(id: string): void { this.s.draft.set({ mode: 'desk', seat: id }); this.nav.go('bkform'); }
  protected cancel(id: string): void {
    this.s.cancelDesk(id);
    this.toast.show('Бронь отменена', `Место ${id} на ${this.s.date()} снова свободно.`);
  }
}
