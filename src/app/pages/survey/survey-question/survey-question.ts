import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SurveyAnswer, SurveyQuestion } from '../../../interface/survey';
import { Attach } from '../../../shared/ui/attach/attach';
import { Choice } from '../../../shared/ui/choice/choice';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Matrix } from '../../../shared/ui/matrix/matrix';
import { Rank } from '../../../shared/ui/rank/rank';
import { Rating } from '../../../shared/ui/rating/rating';
import { Scale } from '../../../shared/ui/scale/scale';
import { Select } from '../../../shared/ui/select/select';
import { Slider } from '../../../shared/ui/slider/slider';
import { SurveyPassState } from '../survey.state';

/**
 * Вопрос анкеты: «Вопрос N», заголовок (обязательный — красная *), описание (если есть) и поле ответа по типу:
 * варианты, список, да / нет, шкала, eNPS, звезды, матрица, ранжирование, ползунок, текст, развернутый ответ, дата, файл.
 * Обязательный без ответа после «Завершить» — красная подпись «Ответьте на вопрос». comment — под ответом поле «Комментарий к оценке (необязательно)».
 * 9-box — как в обычном опросе, номер вопроса — внутри карточки сотрудника.
 */
@Component({
  selector: '[survey-question]',
  imports: [Choice, Scale, Rating, Matrix, Rank, Slider, Select, DateField, Attach],
  template: `
    @let Q = q();
    <span class="sqn">Вопрос {{ s.num[Q.id] }}</span>
    <div class="sqt">{{ Q.title }}@if (Q.required) {<span class="sqreq" title="Обязательный вопрос">*</span>}</div>
    @if (Q.desc) {
      <div class="sqd">{{ Q.desc }}</div>
    }
    <div class="sqa">
      @switch (Q.type) {
        @case ('one') {
          <app-choice [options]="Q.options!" [value]="$any(a())" (valueChange)="set($event)" />
        }
        @case ('many') {
          <app-choice multi [max]="Q.max || 0" [other]="!!Q.other" [options]="Q.options!" [value]="$any(a()) ?? []" (valueChange)="set($event)" [otherText]="s.other()[Q.id] || ''" (otherTextChange)="s.setOther(Q.id, $event)" />
        }
        @case ('select') {
          <app-select class="sqsel" [options]="Q.options!" [placeholder]="Q.placeholder || 'Выберите вариант'" [value]="$any(a()) || ''" (valueChange)="set($event)" />
        }
        @case ('yesno') {
          <app-scale class="sqyn" [items]="['Да', 'Нет']" [value]="$any(a()) ?? null" (valueChange)="set($event)" />
        }
        @case ('scale') {
          <app-scale [from]="Q.from ?? 1" [to]="Q.max || 5" [minLabel]="Q.minLabel || ''" [maxLabel]="Q.maxLabel || ''" [value]="$any(a()) ?? null" (valueChange)="set($event)" />
        }
        @case ('nps') {
          <app-scale nps [from]="0" [to]="10" [minLabel]="Q.minLabel || ''" [maxLabel]="Q.maxLabel || ''" [value]="$any(a()) ?? null" (valueChange)="set($event)" />
        }
        @case ('stars') {
          <app-rating [max]="Q.max || 5" [value]="$any(a()) ?? null" (valueChange)="set($event)" />
        }
        @case ('matrix') {
          <app-matrix [rows]="Q.rows!" [cols]="Q.options!" [value]="$any(a()) ?? {}" (valueChange)="set($event)" />
        }
        @case ('rank') {
          <app-rank [options]="Q.options!" [value]="$any(a()) ?? []" (valueChange)="set($event)" />
        }
        @case ('slider') {
          <app-slider [unit]="Q.unit || ''" [minLabel]="Q.minLabel || ''" [maxLabel]="Q.maxLabel || ''" [value]="$any(a()) ?? null" (valueChange)="set($event)" />
        }
        @case ('text') {
          <input class="fin sqin" [placeholder]="Q.placeholder || 'Ваш ответ'" [value]="$any(a()) || ''" (input)="set($any($event.target).value)" />
        }
        @case ('long') {
          @let t = $any(a()) || '';
          <textarea class="fta sqta" rows="4" [attr.maxlength]="Q.max || null" [placeholder]="Q.placeholder || 'Ваш ответ'" [value]="t" (input)="set($any($event.target).value)"></textarea>
          @if (Q.max) {
            <small class="sqcnt">{{ t.length }} / {{ Q.max }}</small>
          }
        }
        @case ('date') {
          <app-date-field class="sqdt" [value]="$any(a()) || ''" (valueChange)="set($event)" />
        }
        @case ('file') {
          <app-attach edit [files]="$any(a()) ?? []" (filesChange)="set($event)" />
        }
      }
    </div>
    @if (Q.comment) {
      <!-- комментарий к оценке — необязательный -->
      <textarea class="fta sqcm" rows="2" placeholder="Комментарий к оценке (необязательно)" [value]="s.comments()[Q.id] || ''" (input)="s.setComment(Q.id, $any($event.target).value)"></textarea>
    }
    @if (s.err(Q)) {
      <div class="sqerr">Ответьте на этот вопрос</div>
    }
  `,
  host: { class: 'sq', '[class.err]': 's.err(q())', '[class.done]': 's.filled(q())', '[id]': "'sq-' + q().id" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyQuestionBlock {
  readonly q = input.required<SurveyQuestion>();
  protected readonly s = inject(SurveyPassState);
  protected readonly a = computed<SurveyAnswer | undefined>(() => this.s.answers()[this.q().id]);
  protected set(v: SurveyAnswer | null): void {
    this.s.set(this.q().id, v);
  }
}
