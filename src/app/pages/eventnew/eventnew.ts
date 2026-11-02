import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, untracked } from '@angular/core';
import { EventsStore, emptyEvent } from '../../core/demo/events-store.service';
import { NavService } from '../../core/navigation/nav.service';
import { COMM_POOL } from '../../data/comm.data';
import { EVENT_GROUPS, EVENT_ROLES, EVENT_TYPES } from '../../data/events.data';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { BusyChart } from '../../widgets/busy-chart/busy-chart';
import { CoverUpload } from '../../widgets/cover-upload/cover-upload';
import { EventnewMain } from './eventnew-main/eventnew-main';
import { EventnewRepeat } from './eventnew-repeat/eventnew-repeat';
import { EventnewState } from './eventnew.state';

/**
 * «Мероприятия → Добавление / Редактирование мероприятия» (админ): основные поля как в «Добавлении встречи» Q.HCM,
 * повторение; тип «Мероприятие» — с обложкой (widgets/cover-upload), «Встреча» и «Аттестация» — без обложки; участники с занятостью на шкале дня (widgets/busy-chart) — у обоих типов. Форма-страница: без «Отменить», только «Создать» / «Сохранить».
 * Параметры адреса: ev — редактируемое мероприятие; type — тип нового («Встреча» из календаря, «Аттестация» из бланка); from — откуда открыта (cal, attncard), туда же возврат.
 */
@Component({
  selector: 'app-eventnew',
  imports: [PageHead, EventnewMain, EventnewRepeat, CoverUpload, BusyChart],
  template: `
    <app-page-head [title]="s.id() ? 'Редактирование мероприятия' : 'Добавление мероприятия'" [backTo]="s.id() ? 'eventview' : back().page" [backAttrs]="s.id() ? { ev: s.id() } : undefined" [backLabel]="s.id() ? 'К мероприятию' : back().label" />
    <div eventnew-main></div>
    @let f = s.f();
    @if (f.type === 'Мероприятие') {
      <div cover-upload [value]="f.cover" (valueChange)="s.set('cover', $event)"></div>
    }
    <div eventnew-repeat></div>
    <div class="c mb" busy-chart [people]="f.people" (peopleChange)="s.set('people', $event)" [pool]="pool" [roles]="roles" [date]="f.date" [t1]="f.time" [t2]="f.date === f.endDate ? f.endTime : ''" (move)="moveTo($event)"></div>
    @if (s.err()) {
      <div class="pqerr">{{ s.err() }}</div>
    }
    <div class="c ipisl">
      <div class="ipff"><button class="btn pri" (click)="save()">{{ s.id() ? 'Сохранить' : 'Создать' }}</button></div>
    </div>
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
  protected readonly back = computed(() =>
    this.from() === 'cal' ? { page: 'cal', label: 'К календарю' } : this.from() === 'attncard' ? { page: 'attncard', label: 'К бланку аттестации' } : { page: 'events', label: 'К мероприятиям' },
  );

  /** встреча: клик по свободному часу на шкале занятости — новое время (окончание — в тот же день) */
  protected moveTo(t: { date: string; t1: string; t2: string }): void {
    this.s.f.set({ ...this.s.f(), date: t.date, time: t.t1, endDate: t.date, endTime: t.t2 });
  }

  constructor() {
    effect(() => {
      const id = this.ev(), type = this.type();
      untracked(() => {
        this.s.id.set(id);
        const f = (id && this.store.formOf(id)) || emptyEvent();
        // «Весь день» в форме нет — время всегда указывается; тип нового — из адреса
        this.s.f.set({ ...f, allDay: false, type: !id && EVENT_TYPES.includes(type) ? type : f.type });
      });
    });
  }

  protected save(): void {
    const e = this.s.check();
    if (e) return this.s.err.set(e);
    const f = this.s.f(), id = this.s.id();
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
}
