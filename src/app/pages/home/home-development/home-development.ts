import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { DEVELOPMENT } from '../../../data/home.data';

/** Блок «Мое развитие»: итоги оценки по кварталам (результат + ценности), позиция в матрице 9-box, оценка 360° */
@Component({
  selector: 'app-home-development',
  imports: [Card, Tooltip],
  template: ` <app-card title="Мое развитие" open="growth">
    <div class="cb qdev">
      <div class="qrow">
        @for (q of d.quarters; track q.period) {
          <span class="qcol"
            ><span class="qgr" [appTip]="q.tip">
              @for (g of q.grades; track $index) {
                <i class="bdg" [class.info]="g.tone === 'info'">{{ g.text }}</i>
              }</span
            ><small>{{ q.period }}</small></span
          >
        }
      </div>
      <span class="q9 qgr" [appTip]="d.nineBox.tip">
        @for (c of cells; track c) {
          <i [class.on]="c === d.nineBox.cell"></i>
        }
      </span>
      <span class="q360 qgr" [appTip]="d.r360.tip"
        ><b>{{ d.r360.value }}</b
        ><small>360°</small></span
      >
    </div>
  </app-card>`,
  styleUrl: './home-development.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-development' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeDevelopment {
  protected readonly d = DEVELOPMENT;
  protected readonly cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
}
