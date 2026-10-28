import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, signal, untracked } from '@angular/core';
import { personAvatar } from '../../../data/avatar';
import { CAL_INVITE, CAL_LOCS, CAL_MONTHS_GEN, CAL_PEOPLE_AV, CAL_WD, CAL_WDF } from '../../../data/cal.data';
import { plural, shortFio } from '../../../data/org.data';
import { CalEvent, CalRepeat } from '../../../interface/cal';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Float } from '../../../shared/ui/float/float';
import { RichText } from '../../../shared/ui/rich-text/rich-text';
import { Select } from '../../../shared/ui/select/select';
import { Suggest } from '../../../shared/ui/suggest/suggest';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CalState } from '../cal.state';
import { CAL_TODAY, cAdd, cFD, cHM, cHash, cIso, cKey, cMin, cPD, cParse, cWd, calHits, calIsUrl, calPlace, calRepText } from '../cal.utils';

const ME = 'Иванов Павел Сергеевич';
const REP_F: Record<string, string> = { d: 'Ежедневно', wd: 'По рабочим дням', w: 'Еженедельно', m: 'Ежемесячно', y: 'Ежегодно' };
const REP_END: Record<string, string> = { never: 'Никогда', date: 'В дату', cnt: 'После количества повторений' };
const REMIND = ['Без напоминания', 'За 5 минут', 'За 10 минут', 'За 15 минут', 'За 30 минут', 'За 1 час', 'За 1 день'];
const SHOW = ['Занят', 'Свободен', 'Под вопросом', 'Нет на месте'];
/** «9» → 09:00, «930» → 09:30, «9:5» → 09:05, «09.30» → 09:30 */
function tmParse(v: string): string | null {
  const t = String(v || '').trim().replace(/[.,\s-]/g, ':');
  let h: number, m: number;
  if (/^\d{1,2}$/.test(t)) [h, m] = [+t, 0];
  else if (/^\d{3,4}$/.test(t)) [h, m] = [+t.slice(0, -2), +t.slice(-2)];
  else {
    const r = /^(\d{1,2}):(\d{1,2})$/.exec(t);
    if (!r) return null;
    [h, m] = [+r[1], +r[2]];
  }
  return h > 23 || m > 59 ? null : cHM(h * 60 + m);
}

/** Черновик формы (CF прототипа) */
interface Draft {
  id?: string;
  t: string;
  place: string;
  aip: boolean;
  d1: string;
  t1: string;
  d2: string;
  t2: string;
  all: boolean;
  priv: boolean;
  rep: boolean;
  rf: string;
  rn: number;
  rdays: number[];
  rdow: boolean;
  rend: 'never' | 'date' | 'cnt';
  ru: string;
  rc: number;
  remind: string;
  show: string;
  desc: string;
  ppl: string[];
  col: string;
  adv: boolean;
}

/**
 * Сайдбар «Новая встреча» / «Изменить встречу»: название, начало и конец, место или ссылка, описание,
 * дополнительные настройки (напоминание, занятость, ИИ-протокол, весь день, личное, повтор),
 * справа — участники и их занятость на шкале дня (клик по часу переносит встречу).
 */
