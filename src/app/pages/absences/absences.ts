import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { AbsenceStore } from '../../core/demo/absence-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { ABS_APPLY } from '../../data/absence.data';
import { Float } from '../../shared/ui/float/float';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { AbsencesBanner } from './absences-banner/absences-banner';
import { AbsencesEntry } from './absences-entry/absences-entry';
import { AbsencesGantt } from './absences-gantt/absences-gantt';
import { AbsencesPlan } from './absences-plan/absences-plan';
import { AbsencesStats } from './absences-stats/absences-stats';
import { AbsencesState } from './absences.state';

/**
 * «Мой кабинет → Календарь → График отсутствий»: «Оформить ▾» — заявка на отсутствие выбранного вида; баннер периода планирования отпусков на следующий год, статистика отпуска и отгулов (как на обзоре);
 * диаграмма Ганта по мне, моей команде и добавленным коллегам — месяц или год, фильтр по виду отсутствия и статусу.
 * Период планирования открыт / закрыт — в dev-панели.
 */
@Component({
  selector: 'app-absences',
  imports: [PageHead, Icon, Float, AbsencesBanner, AbsencesStats, AbsencesGantt, AbsencesEntry, AbsencesPlan],
  template: `
    <app-page-head title="График отсутствий">
      <button #addBtn class="btn pri abaddb" [class.on]="menu()" (click)="menu.set(!menu()); $event.stopPropagation()">
        Оформить<app-icon name="chevDown" />
      </button>
    </app-page-head>
    @if (menu()) {
      <div class="fpop amenu" [appFloat]="addBtn" (click)="$event.stopPropagation()">
        @for (k of kinds(); track k.k) {
          <button class="ami" (click)="menu.set(false); s.add(k.k)">{{ k.label }}</button>
        }
      </div>
    }
    @if (store.planOpen()) {
      <div absences-banner (plan)="s.add('vac')"></div>
    }
    <div absences-stats></div>
    <div absences-gantt></div>
    <app-absences-entry />
    <app-absences-plan />
  `,
  styleUrl: './absences.scss',
  providers: [AbsencesState],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-absences', '(document:click)': 'menu.set(false)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Absences implements OnDestroy {
  protected readonly s = inject(AbsencesState);
  /** основной отпуск — только в период планирования */
  protected readonly kinds = computed(() => ABS_APPLY.filter((k) => !k.plan || this.store.planOpen()));
  /** список «Оформить ▾»: вид отсутствия → сайдбар заявки */
  protected readonly menu = signal(false);
  protected readonly store = inject(AbsenceStore);
  private readonly off = inject(DevPanelService).register({
    id: 'absPlan',
    label: 'Период планирования отпусков',
    options: [
      { value: 'open', label: 'Открыт' },
      { value: 'closed', label: 'Закрыт' },
    ],
    value: devValue<'open' | 'closed'>(
      () => (this.store.planOpen() ? 'open' : 'closed'),
      (v) => this.store.planOpen.set(v === 'open'),
    ),
  });
  private readonly offRole = inject(DevPanelService).register({
    id: 'absRole',
    label: 'Роль в графике отсутствий',
    options: [
      { value: 'emp', label: 'Сотрудник' },
      { value: 'admin', label: 'Администратор' },
    ],
    value: devValue<'emp' | 'admin'>(
      () => this.store.role(),
      (v) => this.store.role.set(v),
    ),
  });
  ngOnDestroy(): void {
    this.off();
    this.offRole();
  }
}
