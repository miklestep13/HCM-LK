import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { DEV_KINDS, DEV_PLACEHOLDER, DevState } from '../dev.state';

/** «Мое обучение»: вкладки Курсы / Программы / Мероприятия, поиск и чипсы статусов (несколько сразу) */
@Component({
  selector: '[dev-my-filter]',
  imports: [FilterBar],
  template: `
    <div class="ctabs">
      @for (k of kinds; track k[0]) {
        <span [class.on]="s.kind() === k[0]" (click)="s.setKind(k[0])">{{ k[1] }}</span>
      }
    </div>
    <app-filter-bar [placeholder]="ph[s.kind()]" [(query)]="s.q">
      <div class="fchips">
        @for (c of s.chipList(); track c.key) {
          <button class="fchip" [class.on]="c.on" (click)="s.toggleChip(c.key)">{{ c.label }} <em>{{ c.count }}</em></button>
        }
      </div>
    </app-filter-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevMyFilter {
  protected readonly s = inject(DevState);
  protected readonly kinds = DEV_KINDS;
  protected readonly ph = DEV_PLACEHOLDER;
}
