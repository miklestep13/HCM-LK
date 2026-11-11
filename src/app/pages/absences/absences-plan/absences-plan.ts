import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { absCount, absDate, absDays, absToday, absWorkDays } from '../../../core/demo/absence-store.service';
import { ABS_ADD_REASONS, ABS_APPLY, ABS_DAY_COUNT, ABS_DAY_COUNT_LABEL, ABS_DONOR, ABS_KIND_LABEL, ABS_LEAVE_KINDS, ABS_ORGS, ABS_TEAM, ABS_TRANSPORT, ABS_VAC_TYPES } from '../../../data/absence.data';
import { plural } from '../../../data/org.data';
import { AttachFile } from '../../../interface/attach';
import { avCls } from '../../../data/people.data';
import { AbsEntry, AbsPerson } from '../../../interface/absence';
import { Attach } from '../../../shared/ui/attach/attach';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Suggest } from '../../../shared/ui/suggest/suggest';
import { EVENT_TIMES } from '../../../data/events.data';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { TODAY } from '../../../shared/ui/date-range/date-range';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AbsencesState } from '../absences.state';

/**
 * Сайдбар «Заявка на отсутствие» (кнопка «Оформить ▾» — вид из списка). Для всех видов: даты, число дней и способ подсчета
 * (календарные / рабочие), основание — документ (загрузка файлов), комментарий.
 * Основной отпуск (только в период планирования): рекомендация — одна из частей в году не менее 14 дней; не больше остатка.
 * «Отпуск» — с полем «Тип отпуска»: дополнительный (причина; донорство — дата сдачи и обязательный документ), за свой счет,
 * учебный (переключатель «Неоплачиваемый»), по уходу за ребенком. У всех отпусков — заместитель.
 * Отгул: один или несколько рабочих дней, баланс «накоплено — использовано — останется». Больничный: не планируется заранее (начало — не позже сегодня),
 * основание — номер ЭЛН (необязательно), признак «листок открыт» (без даты окончания). Командировка: время начала и окончания, работа в выходные дни периода,
 * место, организация (список с поиском), цель, транспорт, гостиница.
 */
