import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { PollsState } from '../polls/polls.state';
import { PollstatsAnswer } from './pollstats-answer/pollstats-answer';
import { PollstatsHead } from './pollstats-head/pollstats-head';
import { PollstatsPeople } from './pollstats-people/pollstats-people';
import { PollstatsQuestions } from './pollstats-questions/pollstats-questions';
import { PollstatsSummary } from './pollstats-summary/pollstats-summary';
import { PollstatsWaves } from './pollstats-waves/pollstats-waves';
import { PollstatsState, StatsTab } from './pollstats.state';

/**
 * «Управление персоналом → Опросы → итоги» (клик по опросу в списке HR): дашборд по прохождению.
 * Шапка опроса и вкладки: «Участники» — сводка (динамика, вовлеченность, этапы, результаты, подразделения) и таблица участников;
 * «Вопросы» — состав анкеты и таблица вопросов; «Ответы» — детализация выбранного вопроса по его типу.
 * Как на рынке (Google Forms «Сводка / Вопрос / Отдельный ответ», SurveyMonkey Analyze, Culture Amp): сначала общая картина, затем вопрос.
 * Процедуры (волны): в шапке — «Все процедуры» или одна; при «Все» на вкладке «Участники» сверху — сравнение процедур (клик — к процедуре).
 * Параметр адреса poll — номер опроса. Справа от заголовка — «Редактировать» (форма опроса).
 */
@Component({
  selector: 'app-pollstats',
  imports: [PageHead, PollstatsHead, PollstatsSummary, PollstatsPeople, PollstatsQuestions, PollstatsAnswer, PollstatsWaves],
  providers: [PollstatsState],
  template: `
    <app-page-head title="Итоги опроса" backTo="polls" backLabel="К опросам">
      @if (s.poll(); as p) {
        <span class="objacts"><button class="btn raised" (click)="polls.edit(p)">Редактировать</button></span>
      }
    </app-page-head>
    @if (s.stats()) {
      <div pollstats-head></div>
      <div class="c pstabsc">
        <div class="svtabs">
          @for (t of tabs; track t[0]) {
            <span [class.on]="s.tab() === t[0]" (click)="s.tab.set(t[0])">{{ t[1] }}@if (t[0] === 'q') {<span class="pntc">{{ s.stats()!.questions.length }}</span>}@if (t[0] === 'ppl') {<span class="pntc">{{ s.stats()!.parts.length }}</span>}</span>
          }
        </div>
      </div>
      @switch (s.tab()) {
        @case ('ppl') {
          @if (s.waves().length > 1 && !s.curWave()) {
            <div pollstats-waves></div>
          }
          <div pollstats-summary></div>
          <div pollstats-people></div>
        }
        @case ('q') {
          <div pollstats-questions></div>
        }
        @case ('ans') {
          <div pollstats-answer></div>
        }
      }
    }
  `,
  styleUrl: './pollstats.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-pollstats pgst' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pollstats {
  readonly poll = input('');
  protected readonly s = inject(PollstatsState);
  protected readonly polls = inject(PollsState);
  protected readonly tabs: [StatsTab, string][] = [
    ['ppl', 'Участники'],
    ['q', 'Вопросы'],
    ['ans', 'Ответы на вопрос'],
  ];
  constructor() {
    effect(() => {
      const p = this.poll();
      untracked(() => this.s.open(p));
    });
  }
}
