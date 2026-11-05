import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { EventsStore, durText, emptyEvent, parseDT } from '../../core/demo/events-store.service';
import { NavService } from '../../core/navigation/nav.service';
import { COMM_POOL } from '../../data/comm.data';
import { EVENT_GROUPS, EVENT_ROLES, EVENT_TYPES } from '../../data/events.data';
import { ME } from '../../data/people.data';
import { CalEvent } from '../../interface/cal';
import { CalState } from '../cal/cal.state';
import { cParse, calFromForm, calRepText, calToForm } from '../cal/cal.utils';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { BusyChart } from '../../widgets/busy-chart/busy-chart';
import { CoverUpload } from '../../widgets/cover-upload/cover-upload';
import { PplCard } from '../../widgets/ppl-card/ppl-card';
import { EventHead, eventWhen } from '../../widgets/event-head/event-head';
import { EventnewMain } from './eventnew-main/eventnew-main';
import { EventnewRepeat } from './eventnew-repeat/eventnew-repeat';
import { EventnewState } from './eventnew.state';

/**
 * «Мероприятия → Добавление / Редактирование мероприятия» (админ): основные поля как в «Добавлении встречи» Q.HCM,
 * повторение; тип «Мероприятие» — с обложкой (widgets/cover-upload), «Встреча» и «Аттестация» — без обложки; участники с занятостью на шкале дня (widgets/busy-chart) — у обоих типов. Форма-страница: без «Отменить», только «Создать» / «Сохранить».
 * Параметры адреса: ev — редактируемое мероприятие; type — тип нового («Встреча» из календаря, «Аттестация» из бланка); from — откуда открыта (cal, attncard), туда же возврат.
 * Из календаря (from=cal): cal — правка встречи календаря; title, date, time, endTime, place — данные из окна быстрого создания. Встреча сохраняется в календарь.
 * view=1 (двойной клик или раскрытие карточки встречи) — просмотр: шапка события widgets/event-head без обложки (как у мероприятия),
 * участники: у приглашенного — widgets/ppl-card ro (сотрудник и роль); у организатора — widgets/busy-chart, как в форме, и «Сохранить» внизу; ответ приглашенного «Принять / Под вопросом / Отклонить» —
 * внизу шапки; у организатора «Удалить» и «Редактировать» — справа от заголовка.
 */
