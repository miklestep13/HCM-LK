import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CT_LEVELS, ctBehavior } from '../../data/career-track.data';
import { Tooltip } from '../../shared/ui/tooltip/tooltip';

/** Полоса уровня компетенции. Пустой уровень — «Не требуется». Подсказка: компетенция, грейд, что умеет сотрудник */
@Component({
  selector: 'ct-level',
  imports: [Tooltip],
  template: `
    @if (k()) {
      <span class="lvw" [class]="'lvw l' + k()" [class.cttip]="!!comp()" role="img" [appTip]="comp() ? tip() : ''" [attr.tabindex]="comp() ? 0 : null">
        <span class="lvd">
          @for (i of dots; track i) {
            <i [class]="i <= k() ? 'l' + k() : ''"></i>
          }
        </span>
      </span>
    } @else {
      <span class="ctna">Не требуется</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtLevel {
  readonly level = input('');
  readonly comp = input('');
  readonly grade = input('');
  protected readonly dots = [1, 2, 3, 4];
  protected readonly k = computed(() => CT_LEVELS.indexOf(this.level()) + 1);
  protected readonly tip = computed(() => {
    const level = this.level();
    return this.comp() + '|Грейд «' + this.grade() + '» · уровень «' + level + '»|' + ctBehavior(this.comp(), level);
  });
}
