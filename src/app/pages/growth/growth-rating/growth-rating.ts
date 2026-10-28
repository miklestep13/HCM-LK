import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GROWTH_PERIOD, GROWTH_RATING } from '../../../data/growth.data';
import { GrowthStage } from '../../../interface/growth';

/** Рейтинг сотрудника: позиция в 9-box, оценки за периоды и показатели с изменением */
@Component({
  selector: '[growth-rating]',
  template: `
    <div class="ch"><h3>Рейтинг сотрудника<small>9-box · по итогам оценки за {{ period() }}</small></h3></div>
    <div class="cb">
      <div class="grtop">
        <div class="rbox">
          <div class="rv">{{ r.title }}</div>
          <div class="nine">
            @for (i of cells; track i) {
              <i [class.on]="i === r.box"></i>
            }
          </div>
          <div class="nlab"><span>{{ r.axes[0] }}</span><span>{{ r.axes[1] }}</span></div>
        </div>
        <div class="grr">
          @for (g of r.grades; track g.label) {
            <div class="cell">
              <div class="l">{{ g.label }}</div>
              <div class="g">{{ g.grade }}<small>{{ g.text }}</small></div>
              <div class="d" [class.up]="g.up" [class.dn]="!g.up">{{ g.delta }}</div>
            </div>
          }
          @for (s of r.stats; track s.label) {
            <div class="rst">
              <div class="l">{{ s.label }}</div>
              <div class="v">{{ s.value }}<small>{{ s.unit }}</small></div>
              <div class="d up">{{ s.delta }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrowthRating {
  readonly stage = input.required<GrowthStage>();
  protected readonly r = GROWTH_RATING;
  protected readonly cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly period = computed(() => (this.stage() === 'done' ? GROWTH_PERIOD.cur : GROWTH_PERIOD.prev));
}