@Component({
  selector: 'app-eventnew',
  imports: [PageHead, EventnewMain, EventnewRepeat, CoverUpload, BusyChart, PplCard, EventHead],
  template: `
    <app-page-head [title]="(s.ro() ? 'Просмотр ' : s.id() || calId() ? 'Редактирование ' : 'Добавление ') + (s.f().type === 'Встреча' ? 'встречи' : 'мероприятия')" [backTo]="s.id() ? 'eventview' : back().page" [backAttrs]="s.id() ? { ev: s.id() } : undefined" [backLabel]="s.id() ? 'К мероприятию' : back().label">
      @if (s.ro() && calEv(); as ce) {
        @if (isOrg()) {
          <span class="objacts"><button class="btn dng" (click)="removeCal(ce)">Удалить</button><button class="btn raised" (click)="calState.edit(ce)">Редактировать</button></span>
        }
      }
    </app-page-head>
    @let f = s.f();
    @if (s.ro()) {
      <!-- просмотр встречи — та же шапка события, что у мероприятия (widgets/event-head), без обложки -->
      <div event-head [title]="f.title" [status]="f.status" [when]="when()" [dur]="dur()" [place]="f.place" [desc]="f.desc">
        <!-- ответ приглашенного — внизу шапки (один элемент в одном @if, иначе слот evhAct его не примет) -->
        @if (calEv() && !isOrg()) {
          <div evhAct class="seg enans" role="group" aria-label="Ваш ответ">
            @for (a of answers; track a[0]) {
              <span [class.on]="calEv()!.my === a[0]" (click)="answer(calEv()!, a[0])">{{ a[1] }}</span>
            }
          </div>
        }
      </div>
    } @else {
      <div eventnew-main></div>
    }
    @if (f.type === 'Мероприятие') {
      <div cover-upload [value]="f.cover" (valueChange)="s.set('cover', $event)"></div>
    }
    @if (!s.ro() || s.repText()) {
      <div eventnew-repeat></div>
    }
    @if (s.ro() && !isOrg()) {
      <!-- приглашенный: только сотрудник и роль -->
      <div ppl-card ro [people]="f.people" [roles]="roles" [pool]="pool" empty="Участники не указаны."></div>
    } @else if (s.ro()) {
      <!-- организатор на просмотре: тот же блок, что в форме (занятость на шкале дня); состав и перенос на свободный час — по «Сохранить» внизу -->
      <div class="c mb" busy-chart [skip]="calId()" [people]="f.people" (peopleChange)="orgPeople($event)" [pool]="pool" [roles]="roles" [date]="f.date" [t1]="f.time" [t2]="f.date === f.endDate ? f.endTime : ''" (move)="orgMove($event)"></div>
    } @else {
    <div class="c mb" busy-chart [ro]="s.ro()" [skip]="calId()" [people]="f.people" (peopleChange)="s.set('people', $event)" [pool]="pool" [roles]="roles" [date]="f.date" [t1]="f.time" [t2]="f.date === f.endDate ? f.endTime : ''" (move)="moveTo($event)"></div>
    }
    @if (s.ro() && isOrg()) {
      <div class="c ipisl">
        <div class="ipff"><button class="btn pri" (click)="orgSave()">Сохранить</button></div>
      </div>
    }
    @if (!s.ro()) {
      @if (s.err()) {
        <div class="pqerr">{{ s.err() }}</div>
      }
      <div class="c ipisl">
        <div class="ipff"><button class="btn pri" (click)="save()">{{ s.id() || calId() ? 'Сохранить' : 'Создать' }}</button></div>
      </div>
    }
  `,
  styleUrl: './eventnew.scss',
  providers: [EventnewState],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-eventnew' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Eventnew {
  protected readonly s = inject(EventnewState);
  private readonly store = inject(EventsStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly roles = EVENT_ROLES;
  /** сотрудники, подразделения и команды */
  protected readonly pool = [...COMM_POOL, ...EVENT_GROUPS];
  /** редактируемое мероприятие (параметр адреса) */
  readonly ev = input('');
  /** тип нового (например, «Встреча» из календаря) */
  readonly type = input('');
  /** откуда открыта форма: cal — календарь, attncard — бланк аттестации; туда же «Назад» и переход после создания */
  readonly from = input('');
  /** из календаря: правка встречи и данные из быстрого создания */
  readonly cal = input('');
  readonly title = input('');
  readonly date = input('');
  readonly time = input('');
  readonly endTime = input('');
  readonly place = input('');
  /** просмотр встречи календаря */
  readonly view = input('');
  /** день повторения, открытый в календаре (просмотр серии) */
  readonly day = input('');
  protected readonly calState = inject(CalState);
  /** редактируемая (просматриваемая) встреча календаря */
  protected readonly calId = signal('');
  protected readonly calEv = computed(() => this.calState.events().find((e) => e.id === this.calId()));
  protected readonly isOrg = computed(() => this.calEv()?.org === ME[0]);
  /** просмотр: время с — по, длительность, приглашено */
  protected readonly when = computed(() => eventWhen(this.s.f()));
  protected readonly dur = computed(() => {
    const f = this.s.f(), a = parseDT(f.date, f.time), b = parseDT(f.endDate || f.date, f.endTime);
    return a && b && b > a ? durText(Math.round((b.getTime() - a.getTime()) / 60000)) : '';
  });
  protected readonly answers = [['yes', 'Принять'], ['maybe', 'Под вопросом'], ['no', 'Отклонить']];
  protected readonly back = computed(() =>
    this.from() === 'cal' ? { page: 'cal', label: 'К календарю' } : this.from() === 'attncard' ? { page: 'attncard', label: 'К бланку аттестации' } : { page: 'events', label: 'К мероприятиям' },
  );

  /** встреча: клик по свободному часу на шкале занятости — новое время (окончание — в тот же день) */
  protected moveTo(t: { date: string; t1: string; t2: string }): void {
    this.s.f.set({ ...this.s.f(), date: t.date, time: t.t1, endDate: t.date, endTime: t.t2 });
  }

  constructor() {
    effect(() => {
      const id = this.ev(), type = this.type(), cal = this.cal(), view = this.view() === '1', day = this.day();
      const pre = { title: this.title(), date: this.date(), time: this.time(), endDate: this.date(), endTime: this.endTime(), place: this.place() };
      untracked(() => {
        this.s.id.set(id);
        const f = (id && this.store.formOf(id)) || emptyEvent();
        const ce = cal ? this.calState.events().find((e) => e.id === cal) : undefined;
        this.calId.set(ce ? cal : '');
        this.s.ro.set(view && !!ce);
        this.s.repText.set(ce?.rep ? calRepText(ce.rep, cParse(ce.d)) : '');
        this.s.err.set('');
        // «Весь день» в форме нет — время всегда указывается; тип нового — из адреса; из календаря — встреча или введенные данные
        const add = ce ? { ...calToForm(ce), ...(view && day ? { date: day, endDate: day } : {}) } : Object.fromEntries(Object.entries(pre).filter(([, v]) => v));
        this.s.f.set({ ...f, allDay: false, type: !id && EVENT_TYPES.includes(type) ? type : f.type, ...add });
      });
    });
  }

  protected save(): void {
    const e = this.s.check();
    if (e) return this.s.err.set(e);
    const f = this.s.f(), id = this.s.id();
    if (this.from() === 'cal') return this.saveCal(f);
    if (id) {
      this.store.update(id, f);
      this.toast.show('Изменения сохранены', `Мероприятие «${f.title}» обновлено.`);
      // после правки — обратно на страницу мероприятия
      this.nav.go('eventview', { ev: id });
    } else {
      this.store.add(f);
      this.toast.show('Мероприятие создано', `«${f.title}» · ${f.date} ${f.time}`);
      this.nav.go(this.back().page);
    }
  }
  /** просмотр, организатор: состав участников и перенос на свободный час — на экране, сохраняются кнопкой «Сохранить» */
  protected orgPeople(list: ReturnType<EventnewState['f']>['people']): void {
    this.s.set('people', list);
  }
  protected orgMove(t: { date: string; t1: string; t2: string }): void {
    this.moveTo(t);
  }
  /** «Сохранить» на просмотре: состав (без пустых строк) и время — во встречу календаря, возврат в календарь */
  protected orgSave(): void {
    this.saveCal({ ...this.s.f(), people: this.s.f().people.filter((p) => p.n) });
  }
  /** ответ на приглашение; отклоненная скрывается из календаря — возврат в календарь */
  protected answer(ev: CalEvent, my: string): void {
    this.calState.answer(ev, my);
    if (my === 'no') this.nav.go('cal');
  }
  protected async removeCal(ev: CalEvent): Promise<void> {
    if (await this.calState.remove(ev)) this.nav.go('cal');
  }
  /** встреча из календаря — в календарь (новая или правка), возврат в календарь с подсветкой */
  private saveCal(f: ReturnType<EventnewState['f']>): void {
    const id = this.calId(), base = id ? this.calState.events().find((e) => e.id === id) || null : null;
    const ev = calFromForm(f, base, ME[0]);
    this.calState.events.update((l) => (base ? l.map((e) => (e.id === id ? ev : e)) : [...l, ev]));
    this.toast.show(base ? 'Изменения сохранены' : 'Встреча создана', `«${ev.t}» · ${f.date} ${f.time}`);
    this.nav.go('cal');
    this.calState.flash(ev.id);
  }
}
