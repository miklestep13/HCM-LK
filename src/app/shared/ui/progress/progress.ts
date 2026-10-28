import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Tone } from '../../../interface/common';

/** Прогресс: подпись и значение над полосой (.pr + .bar). <app-progress label="Выполнено" value="29%" [percent]="29" tone="dg" /> */
@Component({
  selector: 'app-progress',
  template: ` @if (label() || value()) {
      <div class="pr">
        <span class="l">{{ label() }}</span
        ><span class="v">{{ value() }}</span>
      </div>
    }
    <div class="bar" [class.ok]="tone() === 'ok'" [class.dg]="tone() === 'dg'">
      <i [style.width.%]="percent()"></i>
    </div>
    @if (caption()) {
      <div class="prs">{{ caption() }}</div>
    }`,
  host: { style: 'display:block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Progress {
  readonly label = input('');
  readonly value = input('');
  readonly percent = input(0);
  readonly tone = input<Tone>('');
  readonly caption = input('');
}
