import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, output, signal } from '@angular/core';
import { BookingStore } from '../../../core/demo/booking.service';
import { BK_CITY, BK_FEAT, BK_WD, BK_ZN, bkAddDays, bkDates, bkPD, bkRepL, bkWd } from '../../../data/booking.data';
import { plural } from '../../../data/org.data';
import { ME, ME_PHOTO, PEOPLE, avCls } from '../../../data/people.data';
import { BkSeat } from '../../../interface/booking';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';

/** итог формы: [pre]<b>b1</b>text<br><b>b2</b>tail, cf — предупреждение о конфликтах */
export interface BkSum { pre?: string; b1?: string; text: string; b2?: string; tail?: string; cf?: string; }

/**
 * Блок «Бронирование места»: сотрудник, город/филиал, этаж/помещение, место (оснащение и соседи),
 * один день или период с повтором по дням недели, итог и проверка конфликтов.
 */
@Component({
  selector: '[bkform-desk]',
  imports: [Field, Select, DateField, NgTemplateOutlet],
  templateUrl: './bkform-desk.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BkformDesk {
  private readonly s = inject(BookingStore);
  /** успешное сохранение: текст уведомления */
  readonly saved = output<string>();
  protected readonly avCls = avCls;
  protected readonly mePhoto = ME_PHOTO;
  protected readonly zn = BK_ZN;
  protected readonly wd = BK_WD;
  protected readonly cities = Object.keys(BK_CITY);
  protected readonly floorsL = ['1 этаж', '2 этаж', '3 этаж', '4 этаж'];
  protected readonly zones = Object.values(BK_ZN);
  protected readonly reps = ['Каждый рабочий день', 'Каждый день', 'По выбранным дням'];
  protected readonly emps = [ME[0] + ' (вы)', ...PEOPLE.map((p) => p[0]).filter((n) => n !== ME[0])];
  protected readonly feats = (f: boolean[]) => BK_FEAT.filter((_, i) => f[i]);

  // ——— поля формы ———
  protected readonly emp = signal(ME[0]);
  protected readonly city = signal(this.s.city());
  protected readonly office = signal(this.s.office());
  protected readonly floor = signal(this.s.floor());
  protected readonly zone = signal('А');
  protected readonly seat = signal('');
  protected readonly type = signal<'day' | 'per'>('day');
  protected readonly d1 = signal(this.s.date());
  protected readonly d2 = signal('');
  protected readonly days = signal([1, 1, 1, 1, 1, 0, 0]);
  protected readonly rep = signal('Каждый рабочий день');
  protected readonly swap = signal(true);
  protected readonly err = signal('');

  constructor() {
    const S = this.s.seats(), want = this.s.draft().seat;
    const x = S.find((y) => y.id === want && y.st === 'free') || S.find((y) => y.st === 'free') || S[0];
    this.zone.set(x.z);
    this.seat.set(x.id);
  }

  private readonly ctxSeats = computed(() =>
    this.s.seatsAt({ office: this.office(), floor: this.floor(), date: bkPD(this.d1()) ? this.d1() : this.s.date() }),
  );
  protected readonly s_offices = computed(() => BK_CITY[this.city()]);
  protected readonly freeIds = computed(() => this.free().map((x) => x.id));
  protected readonly free = computed(() => this.ctxSeats().filter((x) => x.z === this.zone() && x.st === 'free'));
  /** выбранное место (если занято — первое свободное в помещении) */
  protected readonly cur = computed<BkSeat | undefined>(() => {
    const f = this.free();
    return f.find((x) => x.id === this.seat()) ?? f[0];
  });
  protected readonly near = computed(() => {
    const x = this.cur();
    return x ? this.ctxSeats().filter((y) => y.c === x.c && y !== x && y.st !== 'free') : [];
  });
  protected readonly dates = computed(() => bkDates({ type: this.type(), d1: this.d1(), d2: this.d2(), days: this.days() }));

  /** итог под формой */
  protected readonly sum = computed<BkSum>(() => {
    const x = this.cur(), ds = this.dates();
    if (!x) return { pre: '', b1: '', b2: '', tail: '', cf: '', text: 'Выберите другое помещение или дату: здесь нет свободных мест.' };
    if (this.type() === 'day')
      return ds.length
        ? { pre: 'Место ', b1: x.id, text: `, ${BK_ZN[this.zone()]}, ${this.floor()} этаж`, b2: ds[0], tail: `, ${BK_WD[bkWd(bkPD(ds[0])!)].toLowerCase()}, весь день` }
        : { text: 'Укажите дату в формате дд.мм.гггг.' };
    if (!ds.length) return { text: 'Нет дат под выбранные условия. Проверьте период и дни недели.' };
    const cf = ds.filter((d) => this.s.seatsAt({ office: this.office(), floor: this.floor(), date: d }).find((y) => y.id === x.id)?.st === 'busy');
    return {
      pre: 'Будет создано ',
      b1: `${ds.length} ${plural(ds.length, 'бронирование', 'бронирования', 'бронирований')}`,
      text: ` места ${x.id}: ${bkRepL({ days: this.days() })}, с ${ds[0].slice(0, 5)} по ${ds[ds.length - 1]}.`,
      cf: cf.length
        ? `В ${cf.length} ${plural(cf.length, 'дату', 'даты', 'дат')} место уже занято: ${cf.slice(0, 4).map((d) => d.slice(0, 5)).join(', ')}${cf.length > 4 ? ' и еще ' + (cf.length - 4) : ''}` +
          (this.swap() ? '. На эти дни забронируем соседнее свободное место.' : '. Эти даты будут пропущены.')
        : '',
    };
  });

  protected who = (y: BkSeat) => (y.st === 'mine' ? ME : y.p!);
  protected setCity(c: string): void { this.city.set(c); this.office.set(BK_CITY[c][0]); this.floor.set(1); }
  protected setZone(name: string): void { this.zone.set(Object.keys(BK_ZN).find((k) => BK_ZN[k] === name)!); }
  protected setType(t: 'day' | 'per'): void {
    if (t === this.type()) return;
    this.type.set(t);
    if (t === 'per' && !this.d2()) this.d2.set(bkAddDays(this.d1(), 27, this.s.date()));
  }
  protected setRep(x: string): void {
    if (x === 'Каждый рабочий день') this.days.set([1, 1, 1, 1, 1, 0, 0]);
    if (x === 'Каждый день') this.days.set([1, 1, 1, 1, 1, 1, 1]);
    this.rep.set(x);
  }
  protected flipDay(i: number): void {
    const d = [...this.days()];
    d[i] = d[i] ? 0 : 1;
    this.days.set(d);
    const j = d.join('');
    this.rep.set(j === '1111100' ? 'Каждый рабочий день' : j === '1111111' ? 'Каждый день' : 'По выбранным дням');
  }

  /** «Забронировать»: создать брони на все даты (занятые — соседнее место или пропуск) */
  save(): boolean {
    const x = this.cur(), ds = this.dates();
    this.err.set('');
    if (!x) return this.fail('Выберите место: в этом помещении нет свободных мест на выбранную дату.');
    if (!ds.length) return this.fail(this.type() === 'day' ? 'Укажите дату в формате дд.мм.гггг.' : 'Укажите период и хотя бы один день недели.');
    if (ds.length > 130) return this.fail('Период бронирования — не больше 6 месяцев. Сократите период.');
    let n = 0;
    const per = this.type() === 'day' ? 'весь день' : bkRepL({ days: this.days() });
    ds.forEach((d) => {
      const c = { office: this.office(), floor: this.floor(), date: d }, S = this.s.seatsAt(c);
      let y = S.find((z) => z.id === x.id)!;
      if (y.st === 'busy') {
        if (!this.swap()) return;
        const alt = S.find((z) => z.c === y.c && z.st === 'free') || S.find((z) => z.z === y.z && z.st === 'free');
        if (!alt) return;
        y = alt;
      }
      this.s.bookDesk(c, y.id, { emp: this.emp(), per });
      n++;
    });
    this.s.city.set(this.city()); this.s.office.set(this.office()); this.s.floor.set(this.floor()); this.s.date.set(ds[0]);
    const who = this.emp() === ME[0] ? '' : ' для ' + this.emp();
    this.saved.emit(this.type() === 'day' ? `Место ${x.id} забронировано${who} на ${ds[0]}.`
      : `Место ${x.id} забронировано${who}: ${n} ${plural(n, 'день', 'дня', 'дней')}, ${per}.`);
    return true;
  }
  private fail(t: string): boolean { this.err.set(t); return false; }
}
