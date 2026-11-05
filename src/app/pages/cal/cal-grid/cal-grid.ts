import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, computed, effect, inject, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CAL_H0, CAL_H1, CAL_HH, CAL_MY } from '../../../data/cal.data';
import { CalEvent } from '../../../interface/cal';
import { CalQuick } from '../cal-quick/cal-quick';
import { calTime } from '../cal-time/cal-time';
import { CalState } from '../cal.state';
import { CAL_TODAY, cAdd, cHM, cKey, cWdShort } from '../cal.utils';

/** Встреча в сетке дня: колонка при пересечениях и их число */
interface Placed {
  ev: CalEvent;
  c: number;
  n: number;
}

/**
 * Сетка дня / недели: шапка дней (клик — открыть день), часы 7–22 и встречи (как в Outlook: без скруглений,
 * принятые — заливкой, под вопросом — штриховкой). Пересекающиеся встречи делят колонку. Клик по встрече — краткая информация (cal-pop), двойной — полная форма на просмотр (eventnew).
 * Клик по пустому месту — выделенный получасовой интервал и окно быстрого создания (cal-quick). Линия текущего времени с подписью в шкале часов.
 */
@Component({
  selector: '[cal-grid]',
  imports: [NgTemplateOutlet, CalQuick],
  templateUrl: './cal-grid.html',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ctg', '[style.--nd]': 'days().length' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalGrid implements AfterViewInit {
  protected readonly s = inject(CalState);
  readonly pick = output<{ ev: CalEvent; d: Date; el: HTMLElement }>();
  private readonly sc = viewChild<ElementRef<HTMLElement>>('sc');
  protected readonly HH = CAL_HH;
  protected readonly H0 = CAL_H0;
  protected readonly hours = Array.from({ length: CAL_H1 - CAL_H0 }, (_, i) => i);
  protected readonly hm = cHM;
  protected readonly wd = cWdShort;
  /** дата в шапке дня с месяцем: «30.09» */
  protected readonly dm = (d: Date) => String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
  protected readonly key = cKey;
  protected readonly todayKey = cKey(CAL_TODAY);
  protected readonly my = CAL_MY;

  protected readonly days = computed(() => {
    const [a, z] = this.s.range(), out: Date[] = [];
    for (let d = new Date(a); d <= z; d = cAdd(d, 1)) out.push(new Date(d));
    return out;
  });
  protected readonly cols = computed(() =>
    this.days().map((d) => {
      const L = this.s.day(d).sort((x, y) => x.ev.s - y.ev.s || y.ev.e - x.ev.e);
      const ends: number[] = [], P: Placed[] = [];
      L.forEach((o) => {
        let c = ends.findIndex((end) => end <= o.ev.s);
        if (c < 0) {
          c = ends.length;
          ends.push(0);
        }
        ends[c] = o.ev.e;
        P.push({ ev: o.ev, c, n: 1 });
      });
      P.forEach((o) => (o.n = Math.max(...P.filter((x) => x.ev.s < o.ev.e && x.ev.e > o.ev.s).map((x) => x.c)) + 1));
      return P;
    }),
  );
  /** текущее время (минуты), обновляется раз в минуту */
  protected readonly nowM = signal(this.minutes());
  /** линия «сейчас»: только если сегодня в видимом периоде и время в пределах шкалы */
  protected readonly nowTop = computed(() => {
    const m = this.nowM(), [a, z] = this.s.range();
    return CAL_TODAY >= a && CAL_TODAY <= z && m > CAL_H0 * 60 && m < CAL_H1 * 60 ? ((m - CAL_H0 * 60) / 60) * CAL_HH : null;
  });
  protected readonly upToToday = (d: Date) => +d <= +CAL_TODAY;
  protected readonly q = this.s.quick;
  private readonly selRef = viewChild<ElementRef<HTMLElement>>('sel');
  protected readonly selEl = computed(() => this.selRef()?.nativeElement ?? null);
  protected readonly tip = (e: CalEvent) => e.t + ', ' + calTime(e) + ' · ' + this.my[e.my];

  private minutes(): number {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }

  constructor() {
    const t = setInterval(() => this.nowM.set(this.minutes()), 60000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
    // прокрутка к найденной встрече или к 8:00
    effect(() => {
      const hit = this.s.events().find((e) => e.id === this.s.hit()), el = this.sc()?.nativeElement;
      if (el) el.scrollTop = ((hit ? hit.s / 60 - 1 : 8) - CAL_H0) * CAL_HH;
    });
  }
  ngAfterViewInit(): void {
    const el = this.sc()?.nativeElement;
    if (el) el.scrollTop = (8 - CAL_H0) * CAL_HH;
  }

  protected top(e: CalEvent): number {
    return ((e.s - CAL_H0 * 60) / 60) * CAL_HH;
  }
  protected h(e: CalEvent): number {
    return Math.max(20, ((e.e - e.s) / 60) * CAL_HH - 2);
  }
  protected openDay(d: Date): void {
    this.s.d.set(d);
    this.s.view.set('day');
  }
  /** клик — выделить встречу и показать краткую информацию */
  protected onEvent(ev: CalEvent, d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.s.quick.set(null);
    this.s.sel.set(ev.id);
    this.pick.emit({ ev, d, el: e.currentTarget as HTMLElement });
  }
  /** двойной клик — полная форма встречи на просмотр */
  protected onFull(ev: CalEvent, d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.s.preview(ev, d);
  }
  /** клик по пустому месту колонки — выделить получасовой интервал и открыть быстрое создание */
  protected onCol(d: Date, e: MouseEvent): void {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const s = Math.floor((((e.clientY - r.top) / CAL_HH) * 60 + CAL_H0 * 60) / 30) * 30;
    this.s.sel.set(null);
    this.s.quick.set({ d, s, e: s + 30 });
  }
}
