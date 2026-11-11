import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BLD_CHECKABLE } from '../../../data/builder.data';
import { POLL_RATING_SCALES, POLL_SHORT_FORMATS } from '../../../data/polls.data';
import { PollQuestion } from '../../../interface/poll';
import { Field } from '../../../shared/ui/field/field';
import { NumInput } from '../../../shared/ui/num-input/num-input';
import { Select } from '../../../shared/ui/select/select';
import { BuilderState } from '../builder.state';

/**
 * Дополнительные настройки вопроса — под ответами в выбранном блоке: «Обязательный вопрос», «Комментарий» (поле под ответом), шкала и вид рейтинга, формат,
 * символы, границы ползунка, файлы, поиск по списку, «Другое», минимум и максимум выбранных.
 * Текст, описание, варианты, строки и столбцы, подписи краев, подсказка в поле ответа и верный ответ правятся прямо в вопросе, тип — в панели блока.
 * В тесте и курсе «Другое» не предлагается — у вопроса есть верный ответ.
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
        <div class="fld"><label class="flab">Шкала</label>
          <div class="seg pnseg">
            @for (x of scales; track x[0]) {
              <span [class.on]="Q.scale === x[0]" (click)="setScale(Q, x[0])">{{ x[1] }}</span>
            }
          </div>
        </div>
        <div class="fld"><label class="flab">Вид</label>
          <div class="seg pnseg">
            @if (Q.scale !== 11) {
              <span [class.on]="Q.view === 'star'" (click)="Q.view = 'star'; s.touch()">Звезды</span>
            }
            <span [class.on]="Q.view === 'num' || Q.scale === 11" (click)="Q.view = 'num'; s.touch()">Числа</span>
          </div>
        </div>
      }
      @case ('long') {
        <app-field label="Максимум символов" [filled]="!!Q.max"><app-num-input [min]="0" placeholder="Без ограничений" [value]="Q.max" (valueChange)="setV(Q, 'max', $event)" /></app-field>
      }
      @case ('short') {
        <app-field label="Формат ответа" filled><app-select [options]="formats" [value]="Q.fmt" (valueChange)="Q.fmt = $event; s.touch()" /></app-field>
        <app-field label="Максимум символов" [filled]="!!Q.max"><app-num-input [min]="0" placeholder="Без ограничений" [value]="Q.max" (valueChange)="setV(Q, 'max', $event)" /></app-field>
      }
      @case ('slider') {
        <app-field label="Минимум" [filled]="!!Q.mn"><app-num-input [value]="Q.mn" (valueChange)="setV(Q, 'mn', $event)" /></app-field>
        <app-field label="Максимум" [filled]="!!Q.mx"><app-num-input [value]="Q.mx" (valueChange)="setV(Q, 'mx', $event)" /></app-field>
        <app-field label="Единица" [filled]="!!Q.unit"><input class="fin" placeholder="Например: %" [value]="Q.unit" (input)="set(Q, 'unit', $event)" /></app-field>
      }
      @case ('file') {
        <app-field label="Типы файлов" [filled]="!!Q.ph"><input class="fin" placeholder="Например: PDF, DOCX" [value]="Q.ph" (input)="set(Q, 'ph', $event)" /></app-field>
        <app-field label="Максимальный размер, МБ" [filled]="!!Q.max"><app-num-input [min]="1" [value]="Q.max" (valueChange)="setV(Q, 'max', $event)" /></app-field>
      }
      @case ('drop') {
        <label class="ckb anon"><input type="checkbox" [checked]="Q.srch" (change)="flag(Q, 'srch', $event)" /><i></i><span>Поиск по списку</span></label>
      }
      @case ('single') {
        @if (!correct()) {
          <label class="ckb anon"><input type="checkbox" [checked]="Q.other" (change)="flag(Q, 'other', $event)" /><i></i><span>Вариант «Другое»</span></label>
        }
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
  protected setScale(q: PollQuestion, n: number): void {
    q.scale = n;
    if (n === 11) q.view = 'num';
    this.s.touch();
  }
}
