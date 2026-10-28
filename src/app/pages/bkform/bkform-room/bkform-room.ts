import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, output, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BookingStore } from '../../../core/demo/booking.service';
import { BK_EQ, BK_EQ_ICONS, BK_TS, BK_USER_ICON, BK_WD, bkAddDays, bkDates, bkMin, bkPD, bkRepL, bkWd } from '../../../data/booking.data';
import { plural } from '../../../data/org.data';
import { ME, PEOPLE } from '../../../data/people.data';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { BkSum } from '../bkform-desk/bkform-desk';

/**
 * Блок «Бронирование переговорной»: переговорная (вместимость, оборудование), тема, дата и время
 * с полосой занятости дня, участники, повтор; итог и проверка пересечений.
 */
@Component({
  selector: '[bkform-room]',
  imports: [Field, Select, DateField],
  templateUrl: './bkform-room.html',
  encapsulation: ViewEncapsulation.None,
  host: { '(document:click)': 'pick.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BkformRoom {
  protected readonly s = inject(BookingStore);
  private readonly san = inject(DomSanitizer);
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly saved = output<string>();
  protected readonly user = this.san.bypassSecurityTrustHtml(BK_USER_ICON);
  protected readonly eqIcon = (e: string) => this.san.bypassSecurityTrustHtml(BK_EQ_ICONS[BK_EQ.indexOf(e)]);
  protected readonly wd = BK_WD;
  protected readonly fromOpts = BK_TS.slice(0, -1);
  protected readonly toOpts = BK_TS.slice(1);
  protected readonly reps = ['Не повторять', 'Каждый рабочий день', 'По выбранным дням'];
  protected readonly people = PEOPLE.filter((q) => q[0] !== ME[0]).map((q) => q[0]);
  protected readonly capText = (n: number) => `до ${n} ${plural(n, 'человека', 'человек', 'человек')}`;

  protected readonly room = signal(0);
  protected readonly topic = signal('');
  protected readonly d1 = signal(this.s.date());
  protected readonly d2 = signal('');
  protected readonly from = signal('10:00');
  protected readonly to = signal('11:00');
  protected readonly ppl = signal<string[]>([]);
  protected readonly rep = signal('Не повторять');
  protected readonly days = signal([1, 1, 1, 1, 1, 0, 0]);
  protected readonly err = signal('');
  /** список выбора участников */
  protected readonly pick = signal<{ left: number; top: number } | null>(null);
  protected readonly pq = signal('');

  constructor() {
    const R = this.s.rooms(), want = this.s.draft().room;
    const r = R[want ?? (R.find((x) => x.st === 'free') || R[0]).i];
    this.room.set(r.i);
    if (r.st !== 'free') {
      const e = r.t!.split(' – ')[1];
      this.from.set(e);
      this.to.set(BK_TS[Math.min(BK_TS.length - 1, BK_TS.indexOf(e) + 2)]);
    }
  }

  private readonly dayCtx = computed(() => ({ office: this.s.office(), floor: this.s.floor(), date: bkPD(this.d1()) ? this.d1() : this.s.date() }));
  protected readonly rooms = computed(() => this.s.roomsAt(this.dayCtx()));
  protected readonly r = computed(() => this.rooms()[this.room()]);
  protected readonly roomNames = computed(() => this.rooms().map((x) => x.no + ' ' + x.n));
  protected readonly per = computed(() => this.rep() !== 'Не повторять');
  private busyAt(d: string) {
    const r = this.s.roomsAt({ office: this.s.office(), floor: this.s.floor(), date: d })[this.room()];
    return r.st === 'free' ? null : { t: r.t!, a: bkMin(r.t!), b: bkMin(r.t!.split(' – ')[1]), topic: r.topic };
  }
  /** занятость выбранного дня и выбор на шкале 08:00–20:00 */
  protected readonly line = computed(() => {
    const bz = this.busyAt(this.dayCtx().date), pos = (m: number) => Math.max(0, Math.min(100, ((m - 480) / 720) * 100));
    const a = bkMin(this.from()), b = bkMin(this.to());
    return {
      bz: bz ? { left: pos(bz.a), width: pos(bz.b) - pos(bz.a), t: bz.t } : null,
      sel: b > a ? { left: pos(a), width: pos(b) - pos(a), cf: !!bz && a < bz.b && b > bz.a } : null,
      note: bz ? 'Занято ' + bz.t + (bz.topic ? ', ' + bz.topic : '') : 'Весь день свободна',
    };
  });
  private readonly dates = computed(() => bkDates({ type: this.per() ? 'per' : 'day', d1: this.d1(), d2: this.d2(), days: this.days() }));
  protected readonly sum = computed<BkSum>(() => {
    const ds = this.dates(), a = bkMin(this.from()), b = bkMin(this.to()), r = this.r();
    if (!ds.length) return { text: this.per() ? 'Нет дат под выбранные условия. Проверьте дату окончания и дни недели.' : 'Укажите дату в формате дд.мм.гггг.' };
    const cf = ds.filter((d) => { const z = this.busyAt(d); return !!z && a < z.b && b > z.a; });
    return {
      b1: `${r.no} ${r.n}`,
      text: `, ${this.from()} – ${this.to()}`,
      b2: '',
      tail: ds.length === 1 ? `${ds[0]}, ${BK_WD[bkWd(bkPD(ds[0])!)].toLowerCase()}`
        : `${ds.length} ${plural(ds.length, 'встреча', 'встречи', 'встреч')}: ${bkRepL({ days: this.days() })}, с ${ds[0].slice(0, 5)} по ${ds[ds.length - 1]}`,
      cf: cf.length && ds.length > 1 ? `В ${cf.length} ${plural(cf.length, 'дату', 'даты', 'дат')} переговорная занята в это время. Эти даты будут пропущены.` : '',
    };
  });

  protected setRoom(name: string): void { this.room.set(this.rooms().findIndex((x) => x.no + ' ' + x.n === name)); }
  protected setFrom(x: string): void {
    this.from.set(x);
    if (bkMin(this.to()) <= bkMin(x)) this.to.set(BK_TS[Math.min(BK_TS.length - 1, BK_TS.indexOf(x) + 2)]);
  }
  protected setRep(x: string): void {
    this.rep.set(x);
    if (x === 'Каждый рабочий день') this.days.set([1, 1, 1, 1, 1, 0, 0]);
    if (x !== 'Не повторять' && !this.d2()) this.d2.set(bkAddDays(this.d1(), 27, this.s.date()));
  }
  protected flipDay(i: number): void {
    const d = [...this.days()];
    d[i] = d[i] ? 0 : 1;
    this.days.set(d);
    this.rep.set(d.join('') === '1111100' ? 'Каждый рабочий день' : 'По выбранным дням');
  }
  protected short = (n: string) => n.split(' ').slice(0, 2).join(' ');
  protected openPick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.pick()) return this.pick.set(null);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.pq.set('');
    this.pick.set({ left: r.left, top: r.bottom + 6 });
  }
  protected togglePerson(n: string): void {
    const v = this.ppl();
    this.ppl.set(v.includes(n) ? v.filter((x) => x !== n) : [...v, n]);
  }
  protected readonly pickList = computed(() => {
    const f = this.pq().toLowerCase();
    return this.people.filter((n) => n.toLowerCase().includes(f));
  });

  save(): boolean {
    const ds = this.dates(), a = bkMin(this.from()), b = bkMin(this.to()), r = this.r();
    this.err.set('');
    if (b <= a) return this.fail('Время окончания должно быть позже начала.');
    if (!ds.length) return this.fail(this.per() ? 'Укажите дату окончания и хотя бы один день недели.' : 'Укажите дату в формате дд.мм.гггг.');
    const ok = ds.filter((d) => { const z = this.busyAt(d); return !(z && a < z.b && b > z.a); });
    if (!ok.length) return this.fail(`Переговорная занята ${this.busyAt(ds[0])!.t}. Выберите другое время или переговорную.`);
    ok.forEach((d) => this.s.bookRoom({ office: this.s.office(), floor: this.s.floor(), date: d }, this.room(), { t: this.from() + ' – ' + this.to(), topic: this.topic().trim(), ppl: [...this.ppl()] }));
    this.s.date.set(ok[0]);
    this.saved.emit(`Переговорная ${r.no} ${r.n} забронирована: ${ok.length === 1 ? ok[0] : ok.length + ' ' + plural(ok.length, 'встреча', 'встречи', 'встреч') + ', ' + bkRepL({ days: this.days() })}, ${this.from()} – ${this.to()}.`);
    return true;
  }
  private fail(t: string): boolean { this.err.set(t); return false; }
}
