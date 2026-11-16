import { Injectable, computed, signal } from '@angular/core';
import {
  ATT_EVENTS,
  ATT_PEOPLE,
  ATT_RATES,
  ATT_RESPONSIBLE,
  ATT_RESULT,
  ATT_RESULT_BY_STAGE,
  ATT_ROLES,
} from '../../data/attest.data';
import { AttachFile } from '../../interface/attach';
import { AttEvent, AttPerson, AttRate, AttResult, AttStage } from '../../interface/attest';

const ORDER = ['self', 'mgr', 'comm', 'meet', 'final', 'ipr', 'iprok', 'fail', 'cand'];
/** этапы после решения комиссии: «Итог» и документы */
const POST: AttStage[] = ['final', 'ipr', 'iprok', 'fail'];
/** на своем шаге оценку можно изменить: сотрудник — на «Самооценке», руководитель — на «Оценке руководителя», комиссия — на «Оценках комиссии» */
const OWN_STEP: Record<string, AttStage> = { emp: 'self', mgr: 'mgr', comm: 'comm' };

/** Форма «Итог» на заседании комиссии */
export interface AttFinalForm {
  dec: string;
  cand: boolean;
  cm: string;
  docs: AttachFile[];
}

/**
 * Демо-хранилище бланка аттестации сотрудника: этап, роль, оценки по этапам, мероприятия, участники, итоги.
 * Демо-переключатели (этап, роль, способ ввода значения) — в dev-панели страницы.
 */
@Injectable({ providedIn: 'root' })
export class AttestStore {
  readonly stage = signal<AttStage>('self');
  readonly role = signal('emp');
  /** способ ввода значения оценки: A–E, список, текст, число */
  readonly inputMode = signal<'seg' | 'list' | 'text' | 'num'>('seg');

  readonly rates = signal<Record<string, AttRate[]>>(structuredClone(ATT_RATES));
  readonly events = signal<AttEvent[]>(structuredClone(ATT_EVENTS));
  readonly people = signal<AttPerson[]>(structuredClone(ATT_PEOPLE));
  readonly responsible = signal(ATT_RESPONSIBLE);
  readonly result = signal<AttResult>(structuredClone(ATT_RESULT));
  readonly form = signal<AttFinalForm>({ dec: '', cand: false, cm: '', docs: [] });
  /** ошибки формы «Итог»: dec, cm */
  readonly formErr = signal(new Set<string>());
  /** свернутые блоки: «этап|заголовок» */
  readonly cold = signal<Record<string, boolean>>({});

  readonly roles = computed(() => ATT_ROLES[this.stage()] || ATT_ROLES.self);
  /** требуемые оценки этапа; «Оценить» видит только тот, чья это оценка */
  readonly list = computed(() =>
    (this.rates()[this.stage()] || []).map((a) => (a.st === 'todo' && a.own && a.own !== this.role() ? { ...a, st: 'wait' as const } : a)),
  );
  readonly post = computed(() => POST.includes(this.stage()));
  /** итог с вариантом этапа */
  readonly res = computed<AttResult>(() => ({ ...this.result(), ...(ATT_RESULT_BY_STAGE[this.stage()] || {}) }));
  /** мероприятия добавляет и правит руководитель (и HR) — до «Заседания комиссии» */
  readonly canEditEvents = computed(() => ['mgr', 'hr', 'var'].includes(this.role()) && ['self', 'mgr', 'comm'].includes(this.stage()));
  /** участников добавляет, исключает и меняет роли руководитель */
  readonly canEditPeople = computed(() => this.role() === 'mgr');

  setStage(s: AttStage): void {
    this.stage.set(s);
    if (!this.roles().some((r) => r[0] === this.role())) this.role.set('emp');
  }
  /** своя оценка на своем шаге — можно изменить */
  own(a: AttRate): boolean {
    return !!a.own && a.own === this.role() && this.stage() === OWN_STEP[this.role()];
  }
  /** свернут ли блок на текущем этапе: выбор пользователя, иначе по умолчанию — «Участники» свернуты после «Оценок комиссии» */
  isCold(title: string): boolean {
    const v = this.cold()[this.stage() + '|' + title];
    return v ?? (title === 'Участники' && !['self', 'mgr', 'comm'].includes(this.stage()));
  }
  toggleCold(title: string): void {
    const k = this.stage() + '|' + title, v = !this.isCold(title);
    this.cold.update((c) => ({ ...c, [k]: v }));
  }

  /** статус мероприятия: прошлых шагов — проведены, текущего и следующих — запланированы; «…» меняет вручную */
  eventStatus(e: AttEvent): 'done' | 'plan' | 'cancel' {
    const cur = Math.min(5, ORDER.indexOf(this.stage())),
      es = e.es ?? 99;
    return e.stO || (es < cur ? 'done' : 'plan');
  }
  clearFormErr(k: string): void {
    if (!this.formErr().has(k)) return;
    const s = new Set(this.formErr());
    s.delete(k);
    this.formErr.set(s);
  }
  saveRate(k: string, patch: Partial<AttRate>): void {
    const s = this.stage();
    this.rates.update((r) => ({ ...r, [s]: r[s].map((a) => (a.k === k ? { ...a, ...patch } : a)) }));
  }
  updateEvent(e: AttEvent, patch: Partial<AttEvent>): void {
    this.events.update((l) => l.map((x) => (x === e ? { ...x, ...patch } : x)));
  }
}
