import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { Tone } from '../../../interface/common';

/**
 * Прогресс: подпись и значение над полосой (.pr + .bar). <app-progress label="Выполнено" value="29%" [percent]="29" tone="dg" />
 * below — значение под полосой справа, напротив подписи (caption): «139 из 214 ··· 65%» (таблицы).
 * Цвет полосы по статусу объекта: выполняется (tone '' / 'warn') — желтая, просрочен ('dg') — красная, выполнен ('ok' или 100%) — зеленая.
 */
@Component({
  selector: 'app-progress',
  template: ` @if (!below() && (label() || value())) {
      <div class="pr">
        <span class="l">{{ label() }}</span
        ><span class="v">{{ value() }}</span>
      </div>
    }
    <div class="bar" [class]="'bar ' + cls()">
      <i [style.width.%]="percent()"></i>
    </div>
    @if (below()) {
      <div class="prs prsb"><span>{{ caption() }}</span><b>{{ value() }}</b></div>
    } @else if (caption()) {
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
  readonly below = input(false, { transform: booleanAttribute });
  protected readonly cls = computed(() => {
    const t = this.tone();
    if (t === 'dg') return 'dg';
    if (t === 'ok' || this.percent() >= 100) return 'ok';
    return 'warn';
  });
}
