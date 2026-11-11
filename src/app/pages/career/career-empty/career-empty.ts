import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { CP_EMPTY, CP_ROLE } from '../../../data/career-path.data';
import { Icon } from '../../../shared/ui/icon/icon';

/** Пустое состояние трека: роль не описана, трек не опубликован, верхний грейд — карточка с пояснением и переходом */
@Component({
  selector: 'app-career-empty',
  imports: [Icon],
  template: `
    <div class="c">
      <div class="cb cpempty">
        <div class="cpemi"><app-icon [name]="kind() === 'top' ? 'arrowUp' : 'info'" /></div>
        <h2>{{ text().title }}</h2>
        <p>{{ text().text }}</p>
        <div class="cpebtns">
          @if (kind() === 'top') {
            <button type="button" class="btn raised" (click)="nav.go('ctrack', { ct: 'roles' })">Смежные роли</button>
            <button type="button" class="btn raised" (click)="nav.go('ctrole', { id: 'r1' })">Профиль роли</button>
          } @else if (kind() === 'unpublished') {
            <button type="button" class="btn raised" (click)="nav.go('ctrack', { ct: 'roles' })">Справочник ролей</button>
          } @else {
            <button type="button" class="btn raised" (click)="nav.go('prof')">Мой профиль</button>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './career-empty.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-empty' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerEmpty {
  readonly kind = input.required<'noassess' | 'norole' | 'unpublished' | 'top'>();
  protected readonly nav = inject(NavService);
  protected readonly role = CP_ROLE;
  protected readonly text = computed(() => CP_EMPTY[this.kind()]);
}
