import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { BookingStore } from '../../core/demo/booking.service';
import { NavService } from '../../core/navigation/nav.service';
import { BK_CAPS, BK_CITY, BK_EQ, BK_FEAT, bkFD, bkPD } from '../../data/booking.data';
import { DateField } from '../../shared/ui/date-field/date-field';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { MultiSelect } from '../../shared/ui/multi-select/multi-select';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { MapCanvas } from './map-canvas/map-canvas';
import { MapDesks } from './map-desks/map-desks';
import { MapPop } from './map-pop/map-pop';
import { MapRooms } from './map-rooms/map-rooms';
import { MapUi } from './map.ui';

/**
 * Страница «Бронирование» (ключ прототипа: map): вкладки «Рабочие места» / «Переговорные»,
 * шапка с фильтрами (город, офис, дата, этаж, оснащение / вместимость и оборудование), карта этажа или список.
 * Бронирование открывает форму bkform. Состояние — BookingStore (общий с формой).
 */
@Component({
  selector: 'app-map',
  imports: [PageHead, FilterBar, Select, MultiSelect, DateField, MapCanvas, MapDesks, MapRooms, MapPop],
  providers: [MapUi],
  templateUrl: './map.html',
  styleUrl: './map.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-map' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Map {
  protected readonly s = inject(BookingStore);
  private readonly nav = inject(NavService);
  protected readonly cities = Object.keys(BK_CITY);
  protected readonly feats = BK_FEAT;
  protected readonly eqs = BK_EQ;
  protected readonly caps = BK_CAPS;
  protected readonly floors = [1, 2, 3, 4];
  protected readonly filtersOpen = signal(true);
  protected readonly capLabel = computed(() => (this.s.cap() ? 'От ' + this.s.cap() + ' человек' : 'Любая вместимость'));

  protected setCap(v: string): void { this.s.cap.set(parseInt(v.replace(/\D/g, ''), 10) || 0); }
  protected setDate(v: string): void {
    const d = /^\d{2}\.\d{2}\.\d{4}$/.test(v.trim()) ? bkPD(v.trim()) : null;
    if (d) this.s.date.set(bkFD(d));
  }
  protected book(): void {
    this.s.draft.set({ mode: this.s.mode() });
    this.nav.go('bkform');
  }
}