@Component({
  selector: 'app-cal-form',
  imports: [Drawer, Field, DateField, Select, Suggest, RichText, Float, NgTemplateOutlet],
  templateUrl: './cal-form.html',
  styleUrl: './cal-form.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-calform', '(document:click)': 'pk.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalForm {
  protected readonly s = inject(CalState);
  private readonly toast = inject(ToastService);
  protected readonly f = signal<Draft | null>(null);
  protected readonly err = signal('');
  protected readonly times = Array.from({ length: 96 }, (_, i) => cHM(i * 15));
  protected readonly places = CAL_LOCS.filter((x) => x !== 'Другое место' && !/^Онлайн/.test(x));
  protected readonly remindOpts = REMIND;
  protected readonly showOpts = SHOW;
  protected readonly repOpts = Object.values(REP_F);
  protected readonly endOpts = Object.values(REP_END);
  protected readonly repF = REP_F;
  protected readonly repEnd = REP_END;
  protected readonly wd = CAL_WD;
  protected readonly short = shortFio;
  protected readonly me = ME;
  protected readonly av = (n: string) => personAvatar(n, CAL_PEOPLE_AV);
  protected readonly H0 = 8;
  protected readonly H1 = 20;
  protected readonly W = 44;
  protected readonly hours = Array.from({ length: 12 }, (_, i) => i);
  /** список сотрудников для приглашения */
  protected readonly pk = signal<HTMLElement | null>(null);
  protected readonly pq = signal('');

  constructor() {
    effect(() => {
      const o = this.s.form();
      untracked(() => {
        this.err.set('');
        this.f.set(o ? this.draft(o.ev, o.d, o.s) : null);
      });
    });
  }

  private draft(e?: CalEvent, d?: Date, s?: number): Draft {
    const st = s != null ? s : e ? e.s : 600;
    if (e) {
      const r = e.rep, ed = cParse(e.d);
      return {
        id: e.id, t: e.t, place: calPlace(e), aip: !!e.aip, d1: cFD(ed), t1: cHM(e.s || 600), d2: cFD(ed), t2: cHM(e.e || 660), all: !!e.all, priv: !!e.priv,
        rep: !!r, rf: r ? r.f : 'w', rn: r?.n || 1, rdays: r?.days ? [...r.days] : [cWd(ed)], rdow: !!r?.dow, rend: r?.until ? 'date' : r?.cnt ? 'cnt' : 'never',
        ru: r?.until ? cFD(cParse(r.until)) : '', rc: r?.cnt || 10, remind: e.remind || 'За 15 минут', show: e.show || 'Занят', desc: e.desc || '',
        ppl: e.ppl.filter((n) => n !== ME), col: e.col || 'blue', adv: !!(e.all || e.priv || e.rep || e.aip),
      };
    }
    const day = d || CAL_TODAY;
    return {
      t: '', place: '', aip: false, d1: cFD(day), t1: cHM(st), d2: cFD(day), t2: cHM(st + 60), all: false, priv: false, rep: false, rf: 'w', rn: 1,
      rdays: [cWd(day)], rdow: false, rend: 'never', ru: '', rc: 10, remind: 'За 15 минут', show: 'Занят', desc: '', ppl: [], col: 'blue', adv: false,
    };
  }
  protected set<K extends keyof Draft>(k: K, v: Draft[K]): void {
    this.f.update((x) => (x ? { ...x, [k]: v } : x));
  }
  protected val = (e: Event) => (e.target as HTMLInputElement).value;

  /** дата начала */
  protected readonly day = computed(() => cPD(this.f()?.d1 || '') || CAL_TODAY);
  protected readonly advSum = computed(() => {
    const f = this.f()!;
    return [f.aip && 'ИИ-протокол', f.all && 'весь день', f.priv && 'личное', f.rep && 'повтор', f.remind !== 'За 15 минут' && f.remind.toLowerCase(), f.show !== 'Занят' && f.show.toLowerCase()]
      .filter(Boolean)
      .join(' · ');
  });
  /** повтор из черновика — для подписи «Каждую неделю по ср» */
  protected readonly repeat = computed<CalRepeat>(() => {
    const f = this.f()!, ru = cPD(f.ru);
    return { f: f.rf, n: +f.rn || 1, days: f.rdays, dow: f.rdow, until: f.rend === 'date' && ru ? cIso(ru) : null, cnt: f.rend === 'cnt' ? +f.rc : 0 };
  });
  protected readonly repText = computed(() => calRepText(this.repeat(), this.day()));
  protected readonly unit = computed(() => ({ d: ['день', 'дня', 'дней'], w: ['неделю', 'недели', 'недель'], m: ['месяц', 'месяца', 'месяцев'] })[this.f()!.rf as 'd']);
  protected readonly unitWord = computed(() => {
    const u = this.unit(), n = +this.f()!.rn || 1;
    return u ? plural(n, u[0], u[1], u[2]) : '';
  });
  protected readonly nth = computed(() => ['первый', 'второй', 'третий', 'четвертый', 'пятый'][Math.ceil(this.day().getDate() / 7) - 1] + ' ' + CAL_WDF[cWd(this.day())].toLowerCase());
  protected readonly yearly = computed(() => this.day().getDate() + ' ' + CAL_MONTHS_GEN[this.day().getMonth()]);

  // ——— участники и занятость ———
  protected readonly people = computed(() => [ME, ...this.f()!.ppl]);
  /** занятость человека в день: [начало, конец, под вопросом] */
  private busy(name: string, d: Date): [number, number, boolean][] {
    const id = this.f()?.id, ev = this.s.events();
    if (name === ME)
      return this.s
        .day(d)
        .filter((o) => !o.ev.all && o.ev.my !== 'no' && o.ev.id !== id)
        .map((o) => [o.ev.s, o.ev.e, o.ev.my === 'maybe']);
    const own: [number, number, boolean][] = ev.filter((e) => e.id !== id && !e.all && (e.org === name || e.ppl.includes(name)) && calHits(e, d)).map((e) => [e.s, e.e, false]);
    const h = cHash(name + cKey(d)), n = d.getDay() % 6 === 0 ? 0 : 1 + Math.floor(h * 3);
    for (let i = 0; i < n; i++) {
      const s = (9 + Math.floor(cHash(name + i + cKey(d)) * 9)) * 60 + (cHash(name + i) < 0.5 ? 0 : 30);
      own.push([s, s + (cHash(name + i + 'd') < 0.5 ? 60 : 90), cHash(name + i + 'm') < 0.25]);
    }
    return own;
  }
  protected readonly lanes = computed(() => {
    const f = this.f()!, d = this.day(), H0 = this.H0, H1 = this.H1, x = (m: number) => (m / 60 - H0) * this.W;
    const s = cMin(f.t1), e = f.d1 === f.d2 ? cMin(f.t2) : 24 * 60;
    const rows = this.people().map((n) => {
      const B = this.busy(n, d);
      return {
        n, conf: !f.all && B.some((b) => b[0] < e && b[1] > s),
        blocks: B.filter((b) => b[1] > H0 * 60 && b[0] < H1 * 60).map((b) => ({
          left: x(Math.max(b[0], H0 * 60)), width: x(Math.min(b[1], H1 * 60)) - x(Math.max(b[0], H0 * 60)) - 2, mb: b[2],
          title: (b[2] ? 'Под вопросом' : 'Занят') + ' ' + cHM(b[0]) + '–' + cHM(b[1]),
        })),
      };
    });
    const band = f.all ? null : { left: x(Math.max(s, H0 * 60)), width: Math.max(4, x(Math.min(e, H1 * 60)) - x(Math.max(s, H0 * 60))) };
    return { rows, band, conf: rows.filter((r) => r.conf).map((r) => r.n) };
  });
  protected readonly dayLabel = computed(() => cFD(this.day()) + (cKey(this.day()) === cKey(CAL_TODAY) ? ' (сегодня)' : ''));
  protected readonly confText = computed(() => {
    const c = this.lanes().conf;
    return 'В это время ' + (c.length === 1 ? 'занят ' : 'заняты ') + c.map((n) => (n === ME ? 'вы' : shortFio(n))).join(', ') + '. Нажмите на свободный час в шкале, чтобы перенести встречу.';
  });
  protected readonly invite = computed(() => {
    const q = this.pq().toLowerCase();
    return CAL_INVITE.filter((n) => n.toLowerCase().includes(q));
  });

  // ——— действия ———
  protected setT1(v: string): void {
    const t = tmParse(v), f = this.f()!;
    if (t == null) return this.set('t1', f.t1);
    const du = cMin(f.t2) - cMin(f.t1);
    this.f.set({ ...f, t1: t, t2: f.d1 === f.d2 ? cHM(Math.min(23 * 60 + 45, cMin(t) + Math.max(15, du))) : f.t2 });
  }
  protected setT2(v: string): void {
    const t = tmParse(v);
    this.set('t2', t ?? this.f()!.t2);
  }
  protected gen(): void {
    this.set('place', 'https://teams.diasoft.ru/meet/' + Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 8));
    this.toast.show('Ссылка создана', 'Ссылка на видеовстречу добавлена в приглашение.');
  }
  protected toggleDay(i: number): void {
    const d = this.f()!.rdays;
    this.set('rdays', d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort());
  }
  protected setEnd(v: string): void {
    const k = (Object.keys(REP_END) as Draft['rend'][]).find((x) => REP_END[x] === v)!;
    this.f.update((f) => (f ? { ...f, rend: k, ru: k === 'date' && !f.ru ? cFD(cAdd(this.day(), 90)) : f.ru } : f));
  }
  protected setRf(v: string): void {
    this.set('rf', Object.keys(REP_F).find((k) => REP_F[k] === v)!);
  }
  /** клик по шкале — перенос встречи на этот час */
  protected moveTo(e: MouseEvent): void {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect(), h = this.H0 + Math.floor((e.clientX - r.left) / this.W), f = this.f()!;
    const du = cMin(f.t2) - cMin(f.t1);
    this.f.set({ ...f, t1: cHM(h * 60), d2: f.d1, t2: cHM(h * 60 + Math.max(15, du)) });
  }
  protected removePerson(n: string): void {
    this.set('ppl', this.f()!.ppl.filter((x) => x !== n));
  }
  protected togglePerson(n: string): void {
    const p = this.f()!.ppl;
    this.set('ppl', p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);
  }
  protected openPk(e: MouseEvent): void {
    e.stopPropagation();
    if (this.pk()) return this.pk.set(null);
    this.pq.set('');
    this.pk.set(e.currentTarget as HTMLElement);
  }

  protected close(): void {
    this.s.form.set(null);
  }
  protected save(): void {
    const f = this.f()!, a = cPD(f.d1), z = cPD(f.d2), err = (t: string) => this.err.set(t);
    if (!f.t.trim()) return err('Введите наименование встречи.');
    if (!a || !z) return err('Укажите даты начала и конца в формате дд.мм.гггг.');
    const s = cMin(f.t1), e = cMin(f.t2);
    if (z < a || (!f.all && +z === +a && e <= s)) return err('Конец встречи должен быть позже начала.');
    if (f.rep && f.rf === 'w' && !f.rdays.length) return err('Выберите хотя бы один день недели для повтора.');
    const ru = cPD(f.ru);
    if (f.rep && f.rend === 'date' && (!ru || ru < a)) return err('Дата окончания повтора должна быть позже начала встречи.');
    const url = calIsUrl(f.place);
    const ev: Omit<CalEvent, 'id'> = {
      t: f.t.trim(), d: cIso(a), s: f.all ? 0 : s, e: f.all ? 0 : +z === +a ? e : 24 * 60 - 1, all: f.all ? 1 : 0, loc: url ? '' : (f.place || '').trim(), link: url ? f.place.trim() : '',
      aip: f.aip ? 1 : 0, org: ME, ppl: [...f.ppl], my: 'yes', col: f.col || 'blue', priv: f.priv ? 1 : 0, rep: f.rep ? this.repeat() : null, remind: f.remind, show: f.show,
      desc: f.desc.replace(/<[^>]+>/g, ' ').trim() ? f.desc : '',
    };
    const id = f.id || 'e' + Date.now();
    if (f.id) this.s.update(f.id, ev);
    else this.s.events.update((l) => [...l, { id, ...ev }]);
    this.s.d.set(a);
    if (this.s.view() === 'wweek' && a.getDay() % 6 === 0) this.s.view.set('week');
    this.s.flash(id);
    this.close();
    const n = f.ppl.length;
    this.toast.show('Готово', (f.id ? 'Изменения сохранены.' : 'Встреча «' + ev.t + '» создана.') + (n ? ' Приглашения отправлены ' + n + ' ' + plural(n, 'участнику', 'участникам', 'участникам') + '.' : ''));
  }
}
