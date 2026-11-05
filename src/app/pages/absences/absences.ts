import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { AbsenceStore } from '../../core/demo/absence-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { ABS_REQ_GROUP } from '../../data/absence.data';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { AbsencesBanner } from './absences-banner/absences-banner';
import { AbsencesEntry } from './absences-entry/absences-entry';
import { AbsencesGantt } from './absences-gantt/absences-gantt';
import { AbsencesStats } from './absences-stats/absences-stats';
import { AbsencesState } from './absences.state';

/**
 * «Мой кабинет → Календарь → График отсутствий» — форма просмотра: отсутствия создаются только заявкой (интеграция с Q.HCM).
 * «Оформить заявку» — общая форма заявок прототипа (reqpick), раскрыта группа календарно-табельного учета; «Назад» вернет сюда.
 * Баннер периода планирования отпусков и статистика (отпуск, отгулы); руководитель, открыв график сотрудника, видит наверху сотрудника и его статистику.
 * Диаграмма Ганта по мне, моей команде и добавленным коллегам — дни или год, фильтр по виду отсутствия и статусу.
 * Период планирования открыт / закрыт и роль (сотрудник / руководитель) — в dev-панели.
 */
@Component({
  selector: 'app-absences',
  imports: [PageHead, AbsencesBanner, AbsencesStats, AbsencesGantt, AbsencesEntry],
  template: `
    <app-page-head title="График отсутствий">
      <button class="btn pri abreq" (click)="request()">Оформить заявку</button>
    </app-page-head>
    @if (store.planOpen() && !s.who()) {
      <div absences-banner (plan)="request()"></div>
    }
    <div absences-stats></div>
    <div absences-gantt></div>
    <app-absences-entry />
  `,
  styleUrl: './absences.scss',
  providers: [AbsencesState],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-absences' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Absences implements OnDestroy {
  protected readonly s = inject(AbsencesState);
  protected readonly store = inject(AbsenceStore);
  private readonly nav = inject(NavService);
  /** заявка на отсутствие — общая форма заявок, группа календарно-табельного учета */
  protected request(): void {
    this.nav.go('reqpick', { grp: ABS_REQ_GROUP, back: 'absences' });
  }
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
      { value: 'admin', label: 'Руководитель' },
    ],
    value: devValue<'emp' | 'admin'>(
      () => this.store.role(),
      (v) => {
        this.store.role.set(v);
        this.s.who.set(null);
      },
    ),
  });
  ngOnDestroy(): void {
    this.off();
    this.offRole();
  }
}
