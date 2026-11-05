import { Injectable, computed, signal } from '@angular/core';
import { ABS_DAY_COUNT, ABS_ME, ABS_PLAN, ABS_POOL, ABS_TEAMS } from '../../data/absence.data';
import { AbsEntry, AbsKind, AbsPerson, AbsTeam } from '../../interface/absence';
import { TODAY } from '../../shared/ui/date-range/date-range';

/** «дд.мм.гггг» → дата (или null) */
export const absDate = (s: string): Date | null => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((s || '').trim());
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
};
/** дней в периоде, включительно */
export const absDays = (from: string, to: string): number => {
  const a = absDate(from), b = absDate(to);
  return a && b ? Math.round((+b - +a) / 864e5) + 1 : 0;
};
/** рабочих дней в периоде (без субботы и воскресенья) */
export const absWorkDays = (from: string, to: string): number => {
  const a = absDate(from), b = absDate(to);
  let n = 0;
  if (a && b) for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) if (d.getDay() % 6) n++;
  return n;
};
/** дней отсутствия по способу подсчета вида */
export const absCount = (x: Pick<AbsEntry, 'kind' | 'from' | 'to'>): number => (ABS_DAY_COUNT[x.kind] === 'work' ? absWorkDays(x.from, x.to) : absDays(x.from, x.to));
/** «дд.мм.гггг» сегодня */
export const absToday = (): string => String(TODAY.getDate()).padStart(2, '0') + '.' + String(TODAY.getMonth() + 1).padStart(2, '0') + '.' + TODAY.getFullYear();
const clone = <T>(x: T): T => structuredClone(x);

/**
 * «График отсутствий» (демо, до перезагрузки): я, команды подразделений (у руководителя — несколько) и добавленные в график коллеги; период планирования отпусков
 * (переключатель в dev-панели), заявки на отсутствие и их отмена.
 */
@Injectable({ providedIn: 'root' })
export class AbsenceStore {
  readonly me = signal<AbsPerson>(clone(ABS_ME));
  /** все команды подразделений; видимые — по роли (teams) */
  private readonly allTeams = signal<AbsTeam[]>(clone(ABS_TEAMS));
  /** коллеги, добавленные в график (по ФИО) */
  readonly added = signal<string[]>([]);
  readonly pool = ABS_POOL;
  readonly addedPeople = computed(() => this.added().map((n) => this.pool.find((p) => p.n === n)!).filter(Boolean));
  /** открыт период планирования отпусков на следующий год */
  readonly planOpen = signal(false);
  /** роль (dev-панель): сотрудник видит в таблице свои заявки, администратор — заявки сотрудников */
  readonly role = signal<'emp' | 'admin'>('emp');
  readonly plan = ABS_PLAN;
  /** команды в графике: сотрудник — свое подразделение, руководитель — все свои подразделения */
  readonly teams = computed(() => this.allTeams().filter((t) => !t.admin || this.role() === 'admin'));
  /** все сотрудники видимых команд (таблица, выбор в «Добавить участника») */
  readonly team = computed(() => this.teams().flatMap((t) => t.people));

  /** отпуск, запланированный на год планирования (без отклоненных), дней */
  readonly planned = computed(() =>
    this.me()
      .items.filter((x) => x.kind === 'vac' && x.status !== 'Отклонено' && absDate(x.from)!.getFullYear() === this.plan.year)
      .reduce((a, x) => a + absDays(x.from, x.to), 0),
  );
  /** мой ближайший отпуск: еще не закончился, не отклонен и не использован */
  readonly nextVac = computed(
    () =>
      this.me()
        .items.filter((x) => x.kind === 'vac' && (x.status === 'Согласовано' || x.status === 'Согласование' || x.status === 'Черновик') && absDate(x.to)! >= TODAY)
        .sort((a, b) => +absDate(a.from)! - +absDate(b.from)!)[0] ?? null,
  );

  /** новая заявка: на согласование руководителю */
  /** части ежегодного оплачиваемого отпуска в году (без отклоненных), дней — для рекомендации «одна часть не менее 14 дней» */
  vacParts(year: number): number[] {
    return this.me()
      .items.filter((x) => x.kind === 'vac' && x.status !== 'Отклонено' && absDate(x.from)!.getFullYear() === year)
      .map((x) => absDays(x.from, x.to));
  }
  /** отгулы: использовано в этом году (без отклоненных), рабочих дней; накоплено = остаток + использовано */
  readonly offUsed = computed(() =>
    this.me()
      .items.filter((x) => x.kind === 'off' && x.status !== 'Отклонено' && absDate(x.from)!.getFullYear() === TODAY.getFullYear())
      .reduce((a, x) => a + absWorkDays(x.from, x.to), 0),
  );

  /** новая заявка: на согласование руководителю (больничный — по факту, без согласования); отгул уменьшает остаток отгулов */
  request(kind: AbsKind, from: string, to: string, note: string, extra: Partial<AbsEntry> = {}): AbsEntry {
    const x: AbsEntry = { id: 'my' + Date.now(), kind, from, to, status: kind === 'sick' ? 'Согласовано' : 'Согласование', note: note || undefined, ...extra };
    this.me.update((m) => ({ ...m, offLeft: kind === 'off' ? Math.max(0, m.offLeft - absWorkDays(from, to)) : m.offLeft, items: [...m.items, x] }));
    return x;
  }
  /** отменить свою заявку (черновик или на согласовании) */
  cancel(id: string): void {
    this.me.update((m) => {
      const x = m.items.find((i) => i.id === id);
      const back = x?.kind === 'off' ? absWorkDays(x.from, x.to) : 0;
      return { ...m, offLeft: m.offLeft + back, items: m.items.filter((i) => i.id !== id) };
    });
  }
  /** изменить свою заявку: прежняя убирается (отгулы возвращаются), измененная снова уходит на согласование */
  update(id: string, kind: AbsKind, from: string, to: string, note: string, extra: Partial<AbsEntry> = {}): AbsEntry {
    this.cancel(id);
    return this.request(kind, from, to, note, extra);
  }
  add(names: string[]): void {
    this.added.update((l) => [...l, ...names.filter((n) => !l.includes(n))]);
  }
  removeAdded(n: string): void {
    this.added.update((l) => l.filter((x) => x !== n));
  }
}
