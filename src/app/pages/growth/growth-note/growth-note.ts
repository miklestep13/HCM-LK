import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { GROWTH_PERIOD } from '../../../data/growth.data';
import { GrowthStage } from '../../../interface/growth';

/** Уведомление об этапе цикла оценки — над блоками страницы */
@Component({
  selector: '[growth-note]',
  template: `
    <div class="cb">
      <div class="grnt"><b>{{ note()[0] }}</b><span>{{ note()[1] }}</span></div>
      @if (stage() === 'self') {
        <button class="btn pri" (click)="nav.go('myeval')">Перейти к самооценке</button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrowthNote {
  protected readonly nav = inject(NavService);
  readonly stage = input.required<GrowthStage>();
  protected readonly note = computed(() => {
    const c = GROWTH_PERIOD.cur;
    return {
      plan: ['', ''],
      self: ['Идет оценка за ' + c, 'Заполните самооценку до 19.09.2026 — после нее вас оценит руководитель.'],
      wait: ['Оценка за ' + c + ' на рассмотрении', 'Самооценка отправлена. Результат появится после оценки руководителем и калибровки.'],
      done: ['Итог оценки за ' + c + ' опубликован', 'Рейтинг и результаты оценки 360 на этой странице обновлены.'],
    }[this.stage()];
  });
}