@Component({
  selector: 'app-absences-plan',
  imports: [Drawer, Field, Select, DateField, Attach, Icon, Float, Suggest],
  host: { '(document:click)': 'dpk.set(null)' },
  template: `
    <app-drawer [title]="s.editing() ? 'Изменение заявки' : 'Заявка на отсутствие'" wide [okLabel]="kind() === 'sick' ? (s.editing() ? 'Сохранить' : 'Отправить') : 'Отправить на согласование'" [open]="s.planOpen()" (openChange)="s.planOpen.set($event); $event || s.editing.set(null)" (ok)="send()">
      <div class="frm abpf">
        <app-field label="Вид отсутствия" required full filled>
          <app-select [options]="kinds()" [value]="applyLabel()" (valueChange)="setKind($event)" />
        </app-field>
        @if (isType()) {
          <app-field label="Тип отпуска" required full filled>
            <app-select [options]="types" [value]="typeLabel()" (valueChange)="setType($event)" />
          </app-field>
        }

        @switch (kind()) {
          @case ('vac') {
            <p class="abnote inf full">
              Одна из частей ежегодного отпуска — не менее 14 календарных дней.
              @if (has14()) {
                В {{ year() }} году такая часть у вас уже есть.
              }
            </p>
          }
          @case ('add') {
            <app-field label="Причина" required full [filled]="!!reason()" [error]="err() === 'reason'">
              <app-select [options]="reasons" [value]="reason()" (valueChange)="reason.set($event); err.set('')" />
            </app-field>
            @if (reason() === donor) {
              <app-field label="Дата сдачи" required full [filled]="!!donorDate()" [error]="err() === 'donor'">
                <app-date-field [value]="donorDate()" (valueChange)="donorDate.set($event); err.set('')" />
              </app-field>
            }
          }
          @case ('study') {
            <label class="swt abswt full"
              ><input type="checkbox" [checked]="studyUnpaid()" (change)="studyUnpaid.set($any($event.target).checked)" /><i></i><span>Неоплачиваемый</span></label
            >
          }
          @case ('off') {
            <div class="abbal full">
              <span>Накоплено <b>{{ offTotal() }}</b></span><span>Использовано <b>{{ s.store.offUsed() }}</b></span
              ><span>Останется <b [class.dgt]="offAfter() < 0">{{ offAfter() }}</b></span>
            </div>
          }
          @case ('sick') {
            <p class="abnote full">Больничный не планируется заранее — оформите его по факту. Номер электронного листка нетрудоспособности (ЭЛН) можно добавить позже.</p>
            <app-field label="Номер ЭЛН" full [filled]="!!eln()" [error]="err() === 'eln'">
              <input class="fin" inputmode="numeric" [value]="eln()" (input)="eln.set($any($event.target).value); err.set('')" />
            </app-field>
            <label class="ckb abunp full"
              ><input type="checkbox" [checked]="open()" (change)="open.set($any($event.target).checked); err.set('')" /><i></i
              ><span>Листок открыт (дата окончания пока неизвестна)</span></label
            >
          }
        }

        <app-field label="Дата начала" required [full]="single()" [filled]="!!from()" [error]="err() === 'from'">
          <app-date-field [value]="from()" (valueChange)="setFrom($event)" />
        </app-field>
        @if (!single()) {
          <app-field label="Дата окончания" required [filled]="!!to()" [error]="err() === 'to'">
            <app-date-field [value]="to()" (valueChange)="to.set($event); err.set('')" />
          </app-field>
        }
        @if (daysText()) {
          <div class="abdays full">
            {{ daysText() }}
            @if (kind() === 'vac') {
              <span>· останется {{ left() }} из {{ s.store.me().vacLeft }} дней отпуска</span>
            }
          </div>
        }

        @if (kind() === 'trip') {
          <app-field label="Время начала" [filled]="!!t1()">
            <div class="abtm">
              <input #tt1 class="fin" placeholder="чч:мм" [appSuggest]="times" [suggestAll]="true" [value]="t1()" (input)="t1.set($any($event.target).value)" (suggestPick)="t1.set($event)" />
              <app-icon name="chevDown" (click)="tt1.focus()" />
            </div>
          </app-field>
          <app-field label="Время окончания" [filled]="!!t2()">
            <div class="abtm">
              <input #tt2 class="fin" placeholder="чч:мм" [appSuggest]="times" [suggestAll]="true" [value]="t2()" (input)="t2.set($any($event.target).value)" (suggestPick)="t2.set($event)" />
              <app-icon name="chevDown" (click)="tt2.focus()" />
            </div>
          </app-field>
          @if (weekends().length) {
            <!-- работа в выходной: отметить выходные периода, в которые сотрудник работает -->
            <div class="abwe full">
              <span class="ablbl">Работа в выходной день</span>
              <div class="abwed">
                @for (d of weekends(); track d.v) {
                  <button type="button" class="abwd" [class.on]="workDays().includes(d.v)" (click)="toggleWork(d.v)">
                    <b>{{ d.l }}</b><small>{{ d.wd }}</small>
                  </button>
                }
              </div>
              <small class="abwh">
                @if (workDays().length) {
                  Работаете {{ workDays().length }} {{ word(workDays().length) }} из {{ weekends().length }} выходных
                } @else {
                  Отметьте выходные, в которые будете работать
                }
              </small>
            </div>
          }
          <app-field label="Место назначения" required full [filled]="!!city()" [error]="err() === 'city'">
            <input class="fin" [value]="city()" (input)="city.set($any($event.target).value); err.set('')" />
          </app-field>
          <app-field label="Организация" full [filled]="!!org()">
            <app-select [search]="true" placeholder="" [options]="orgs" [value]="org()" (valueChange)="org.set($event)" />
          </app-field>
          <app-field label="Цель командировки" required full [filled]="!!goal()" [error]="err() === 'goal'">
            <textarea class="fta" rows="2" [value]="goal()" (input)="goal.set($any($event.target).value); err.set('')"></textarea>
          </app-field>
          <app-field label="Транспорт" filled>
            <app-select [options]="transport" [value]="trans()" (valueChange)="trans.set($event)" />
          </app-field>
          <label class="ckb abunp abhot"
            ><input type="checkbox" [checked]="hotel()" (change)="hotel.set($any($event.target).checked)" /><i></i><span>Нужна гостиница</span></label
          >
        }

        @if (leave()) {
          <!-- заместитель: фото, ФИО, должность; список с поиском — как выбор сотрудника в графике -->
          <div class="abdep full">
            <span class="ablbl">Заместитель</span>
            <button type="button" class="absel" [class.act]="dpk()" (click)="openDpk($event)">
              @if (deputyP(); as d) {
                <span class="av" [class]="av(d)"></span><span class="cnm"><b>{{ d.n }}</b><small>{{ d.pos }}</small></span>
              } @else {
                <span class="ph">Выберите сотрудника</span>
              }
              <app-icon name="chevDown" />
            </button>
          </div>
          @if (dpk(); as el) {
            <div class="fpop selpop cupop mbpick" [appFloat]="el" [style.width.px]="el.offsetWidth" (click)="$event.stopPropagation()">
              <input class="fin fsq" placeholder="Поиск по ФИО или должности" [value]="dq()" (input)="dq.set($any($event.target).value)" />
              <div class="folist cul">
                @for (p of dFound(); track p.n) {
                  <button class="mbko" [class.on]="p.n === deputy()" (click)="deputy.set(p.n); dpk.set(null)">
                    <span class="av" [class]="av(p)"></span><span class="cnm"><b>{{ p.n }}</b><small>{{ p.pos }}</small></span>
                    @if (p.n === deputy()) {
                      <app-icon name="checkSm" />
                    }
                  </button>
                } @empty {
                  <div class="foe">Ничего не нашли. Проверьте написание.</div>
                }
              </div>
            </div>
          }
        }
        <div class="abbas full">
          <span class="ablbl">Основание (документ)@if (kind() === 'add' && reason() === donor) {<em class="abreq">*</em>}</span>
          <app-attach edit [class.aberr]="err() === 'files'" [files]="files()" (filesChange)="files.set($event); err.set('')" />
        </div>
        <app-field label="Комментарий" full [filled]="!!note()">
          <textarea class="fta" rows="3" [value]="note()" (input)="note.set($any($event.target).value)"></textarea>
        </app-field>
      </div>
      @if (msg()) {
        <div class="pqerr">{{ msg() }}</div>
      }
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbsencesPlan {
  protected readonly s = inject(AbsencesState);
  private readonly toast = inject(ToastService);
  /** «Вид отсутствия»: основной отпуск — только в период планирования */
  protected readonly kinds = computed(() => ABS_APPLY.filter((k) => !k.plan || this.s.store.planOpen()).map((k) => k.label));
  protected readonly types = ABS_VAC_TYPES.map((t) => t.label);
  /** заместитель — коллеги из команды: список с поиском у поля */
  protected readonly dpk = signal<HTMLElement | null>(null);
  protected readonly dq = signal('');
  protected readonly av = (p: AbsPerson) => avCls(p.n, p.av);
  protected readonly dFound = computed(() => {
    const q = this.dq().trim().toLowerCase();
    return ABS_TEAM.filter((p) => !q || (p.n + ' ' + p.pos).toLowerCase().includes(q));
  });
  protected readonly deputyP = computed(() => ABS_TEAM.find((p) => p.n === this.deputy()) ?? null);
  protected openDpk(e: Event): void {
    e.stopPropagation();
    if (this.dpk()) return this.dpk.set(null);
    this.dq.set('');
    this.dpk.set(e.currentTarget as HTMLElement);
  }
  protected readonly transport = ABS_TRANSPORT;
  protected readonly kind = this.s.planKind;
  protected readonly kindLabel = computed(() => ABS_KIND_LABEL[this.kind()]);
  /** вид — один из типов «Отпуска» */
  protected readonly isType = computed(() => ABS_VAC_TYPES.some((t) => t.k === this.kind()));
  protected readonly applyLabel = computed(() => (this.isType() ? 'Отпуск' : ABS_APPLY.find((k) => k.k === this.kind())!.label));
  protected readonly typeLabel = computed(() => ABS_VAC_TYPES.find((t) => t.k === this.kind())?.label ?? '');
  protected readonly leave = computed(() => ABS_LEAVE_KINDS.includes(this.kind()));
  protected readonly deputy = signal('');
  /** дополнительный отпуск: причина; донорство — дата сдачи и обязательный документ */
  protected readonly reasons = ABS_ADD_REASONS;
  protected readonly donor = ABS_DONOR;
  protected readonly reason = signal('');
  protected readonly donorDate = signal('');
  /** учебный отпуск: неоплачиваемый */
  protected readonly studyUnpaid = signal(false);
  /** командировка: организация, время, работа в выходные */
  protected readonly orgs = ABS_ORGS;
  protected readonly times = EVENT_TIMES;
  protected readonly t1 = signal('09:00');
  protected readonly t2 = signal('18:00');
  protected readonly workDays = signal<string[]>([]);
  /** выходные дни периода командировки */
  protected readonly weekends = computed(() => {
    const a = absDate(this.from()), b = absDate(this.to()), out: { v: string; l: string; wd: string }[] = [];
    if (!a || !b || b < a || absDays(this.from(), this.to()) > 62) return out;
    for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1))
      if (!(d.getDay() % 6)) {
        const v = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
        out.push({ v, l: v.slice(0, 5), wd: d.getDay() ? 'суббота' : 'воскресенье' });
      }
    return out;
  });
  protected toggleWork(v: string): void {
    this.workDays.update((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v].sort((x, y) => +absDate(x)! - +absDate(y)!)));
  }
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly note = signal('');
  protected readonly city = signal('');
  protected readonly org = signal('');
  protected readonly goal = signal('');
  protected readonly trans = signal(ABS_TRANSPORT[0]);
  protected readonly hotel = signal(true);
  protected readonly eln = signal('');
  protected readonly open = signal(true);
  protected readonly files = signal<AttachFile[]>([]);
  protected readonly err = signal('');
  protected readonly msg = signal('');
  protected readonly word = (n: number) => plural(n, 'день', 'дня', 'дней');

  /** одна дата: открытый больничный — без окончания */
  protected readonly single = computed(() => this.kind() === 'sick' && this.open());
  /** дата окончания для подсчета: открытый больничный — сегодня */
  private readonly end = computed(() => (this.single() ? absToday() : this.to()));
  private readonly n = computed(() => Math.max(0, absCount({ kind: this.kind(), from: this.from(), to: this.end() })));
  protected readonly daysText = computed(() => {
    const n = this.n();
    if (!n) return '';
    if (this.kind() === 'sick' && this.open()) return 'Открыт с ' + this.from() + ' · ' + n + ' ' + this.word(n) + ' на сегодня';
    return n + ' ' + this.word(n) + ' · ' + ABS_DAY_COUNT_LABEL[ABS_DAY_COUNT[this.kind()]].toLowerCase();
  });
  protected readonly left = computed(() => this.s.store.me().vacLeft - this.n());

  /** год даты начала (или года планирования) и есть ли в нем часть отпуска от 14 дней */
  protected readonly year = computed(() => absDate(this.from())?.getFullYear() ?? (this.s.store.planOpen() ? this.s.store.plan.year : TODAY.getFullYear()));
  protected readonly has14 = computed(() => this.s.store.vacParts(this.year()).some((d) => d >= 14));

  /** отгулы: накоплено = остаток + использовано; останется после заявки */
  protected readonly offTotal = computed(() => this.s.store.me().offLeft + this.s.store.offUsed());
  protected readonly offAfter = computed(() => this.s.store.me().offLeft - this.n());

  constructor() {
    // новая заявка — пустая форма; изменение — поля из заявки
    effect(() => {
      if (!this.s.planOpen()) return;
      untracked(() => {
        this.reset();
        const x = this.s.editing();
        if (x) this.fill(x);
      });
    });
  }

  protected setKind(label: string): void {
    const k = ABS_APPLY.find((x) => x.label === label)!.k;
    if (!(k === 'add' && this.isType())) this.kind.set(k);
    this.err.set('');
    this.msg.set('');
  }
  protected setType(label: string): void {
    this.kind.set(ABS_VAC_TYPES.find((t) => t.label === label)!.k);
    this.err.set('');
  }
  protected setFrom(v: string): void {
    this.from.set(v);
    this.err.set('');
  }
  protected send(): void {
    const k = this.kind(), a = absDate(this.from()), b = absDate(this.end());
    if (k === 'sick' && this.eln().trim() && !/^\d{12}$/.test(this.eln().trim())) return this.fail('eln', 'Номер ЭЛН — 12 цифр.');
    if (!a) return this.fail('from', 'Укажите дату начала в формате дд.мм.гггг.');
    if (k === 'sick' && a > TODAY) return this.fail('from', 'Больничный не планируется заранее: дата начала — не позже сегодняшней.');
    if (!b || b < a) return this.fail('to', 'Дата окончания должна быть не раньше даты начала.');
    if (k === 'sick' && !this.open() && b > TODAY) return this.fail('to', 'Закрытый листок не может заканчиваться позже сегодняшнего дня.');
    const back = this.s.editing()?.kind === 'off' ? absWorkDays(this.s.editing()!.from, this.s.editing()!.to) : 0;
    if (k === 'off' && this.s.store.me().offLeft + back < 1) return this.fail('from', 'Нет накопленных отгулов: отгул начисляется за работу в выходной или сверхурочно.');
    if (k === 'off' && !this.n()) return this.fail('from', 'Отгул берется в рабочие дни — в периоде только выходные.');
    if (k === 'vac' && absDays(this.from(), this.end()) > this.s.store.me().vacLeft) return this.fail('to', 'Больше остатка отпуска: доступно ' + this.s.store.me().vacLeft + ' дней.');
    if (k === 'add' && !this.reason()) return this.fail('reason', 'Выберите причину дополнительного отпуска.');
    if (k === 'add' && this.reason() === ABS_DONOR && !absDate(this.donorDate())) return this.fail('donor', 'Укажите дату сдачи крови.');
    if (k === 'add' && this.reason() === ABS_DONOR && !this.files().some((f) => f.st === 'ok')) return this.fail('files', 'Приложите справку о сдаче крови — для донорства документ обязателен.');
    if (k === 'trip' && !this.city().trim()) return this.fail('city', 'Укажите место назначения.');
    if (k === 'trip' && !this.goal().trim()) return this.fail('goal', 'Укажите цель командировки.');
    const files = this.files().filter((f) => f.st === 'ok');
    const basis = k === 'sick' && this.eln().trim() ? 'ЭЛН ' + this.eln().trim() : files.length ? files[0].name : 'Заявление от ' + absToday();
    const extra = {
      basis,
      files: files.length ? files : undefined,
      ...(this.leave() && this.deputy() ? { deputy: this.deputy() } : {}),
      ...(k === 'sick' && this.open() ? { open: true } : {}),
      ...(k === 'add' ? { reason: this.reason(), ...(this.reason() === ABS_DONOR ? { donorDate: this.donorDate() } : {}) } : {}),
      ...(k === 'study' && this.studyUnpaid() ? { unpaid: true } : {}),
      ...(k === 'trip'
        ? {
            trip: {
              city: this.city().trim(), org: this.org(), goal: this.goal().trim(), transport: this.trans(), hotel: this.hotel(),
              t1: this.t1(), t2: this.t2(), workDays: this.workDays().filter((d) => this.weekends().some((w) => w.v === d)),
            },
          }
        : {}),
    };
    const ed = this.s.editing();
    if (ed) this.s.store.update(ed.id, k, this.from(), this.end(), this.note().trim(), extra);
    else this.s.store.request(k, this.from(), this.end(), this.note().trim(), extra);
    const name = this.kindLabel();
    const when = this.from() === this.end() ? this.from() : this.from() + ' – ' + (this.single() ? 'открыт' : this.end());
    const title = ed ? 'Заявка изменена' : k === 'sick' ? 'Больничный оформлен' : 'Заявка отправлена';
    this.toast.show(title, name + ' ' + when + (k === 'sick' ? '' : ' — на согласовании у руководителя.'));
    this.s.planOpen.set(false);
    this.s.editing.set(null);
    // показать в графике период заявки
    this.s.year.set(a.getFullYear());
    this.s.month.set(a.getMonth());
  }
  private reset(): void {
    for (const f of [this.from, this.to, this.note, this.city, this.org, this.goal, this.eln, this.err, this.msg]) f.set('');
    this.trans.set(ABS_TRANSPORT[0]);
    this.hotel.set(true);
    this.open.set(true);
    this.files.set([]);
    this.deputy.set('');
    this.reason.set('');
    this.donorDate.set('');
    this.studyUnpaid.set(false);
    this.t1.set('09:00');
    this.t2.set('18:00');
    this.workDays.set([]);
  }
  /** заполнить форму своей заявкой (редактирование) */
  private fill(x: AbsEntry): void {
    this.from.set(x.from);
    this.to.set(x.open ? '' : x.to);
    this.note.set(x.note || '');
    this.files.set(x.files ? [...x.files] : []);
    this.deputy.set(x.deputy || '');
    this.reason.set(x.reason || '');
    this.donorDate.set(x.donorDate || '');
    this.studyUnpaid.set(!!x.unpaid);
    this.open.set(!!x.open);
    if (x.basis?.startsWith('ЭЛН ')) this.eln.set(x.basis.slice(4));
    if (x.trip) {
      this.city.set(x.trip.city);
      this.org.set(x.trip.org);
      this.goal.set(x.trip.goal);
      this.trans.set(x.trip.transport);
      this.hotel.set(x.trip.hotel);
      this.t1.set(x.trip.t1 || '09:00');
      this.t2.set(x.trip.t2 || '18:00');
      this.workDays.set(x.trip.workDays ? [...x.trip.workDays] : []);
    }
  }
  private fail(k: string, m: string): void {
    this.err.set(k);
    this.msg.set(m);
  }
}
