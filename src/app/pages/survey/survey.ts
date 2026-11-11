import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { SurveyStatus } from '../../interface/survey';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { SurveyMain } from './survey-main/survey-main';
import { SurveyHead } from './survey-head/survey-head';
import { SurveyPassState, SurveyView } from './survey.state';

const VIEWS: { value: SurveyView; label: string }[] = [
  { value: 'wide', label: 'Обычный' },
  { value: 'narrow', label: 'Узкий' },
  { value: 'nine', label: '9-box' },
];

const STATES: { value: SurveyStatus; label: string }[] = [
  { value: 'Доступен', label: 'Не начат' },
  { value: 'В работе', label: 'В работе' },
  { value: 'Завершен', label: 'Пройден (просмотр)' },
];

/**
 * «Компания → Опросы → прохождение» — одна колонка: шапка опроса (шапка объекта DS: название, статус, срок, вступление, прогресс),
 * под ней все вопросы друг под другом и «Завершить» (все типы ответов). Параметр адреса sv — опрос; состояние — в dev-панели.
 * Вид «Узкий» (dev-панель): колонка 760 px по центру (как опрос руководителя 9-box), без матрицы, ответы на всю ширину, кроме «Да / Нет».
 * Вид «9-box»: та же колонка; блок вопросов (производительность, потенциал — шкала 0–10 с комментарием) повторяется карточкой на каждого сотрудника.
 */
@Component({
  selector: 'app-survey',
  imports: [PageHead, SurveyHead, SurveyMain],
  providers: [SurveyPassState],
  template: `
    <app-page-head [title]="s.survey().kind" backTo="surveys" backLabel="К опросам" />
    <div survey-head></div>
    <div survey-main></div>
  `,
  styleUrl: './survey.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-survey', '[class.svnarrow]': 's.narrow()', '[class.svnine]': 's.nine()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Survey {
  /** опрос (параметр адреса) */
  readonly sv = input('');
  protected readonly s = inject(SurveyPassState);
  private readonly dev = inject(DevPanelService);

  constructor() {
    effect(() => {
      const id = this.sv();
      untracked(() => this.s.open(id));
    });
    effect((onCleanup) => {
      onCleanup(this.dev.register({ id: 'surveyState', label: 'Состояние опроса', options: STATES, value: devValue<SurveyStatus>(() => this.s.survey().status === 'Ожидание' ? 'Доступен' : this.s.survey().status, (v) => this.s.demo(v)) },
        { id: 'surveyView', label: 'Вид прохождения', options: VIEWS, value: devValue<SurveyView>(() => this.s.view(), (v) => this.s.setView(v)) }));
    });
  }
}
