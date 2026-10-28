import {
  ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, inject, signal, viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BookingStore } from '../../../core/demo/booking.service';
import { NavService } from '../../../core/navigation/nav.service';
import { BK_EQ, BK_EQ_ICONS, BK_FEAT, BK_USER_ICON } from '../../../data/booking.data';
import { avCls, ME, ME_PHOTO } from '../../../data/people.data';
import { BkRoom, BkSeat } from '../../../interface/booking';
import { MapUi } from '../map.ui';
import { mapPlan } from './map-plan';

/**
 * Блок «Карта этажа»: план, места (свободно / занято / ваша бронь, фото коллег), переговорные,
 * легенда и счетчик, масштаб колесом и кнопками, перетаскивание.
 */
@Component({
  selector: '[map-canvas]',
  templateUrl: './map-canvas.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCanvas {
  protected readonly avCls = avCls;
  protected readonly s = inject(BookingStore);
  private readonly ui = inject(MapUi);
  private readonly nav = inject(NavService);
  private readonly san = inject(DomSanitizer);
  private readonly map = viewChild.required<ElementRef<HTMLElement>>('map');
  protected readonly me = ME;
  protected readonly mePhoto = ME_PHOTO;
  protected readonly user = this.san.bypassSecurityTrustHtml(BK_USER_ICON);
  protected readonly eqIcon = (e: string) => this.san.bypassSecurityTrustHtml(BK_EQ_ICONS[BK_EQ.indexOf(e)]);

  protected readonly z = signal(0);
  protected readonly x = signal(0);
  protected readonly y = signal(0);
  protected readonly drag = signal(false);
  private fitted = '';

  protected readonly desk = computed(() => this.s.mode() === 'desk');
  protected readonly plan = computed(() => this.san.bypassSecurityTrustHtml(mapPlan(this.s.rooms())));
  protected readonly transform = computed(() => `translate(${this.x()}px, ${this.y()}px) scale(${this.z()})`);

  /** счетчик над картой */
  protected readonly stat = computed(() => {
    const D = this.desk(), S = this.s.seats(), R = this.s.rooms(), fo = this.s.filtered();
    const fr = D ? S.filter((x) => x.st === 'free') : R.filter((r) => r.st === 'free');
    const fit = D ? (fr as BkSeat[]).filter((x) => this.seatMatch(x)).length : (fr as BkRoom[]).filter((x) => this.roomMatch(x)).length;
    const fc = D && this.s.q().trim() ? S.filter((x) => x.st === 'busy' && this.seatMatch(x)).length : 0;
    if (fc) return { pre: 'Найдено коллег: ', b: String(fc), post: '' };
    if (fo) return { pre: 'Под фильтр подходят ', b: String(fit), post: ' из ' + fr.length + ' свободных' };
    return { pre: 'Свободно ', b: String(fr.length), post: ' из ' + (D ? S.length : R.length) };
  });
  protected readonly legend = computed(() => {
    const fo = this.s.filtered();
    return this.desk()
      ? [['lf', 'Свободно'], ['lb', 'Занято'], ['lm', 'Ваша бронь'], ...(fo ? [['lh', 'Подходит под фильтр']] : [])]
      : [['lrf', 'Свободна'], ['lrb', 'Занята'], ['lrm', 'Ваша бронь'], ...(fo ? [['lrh', 'Подходит под фильтр']] : [])];
  });

  constructor() {
    // подогнать этаж под окно при первом показе и при смене офиса/этажа/режима
    afterRenderEffect(() => {
      const key = this.s.office() + this.s.floor() + this.s.mode();
      if (this.fitted !== key) { this.fitted = key; this.fit(); }
    });
  }

  seatMatch(x: BkSeat): boolean {
    const q = this.s.q().trim().toLowerCase();
    return (!q || x.id.toLowerCase().includes(q) || (!!x.p && x.p[0].toLowerCase().includes(q))) && this.s.feat().every((f) => x.f[BK_FEAT.indexOf(f)]);
  }
  roomMatch(r: BkRoom): boolean {
    const q = this.s.q().trim().toLowerCase();
    return (!q || (r.no + ' ' + r.n).toLowerCase().includes(q)) && r.cap >= this.s.cap() && this.s.eq().every((e) => r.eq.includes(e));
  }
  protected seatCls(x: BkSeat): string {
    let c = x.st;
    if (!this.desk()) return c + ' mute';
    if (!this.s.filtered()) return c;
    const m = this.seatMatch(x);
    return c + (!m ? ' dim' : x.st === 'free' ? ' hl' : x.st === 'busy' && this.s.q().trim() ? ' fnd' : '');
  }
  protected roomCls(r: BkRoom): string {
    if (this.desk() || !this.s.filtered()) return r.st;
    return r.st + (this.roomMatch(r) ? (r.st === 'free' ? ' hl' : '') : ' dim');
  }

  // ——— масштаб и перемещение ———
  protected fit(): void {
    const v = this.map().nativeElement;
    const z = Math.min((v.clientWidth - 120) / 1200, (v.clientHeight - 32) / 740);
    this.z.set(z); this.x.set((v.clientWidth - 1200 * z) / 2); this.y.set((v.clientHeight - 740 * z) / 2);
  }
  protected zoom(f: number, cx?: number, cy?: number): void {
    const v = this.map().nativeElement;
    cx ??= v.clientWidth / 2; cy ??= v.clientHeight / 2;
    const z = this.z(), nz = Math.min(2.6, Math.max(0.4, z * f));
    this.x.set(cx - ((cx - this.x()) * nz) / z); this.y.set(cy - ((cy - this.y()) * nz) / z); this.z.set(nz);
  }
  protected wheel(e: WheelEvent): void {
    e.preventDefault();
    const r = this.map().nativeElement.getBoundingClientRect();
    this.zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
  }
  protected down(e: PointerEvent): void {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.bkzm')) return;
    const sx = e.clientX, sy = e.clientY, ox = this.x(), oy = this.y();
    let mv = false;
    const mm = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!mv && Math.hypot(dx, dy) < 5) return;
      if (!mv) { mv = true; this.ui.pop.set(null); this.drag.set(true); }
      this.x.set(ox + dx); this.y.set(oy + dy);
    };
    const up = () => {
      removeEventListener('pointermove', mm); removeEventListener('pointerup', up);
      this.drag.set(false);
      if (mv) this.ui.dragAt = Date.now();
    };
    addEventListener('pointermove', mm); addEventListener('pointerup', up);
  }

  // ——— клики ———
  protected seat(x: BkSeat, e: MouseEvent): void {
    e.stopPropagation();
    if (this.ui.dragged()) return;
    const el = e.currentTarget as HTMLElement, cur = this.ui.pop();
    if (cur && cur.kind !== 'room' && ((cur.kind === 'seat' && cur.id === x.id))) return this.ui.pop.set(null);
    if (x.st === 'busy') return this.ui.pop.set({ kind: 'person', p: x.p!, rows: [['Место', x.id + ', ' + ({ А: 'Опенспейс А', Б: 'Опенспейс Б', Т: 'Тихая зона' } as Record<string, string>)[x.z]], ['В офисе', x.till]], ...this.ui.at(el, 320, 230) });
    this.ui.pop.set({ kind: 'seat', id: x.id, ...this.ui.at(el, 320, 300) });
  }
  protected room(r: BkRoom, e: MouseEvent): void {
    e.stopPropagation();
    if (this.ui.dragged()) return;
    if (r.st === 'free') return this.book(r.i);
    const el = (e.currentTarget as HTMLElement).querySelector('.bkrl') ?? (e.currentTarget as HTMLElement);
    this.ui.pop.set({ kind: 'room', i: r.i, ...this.ui.at(el, 320, 300) });
  }
  private book(i: number): void {
    this.s.draft.set({ mode: 'room', room: i });
    this.ui.pop.set(null);
    this.nav.go('bkform');
  }
}
