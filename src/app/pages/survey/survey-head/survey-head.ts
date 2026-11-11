import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SURVEY_STATUS_TONE } from '../../../data/surveys.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { ObjectHead } from '../../../shared/ui/object-head/object-head';
import { SurveyPassState } from '../survey.state';

/**
 * Шапка опроса — шапка объекта (shared/ui/object-head): название, статус и «Анонимный»;
 * серые плитки показателей: срок (дата) или дата прохождения, время, вопросов (анонимность — бейджем «Анонимный» у названия);
 * пройденный — уведомление «Ответы отправлены»; вступление; прогресс «Выполнено», под полосой «Отвечено N из M».
 * 9-box: название и вводная опроса руководителя, подзаголовок — команда; плитки «Сотрудников», «Оценок».
 */
@Component({
  selector: '[survey-head]',
  imports: [ObjectHead, Icon],
  template: `
    @let S = p.survey();
    @let N = p.nineBox;
    <div app-object-head [title]="p.nine() ? N.title : S.title" [desc]="p.nine() ? N.intro : p.form.intro" [kpis]="kpis()" [progress]="progress()">
      <!-- 9-box: команда (срок — в плитке «Срок») -->
      @if (p.nine()) {
        <span ohSub>Команда «{{ N.team }}»</span>
      }
      <span ohStatus class="bdg" [class]="tone[S.status]">{{ S.status }}</span>
      @if (S.anon && !p.nine()) {
        <span ohStatus class="bdg svanon"><app-icon name="lock" />Анонимный</span>
      }
      @if (p.ro()) {
        <div class="ohnote"><b>Ответы отправлены {{ S.doneAt }}</b>Изменить их нельзя.</div>
      }
    </div>
  `,
  host: { style: 'display:block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyHead {
  protected readonly p = inject(SurveyPassState);
  protected readonly tone = SURVEY_STATUS_TONE;
  /** прогресс: «Выполнено», процент, под полосой «Отвечено N из M» */
  protected readonly progress = computed(() => {
    const n = this.p.questions.length,
      a = this.p.answeredN(),
      pct = Math.round((a / n) * 100);
    return { label: 'Выполнено', value: pct + '%', percent: pct, tone: pct === 100 ? ('ok' as const) : ('' as const), caption: `Отвечено ${a} из ${n}` };
  });
  protected readonly kpis = computed(() => {
    const S = this.p.survey();
    return [
      // срок — датой, обычным черным шрифтом; у пройденного — дата прохождения
      this.p.ro() ? { label: 'Пройден', value: S.doneAt ?? S.end ?? '—' } : { label: 'Срок', value: this.p.nine() ? 'до ' + this.p.nineBox.due : S.end ? 'до ' + S.end : 'Без срока' },
      { label: 'Время прохождения', value: '≈ ' + S.minutes + ' мин' },
      ...(this.p.nine()
        ? [{ label: 'Сотрудников', value: String(this.p.nineBox.employees.length) }, { label: 'Оценок', value: String(this.p.questions.length) }]
        : [{ label: 'Вопросов', value: String(this.p.questions.length) }]),
    ];
  });
}
