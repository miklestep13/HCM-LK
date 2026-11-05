import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { EventsStore, parseDT } from '../../core/demo/events-store.service';
import { ME } from '../../data/people.data';
import { NavService } from '../../core/navigation/nav.service';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { CAL_EVENTS, CAL_MY } from '../../data/cal.data';
import { CalEvent } from '../../interface/cal';
import { CAL_TODAY, cAdd, cFD, cHM, cMon, cParse, calFromForm, calHits } from './cal.utils';

export type CalView = 'day' | 'wweek' | 'week' | 'month';

/**
 * Календарь «Мои встречи»: встречи, вид (день, рабочая неделя, неделя, месяц), текущая дата, фильтр по ответу.
 * Живет все время работы прототипа — созданные встречи и выбранный вид сохраняются при переходах.
 */
@Injectable({ providedIn: 'root' })
export class CalState {
  private readonly nav = inject(NavService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly evs = inject(EventsStore);
  /** мероприятия, для которых встреча-копия уже создана (удаленная или отклоненная копия не возвращается) */
  private readonly copied = new Set<string>();
  /** ответы: Принято, Под вопросом; отклоненные встречи удаляются из календаря; новая встреча (без ответа) — под вопросом */
  readonly events = signal<CalEvent[]>(CAL_EVENTS.filter((e) => e.my !== 'no').map((e) => ({ ...e, ppl: [...e.ppl], my: e.my === 'none' || !e.my ? 'maybe' : e.my, priv: 0 })));
  readonly view = signal<CalView>('wweek');
  readonly d = signal(new Date(CAL_TODAY));
  /** подсвеченная встреча (после поиска или сохранения) */
  readonly hit = signal<string | null>(null);
  /** фильтр по ответу */
  readonly st = signal<Record<string, boolean>>({ yes: true, maybe: true });
  readonly opened = signal(false);
  /** выбранная встреча (клик) */
  readonly sel = signal<string | null>(null);
  /** быстрое создание: выделенный интервал (день, начало и конец в минутах, весь день) */
  readonly quick = signal<{ d: Date; s: number; e: number; all?: boolean } | null>(null);

  /** границы видимого периода */
  readonly range = computed<[Date, Date]>(() => {
    const d = this.d(), v = this.view();
    if (v === 'day') return [d, d];
    if (v === 'month') {
      const s = cMon(new Date(d.getFullYear(), d.getMonth(), 1));
      return [s, cAdd(s, 41)];
    }
    const m = cMon(d);
    return [m, cAdd(m, v === 'wweek' ? 4 : 6)];
  });

  /** встречи дня (без скрытых фильтром ответов) */
  day(d: Date): { ev: CalEvent; d: Date }[] {
    const st = this.st();
    return this.events()
      .filter((e) => calHits(e, d) && st[e.my === 'none' || !e.my ? 'maybe' : e.my] !== false)
      .map((ev) => ({ ev, d }));
  }
  constructor() {
    this.copyEvents();
    effect(() => {
      this.evs.list();
      untracked(() => this.copyEvents());
    });
  }
  /**
   * Мероприятия → встречи календаря: при появлении мероприятия создается его копия-встреча без обложки (id «ev-<id мероприятия>»).
   * Дальше копия живет сама по себе: ответы, правка, удаление — как у обычной встречи.
   */
  private copyEvents(): void {
    const add: CalEvent[] = [];
    for (const c of this.evs.list()) {
      const id = 'ev-' + c.id, f = this.evs.formOf(c.id);
      if (this.copied.has(id) || !f || !parseDT(f.date, f.time)) continue;
      this.copied.add(id);
      const org = f.people.find((p) => p.role === 'Организатор')?.n || ME[0];
      const ev = calFromForm(f, { id, org, my: org === ME[0] ? 'yes' : 'maybe', col: 'blue', rep: null } as CalEvent, ME[0]);
      // нет окончания — час
      if (!f.endDate || !f.endTime) ev.e = Math.min(ev.s + 60, 24 * 60 - 1);
      add.push(ev);
    }
    if (add.length) this.events.update((l) => [...l, ...add]);
  }
  /** встреча-копия мероприятия; нет (удалена, отклонена) — null */
  copyOf(evId: string): CalEvent | null {
    return this.events().find((e) => e.id === 'ev-' + evId) ?? null;
  }
  /** открыть встречу-копию мероприятия (виджет «Мероприятия»); false — копии нет */
  openCopy(evId: string): boolean {
    const e = this.copyOf(evId);
    if (e) this.preview(e, cParse(e.d));
    return !!e;
  }
  shift(n: number): void {
    const d = this.d(), v = this.view();
    this.d.set(v === 'day' ? cAdd(d, n) : v === 'month' ? new Date(d.getFullYear(), d.getMonth() + n, 1) : cAdd(d, 7 * n));
  }
  /** подсветить встречу на 2,6 с */
  flash(id: string): void {
    this.hit.set(id);
    setTimeout(() => this.hit() === id && this.hit.set(null), 2600);
  }
  /** полная форма встречи — страница eventnew (тип «Встреча», возврат в календарь): новая с введенными данными */
  create(p: { d: Date; s: number; e: number; all?: boolean; t?: string; place?: string }): void {
    const q: Record<string, string> = { type: 'Встреча', from: 'cal', date: cFD(p.d), time: cHM(p.all ? 0 : p.s), endTime: p.all ? '23:59' : cHM(p.e) };
    if (p.t?.trim()) q['title'] = p.t.trim();
    if (p.place?.trim()) q['place'] = p.place.trim();
    this.nav.go('eventnew', q);
  }
  /** полная форма встречи на просмотр (двойной клик или кнопка раскрытия в карточке) */
  preview(ev: CalEvent, d: Date): void {
    this.nav.go('eventnew', { type: 'Встреча', from: 'cal', cal: ev.id, view: '1', day: cFD(d) });
  }
  /** ответ приглашенного: Принять / Под вопросом / Отклонить (отклоненная удаляется) */
  answer(ev: CalEvent, my: string): void {
    if (my === 'no') {
      // отклоненная встреча удаляется из календаря
      this.events.update((l) => l.filter((x) => x.id !== ev.id));
      if (this.sel() === ev.id) this.sel.set(null);
      return this.toast.show('Встреча отклонена', '«' + ev.t + '» удалена из календаря. Организатор получит уведомление.');
    }
    this.update(ev.id, { my });
    this.toast.show('Ответ отправлен', '«' + ev.t + '»: ' + CAL_MY[my].toLowerCase() + '. Организатор получит уведомление.');
  }
  /** удаление встречи организатором — с подтверждением; true — удалена */
  async remove(ev: CalEvent): Promise<boolean> {
    const ok = await this.confirm.ask({
      title: ev.rep ? 'Удалить серию встреч?' : 'Удалить встречу?',
      text: (ev.rep ? 'Будут удалены все повторения «' + ev.t + '». ' : '«' + ev.t + '» пропадет из календаря. ') + 'Участники получат уведомление об отмене.',
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return false;
    this.events.update((l) => l.filter((x) => x.id !== ev.id));
    this.toast.show('Готово', 'Встреча «' + ev.t + '» удалена.');
    return true;
  }
  /** полная форма встречи — правка */
  edit(ev: CalEvent): void {
    this.nav.go('eventnew', { type: 'Встреча', from: 'cal', cal: ev.id });
  }
  update(id: string, patch: Partial<CalEvent>): void {
    this.events.update((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
}
