import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { POLL_FILE_KINDS, POLL_RATING_SCALES, POLL_SLIDER_SCALES } from '../../../data/polls.data';
import { PollQuestion } from '../../../interface/poll';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { BuilderState } from '../builder.state';

/**
 * Дополнительные настройки вопроса — под ответами в выбранном блоке: «Обязательный вопрос», «Комментарий»,
 * шкала рейтинга / ползунка, вид загрузки файла. Текст, описание и варианты правятся прямо в вопросе; тип — в панели блока.
 */
@Component({
  selector: '[bld-qset]',
  imports: [Field, Select],
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
      @case ('slider') {
        <app-field label="Шкала" filled>
          <app-select [options]="sliderLabels" [value]="sliderLabel(Q)" (valueChange)="setSlider(Q, $event)" />
        </app-field>
      }
      @case ('file') {
        <app-field label="Тип загрузки" filled>
          <app-select [options]="fileLabels" [value]="fileLabel(Q)" (valueChange)="setFile(Q, $event)" />
        </app-field>
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
  protected readonly fileKinds = POLL_FILE_KINDS;
  protected readonly fileLabels = POLL_FILE_KINDS.map((x) => x.label);

  protected flag(q: PollQuestion, k: 'req' | 'cmt', e: Event): void {
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
  protected fileLabel(q: PollQuestion): string {
    return this.fileKinds.find((x) => x.id === q.fmt)?.label
      ?? this.fileKinds.find((x) => x.ph === q.ph && x.max === q.max)?.label
      ?? this.fileKinds[0].label;
  }
  protected setFile(q: PollQuestion, label: string): void {
    const x = this.fileKinds.find((f) => f.label === label) ?? this.fileKinds[0];
    q.fmt = x.id;
    q.ph = x.ph;
    q.max = x.max;
    this.s.touch();
  }
}
