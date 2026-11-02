import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GROWTH_360 } from '../../../data/growth.data';
import { growthGap, growthOther } from '../a360-radar/a360-radar';

/** Итоги оценки 360 отдельным блоком: сильные стороны, зона роста, слепая зона, скрытый потенциал (средний балл — в шапке) */
@Component({
  selector: '[a360-conc]',
  template: `
    <div class="ch"><h3>Итоги оценки</h3></div>
    <div class="cb">
      <div class="a3conc">
        @for (c of conc; track c[1]) {
          <div class="cnc">
            <div class="cnch"><i [style.background]="c[0]"></i><b>{{ c[1] }}</b></div>
            <p>{{ c[2] }}</p>
          </div>
        }
      </div>
    </div>
  `,
  host: { class: 'c mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360Conc {
  /** выводы: по среднему внешних оценок и по разрыву с самооценкой */
  protected readonly conc = (() => {
    const top = [...GROWTH_360].sort((a, b) => growthOther(b) - growthOther(a)),
      gaps = [...GROWTH_360].sort((a, b) => growthGap(b) - growthGap(a)),
      g0 = gaps[0],
      gl = gaps[gaps.length - 1];
    return [
      ['var(--q-success-500)', 'Сильные стороны', top.slice(0, 2).map((c) => `${c.name} (${growthOther(c)}%)`).join(' · ')],
      ['var(--q-error-500)', 'Зона роста', `${top[top.length - 1].name} (${growthOther(top[top.length - 1])}%)`],
      ['var(--q-warning-500)', 'Слепая зона', `${g0.name} (разрыв +${growthGap(g0)} п. п.)`],
      ['var(--q-warning-300)', 'Скрытый потенциал', `${gl.name} (разрыв ${growthGap(gl)} п. п.)`],
    ];
  })();
}
