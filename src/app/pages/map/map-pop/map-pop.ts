import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BookingStore } from '../../../core/demo/booking.service';
import { NavService } from '../../../core/navigation/nav.service';
import { BK_FEAT, BK_ZN } from '../../../data/booking.data';
import { avCls, ME, ME_PHOTO, Person } from '../../../data/people.data';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MapUi } from '../map.ui';

/** Всплывающие карточки «Бронирования»: место (кто рядом, забронировать/отменить), переговорная (участники), сотрудник. */
@Component({
  selector: 'app-map-pop',
  imports: [NgTemplateOutlet],
  templateUrl: './map-pop.html',
  encapsulation: ViewEncapsulation.None,
  host: { '(document:click)': 'ui.pop.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPop {
  protected readonly avCls = avCls;
  protected readonly ui = inject(MapUi);
  protected readonly s = inject(BookingStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly me = ME;
  protected readonly mePhoto = ME_PHOTO;
  protected readonly zn = BK_ZN;
  protected readonly feats = (f: boolean[]) => BK_FEAT.filter((_, i) => f[i]);

  protected readonly seat = computed(() => {
    const p = this.ui.pop();
    return p?.kind === 'seat' ? this.s.seats().find((x) => x.id === p.id) ?? null : null;
  });
  /** кто сидит за тем же столом */
  protected readonly near = computed(() => {
    const x = this.seat();
    return x ? this.s.seats().filter((y) => y.c === x.c && y !== x && y.st !== 'free') : [];
  });
  protected readonly room = computed(() => {
    const p = this.ui.pop();
    return p?.kind === 'room' ? this.s.rooms()[p.i] : null;
  });
  protected readonly person = computed(() => {
    const p = this.ui.pop();
    return p?.kind === 'person' ? p : null;
  });
  protected who = (y: { st: string; p?: Person }) => (y.st === 'mine' ? ME : y.p!);

  protected personOf(p: Person, rows: [string, string][], ev: Event): void {
    ev.stopPropagation();
    this.ui.pop.set({ kind: 'person', p, rows, ...this.ui.at(ev.currentTarget as Element, 320, 230) });
  }
  protected seatPerson(id: string, ev: Event): void {
    const y = this.s.seats().find((x) => x.id === id)!;
    this.personOf(this.who(y), [['Место', y.id + ', ' + BK_ZN[y.z]], ['В офисе', y.till]], ev);
  }
  protected bookDesk(id: string): void { this.s.draft.set({ mode: 'desk', seat: id }); this.ui.pop.set(null); this.nav.go('bkform'); }
  protected bookRoom(i: number): void { this.s.draft.set({ mode: 'room', room: i }); this.ui.pop.set(null); this.nav.go('bkform'); }
  protected cancelDesk(id: string): void {
    this.s.cancelDesk(id);
    this.ui.pop.set(null);
    this.toast.show('Бронь отменена', `Место ${id} на ${this.s.date()} снова свободно.`);
  }
  protected cancelRoom(i: number): void {
    const r = this.s.rooms()[i];
    this.s.cancelRoom(i);
    this.ui.pop.set(null);
    this.toast.show('Бронь отменена', `Переговорная ${r.no} ${r.n} на ${this.s.date()} снова свободна.`);
  }
  protected profile(): void { this.ui.pop.set(null); this.nav.go('prof'); }
  protected chat(p: Person): void { this.ui.pop.set(null); this.toast.show('Готово', `Открыт чат с сотрудником ${p[0]}.`); }
}
