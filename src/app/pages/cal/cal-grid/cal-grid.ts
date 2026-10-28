import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, effect, inject, output, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CAL_H0, CAL_H1, CAL_HH, CAL_MY } from '../../../data/cal.data';
import { CalEvent } from '../../../interface/cal';
import { CalState } from '../cal.state';
import { CAL_TODAY, cAdd, cDur, cHM, cKey, cWdShort } from '../cal.utils';

/** Встреча в сетке дня: колонка при пересечениях и их число */
interface Placed {
  ev: CalEvent;
  c: number;
  n: number;
}

/**
 * Сетка дня / недели: шапка дней (клик — открыть день), строка «Весь день», часы 7–22 и встречи.
 * Пересекающиеся встречи делят колонку. Клик по пустому месту — новая встреча на это время.
 */
@Component({
  selector: '[cal-grid]',
  imports: [NgTemplateOutlet],
  templateUrl: './cal-grid.html',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ctg', '[style.--nd]': 'days().length' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalGrid implements AfterViewInit {
  protected readonly s = inject(CalState);
  readonly pick = output<{ ev: CalEvent; d: Date; el: HTMLElement }>();
  readonly create = output<{ d: Date; s: number }>();
  private readonly sc = viewChild<ElementRef<HTMLElement>>('sc');
  protected readonly HH = CAL_HH;
  protected readonly H0 = CAL_H0;
  protected readonly hours = Array.from({ length: CAL_H1 - CAL_H0 }, (_, i) => i);
  protected readonly hm = cHM;
  protected readonly wd = cWdShort;
  protected readonly key = cKey;
  protected readonly todayKey = cKey(CAL_TODAY);
  protected readonly my = CAL_MY;

  protected readonly days = computed(() => {
    const [a, z] = this.s.range(), out: Date[] = [];
    for (let d = new Date(a); d <= z; d = cAdd(d, 1)) out.push(new Date(d));
    return out;
  });
  protected readonly allDay = computed(() => this.days().map((d) => this.s.day(d).filter((o) => o.ev.all)));
  protected readonly cols = computed(() =>
    this.days().map((d) => {
      const L = this.s.day(d).filter((o) => !o.ev.all).sort((x, y) => x.ev.s - y.ev.s || y.ev.e - x.ev.e);
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
  /** линия «сейчас» */
  protected readonly nowM = (() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  })();

  constructor() {
    // прокрутка к найденной встрече или к 8:00
    effect(() => {
      const hit = this.s.events().find((e) => e.id === this.s.hit()), el = this.sc()?.nativeElement;
      if (el) el.scrollTop = ((hit && !hit.all ? hit.s / 60 - 1 : 8) - CAL_H0) * CAL_HH;
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
  protected time(e: CalEvent): string {
    return this.h(e) < 40 ? cHM(e.s) : cHM(e.s) + '–' + cHM(e.e) + ' · ' + cDur(e.e - e.s);
  }
  protected openDay(d: Date): void {
    this.s.d.set(d);
    this.s.view.set('day');
  }
  protected onEvent(ev: CalEvent, d: Date, e: MouseEvent): void {
    e.stopPropagation();
    this.pick.emit({ ev, d, el: e.currentTarget as HTMLElement });
  }
  /** клик по пустому месту колонки — новая встреча на ближайшие полчаса */
  protected onCol(d: Date, e: MouseEvent): void {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.create.emit({ d, s: Math.floor((((e.clientY - r.top) / CAL_HH) * 60 + CAL_H0 * 60) / 30) * 30 });
  }
}
