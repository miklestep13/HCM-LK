import { Injectable, computed, signal } from '@angular/core';
import { BK_CITY, BK_MINE_INIT, bkRooms, bkSeats } from '../../data/booking.data';
import { BkCtx, BkDeskBooking, BkMode, BkRoomBooking } from '../../interface/booking';

/** Черновик формы бронирования (страница bkform): какое место/переговорную предложить */
export interface BkDraft { mode: BkMode; seat?: string; room?: number; }

/**
 * Бронирование в демо: выбранный офис/этаж/дата, фильтры карты и брони пользователя.
 * Общее для страницы «Бронирование» (map) и формы бронирования (bkform).
 */
@Injectable({ providedIn: 'root' })
export class BookingStore {
  readonly mode = signal<BkMode>('desk');
  readonly view = signal<'map' | 'list'>('map');
  readonly city = signal('Екатеринбург');
  readonly office = signal('Малопрудная 5');
  readonly floor = signal(1);
  readonly date = signal('30.09.2026');
  readonly q = signal('');
  readonly feat = signal<string[]>([]);
  readonly cap = signal(0);
  readonly eq = signal<string[]>([]);
  /** показывать коллег на карте */
  readonly near = signal(true);
  readonly mine = signal<Record<string, BkDeskBooking>>({ ...BK_MINE_INIT });
  readonly rbk = signal<Record<string, BkRoomBooking>>({});
  readonly draft = signal<BkDraft>({ mode: 'desk' });

  readonly ctx = computed<BkCtx>(() => ({ office: this.office(), floor: this.floor(), date: this.date() }));
  readonly seats = computed(() => bkSeats(this.ctx(), this.mine()));
  readonly rooms = computed(() => bkRooms(this.ctx(), this.rbk()));
  readonly offices = computed(() => BK_CITY[this.city()]);
  /** включен ли хоть один фильтр */
  readonly filtered = computed(() =>
    this.mode() === 'desk' ? !!(this.q().trim() || this.feat().length) : !!(this.q().trim() || this.cap() || this.eq().length),
  );

  seatsAt(c: BkCtx) { return bkSeats(c, this.mine()); }
  roomsAt(c: BkCtx) { return bkRooms(c, this.rbk()); }

  setCity(c: string): void { this.city.set(c); this.office.set(BK_CITY[c][0]); this.floor.set(1); }
  resetFilters(): void { this.q.set(''); this.feat.set([]); this.cap.set(0); this.eq.set([]); }

  cancelDesk(id: string): void {
    const m = { ...this.mine() };
    delete m[this.key() + '|' + id];
    this.mine.set(m);
  }
  cancelRoom(i: number): void {
    const m = { ...this.rbk() };
    delete m[this.key() + '|' + i];
    this.rbk.set(m);
  }
  bookDesk(c: BkCtx, id: string, b: BkDeskBooking): void {
    this.mine.update((m) => ({ ...m, [c.office + '|' + c.floor + '|' + c.date + '|' + id]: b }));
  }
  bookRoom(c: BkCtx, i: number, b: BkRoomBooking): void {
    this.rbk.update((m) => ({ ...m, [c.office + '|' + c.floor + '|' + c.date + '|' + i]: b }));
  }
  private key(): string { const c = this.ctx(); return c.office + '|' + c.floor + '|' + c.date; }
}
