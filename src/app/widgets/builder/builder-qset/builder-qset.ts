import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BLD_CHECKABLE } from '../../../data/builder.data';
import { POLL_RATING_SCALES, POLL_SHORT_FORMATS, POLL_SLIDER_SCALES } from '../../../data/polls.data';
import { PollQuestion } from '../../../interface/poll';
import { Field } from '../../../shared/ui/field/field';
import { NumInput } from '../../../shared/ui/num-input/num-input';
import { Select } from '../../../shared/ui/select/select';
import { BuilderState } from '../builder.state';

/**
 * Дополнительные настройки вопроса — под ответами в выбранном блоке: «Обязательный вопрос», «Комментарий»,
 * шкала рейтинга (список), шкала ползунка, формат, символы, файлы, поиск по списку, «Другое» (только множественный выбор).
 * Текст, описание и варианты правятся прямо в вопросе; тип — в панели блока. Рейтинг — только числа (без «Вид»).
 */
@Component({
  selector: '[bld-qset]',
  imports: [Field, Select, NumInput],
  template: `
    @let Q = q();
    @let _v = s.ver();
    <div class="bldsws">
      <label class="swt"><input type="checkbox" [checked]="Q.req" (change)="flag(Q, 'req', $event)" /><i></i><span>Обязательный вопрос</span></label>
      <label class="swt" title="Под ответом — поле для комментария"><input type="checkbox" [checked]="Q.cmt" (change)="flag(Q, 'cmt', $event)" /><i></i><span>Комментарий</span></label>
    </div>
    @switch (Q.t) {
      @case ('rating') {
        <app-field label="Шкала" filled>
          <app-select [options]="scaleLabels" [value]="scaleLabel(Q)" (valueChange)="setScale(Q, $event)" />
        </app-field>
      }
      @case ('long') {
        <app-field label="Максимум символов" [filled]="!!Q.max"><app-num-input [min]="0" placeholder="Без ограничений" [value]="Q.max" (valueChange)="setV(Q, 'max', $event)" /></app-field>
      }
      @case ('short') {
        <app-field label="Формат ответа" filled><app-select [options]="formats" [value]="Q.fmt" (valueChange)="Q.fmt = $event; s.touch()" /></app-field>
        <app-field label="Максимум символов" [filled]="!!Q.max"><app-num-input [min]="0" placeholder="Без ограничений" [value]="Q.max" (valueChange)="setV(Q, 'max', $event)" /></app-field>
      }
      @case ('slider') {
        <app-field label="Шкала" filled>
          <app-select [options]="sliderLabels" [value]="sliderLabel(Q)" (valueChange)="setSlider(Q, $event)" />
        </app-field>
      }
      @case ('file') {
        <app-field label="Типы файлов" [filled]="!!Q.ph"><input class="fin" placeholder="Например: PDF, DOCX" [value]="Q.ph" (input)="set(Q, 'ph', $event)" /></app-field>
        <app-field label="Максимальный размер, МБ" [filled]="!!Q.max"><app-num-input [min]="1" [value]="Q.max" (valueChange)="setV(Q, 'max', $event)" /></app-field>
      }
      @case ('drop') {
        <label class="ckb anon"><input type="checkbox" [checked]="Q.srch" (change)="flag(Q, 'srch', $event)" /><i></i><span>Поиск по списку</span></label>
      }
      @case ('multi') {
        @if (!correct()) {
          <label class="ckb anon"><input type="checkbox" [checked]="Q.other" (change)="flag(Q, 'other', $event)" /><i></i><span>Вариант «Другое»</span></label>
        }
        <app-field label="Минимум выбранных" [filled]="!!Q.mn"><app-num-input [min]="0" placeholder="Нет" [value]="Q.mn" (valueChange)="setV(Q, 'mn', $event)" /></app-field>
        <app-field label="Максимум выбранных" [filled]="!!Q.mx"><app-num-input [min]="0" placeholder="Нет" [value]="Q.mx" (valueChange)="setV(Q, 'mx', $event)" /></app-field>
      }
    }
  `,
  host: { class: 'bldqs' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldQset {
  readonly q = input.required<PollQuestion>();
  protected readonly s = inject(BuilderState);
  protected readonly scales = POLL_RATING_SCALES;
  protected readonly scaleLabels = POLL_RATING_SCALES.map((x) => x[1]);
  protected readonly sliderScales = POLL_SLIDER_SCALES;
  protected readonly sliderLabels = POLL_SLIDER_SCALES.map((x) => x.label);
  protected readonly formats = POLL_SHORT_FORMATS;
  /** отмечать верный ответ: тест или курс и тип с вариантами */
  protected readonly correct = computed(() => !!this.s.conf().correct && BLD_CHECKABLE.includes(this.q().t));

  protected set(q: PollQuestion, k: 'ph' | 'max' | 'mn' | 'mx' | 'unit', e: Event): void {
    q[k] = (e.target as HTMLInputElement).value;
    this.s.touch();
  }
  protected setV(q: PollQuestion, k: 'max' | 'mn' | 'mx', v: string): void {
    q[k] = v;
    this.s.touch();
  }
  protected flag(q: PollQuestion, k: 'req' | 'other' | 'srch' | 'cmt', e: Event): void {
    q[k] = (e.target as HTMLInputElement).checked;
    this.s.touch();
  }
  protected scaleLabel(q: PollQuestion): string {
    return this.scales.find((x) => x[0] === q.scale)?.[1] ?? this.scales[1][1];
  }
  protected setScale(q: PollQuestion, label: string): void {
    const n = this.scales.find((x) => x[1] === label)?.[0] ?? 5;
    q.scale = n;
    q.view = 'num';
    q.lo = '';
    q.hi = '';
    this.s.touch();
  }
  protected sliderLabel(q: PollQuestion): string {
    return (
      this.sliderScales.find((x) => x.mn === q.mn && x.mx === q.mx && x.unit === q.unit)?.label ??
      this.sliderScales[0].label
    );
  }
  protected setSlider(q: PollQuestion, label: string): void {
    const x = this.sliderScales.find((s) => s.label === label) ?? this.sliderScales[0];
    q.mn = x.mn;
    q.mx = x.mx;
    q.unit = x.unit;
    q.lo = x.lo;
    q.hi = x.hi;
    this.s.touch();
  }
}
