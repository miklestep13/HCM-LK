import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, inject } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { GROWTH_BY_GOAL_STAGE, GROWTH_STAGES } from '../../data/growth.data';
import { GoalStage } from '../../interface/goal';
import { GrowthStage } from '../../interface/growth';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Growth360 } from './growth-360/growth-360';
import { GrowthComps } from './growth-comps/growth-comps';
import { GrowthNote } from './growth-note/growth-note';
import { GrowthRating } from './growth-rating/growth-rating';

/**
 * «Мой кабинет → Развитие»: рейтинг 9-box, оценка 360 (радар и выводы), компетенции по профилю должности.
 * Этап цикла оценки (dev-панель) общий с картой целей: «Период идет», «Самооценка», «На рассмотрении», «Итог».
 */
@Component({
  selector: 'app-growth',
  imports: [PageHead, GrowthNote, GrowthRating, Growth360, GrowthComps],
  template: `
    <app-page-head title="Развитие" />
    @if (stage() !== 'plan') {
      <div class="c mb grnote" growth-note [stage]="stage()"></div>
    }
    <div class="c mb" growth-rating [stage]="stage()"></div>
    <div class="c mb" growth-360 [stage]="stage()"></div>
    <div class="c" growth-comps></div>
  `,
  styleUrl: './growth.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-growth' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Growth implements OnDestroy {
  private readonly demo = inject(DemoState);
  protected readonly stage = computed<GrowthStage>(() => (this.demo.growthDone() ? 'done' : GROWTH_BY_GOAL_STAGE[this.demo.goalStage()] || 'plan'));

  private readonly unregister = inject(DevPanelService).register({
    id: 'growthStage',
    label: 'Этап цикла оценки',
    options: GROWTH_STAGES,
    value: devValue<GrowthStage>(
      () => this.stage(),
      (v) => {
        this.demo.growthDone.set(v === 'done');
        if (v !== 'done') this.demo.goalStage.set(v as GoalStage);
      },
    ),
  });

  ngOnDestroy(): void {
    this.unregister();
  }
}
