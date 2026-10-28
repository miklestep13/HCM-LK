import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { Badge } from '../badge/badge';
import { BadgeData, MetaData } from '../../../interface/common';

/**
 * Строка списка (.item): название, мета-строка с иконками, бейдж справа.
 * <app-list-item title="…" [meta]="[{icon:'calendar', text:'до 01.10.2026'}]" [badge]="{text:'В работе', tone:'warn'}" link />
 */
@Component({
  selector: 'app-list-item',
  imports: [Icon, Badge],
  template: ` <div class="ibd">
      <div class="it">{{ title() }}</div>
      @if (meta().length) {
        <div class="im">
          @for (m of meta(); track $index) {
            <span [class.dgt]="m.danger">
              @if (m.icon) {
                <app-icon [name]="m.icon" />
              }
              {{ m.text }}</span
            >
          }
        </div>
      }
    </div>
    @if (badge(); as b) {
      <app-badge [tone]="b.tone">{{ b.text }}</app-badge>
    }
    <ng-content />`,
  host: { class: 'item', '[class.lnkrow]': 'link()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItem {
  readonly title = input.required<string>();
  readonly meta = input<MetaData[]>([]);
  readonly badge = input<BadgeData | null | undefined>(null);
  /** строка кликабельная (подсветка названия при наведении) */
  readonly link = input(false, { transform: booleanAttribute });
}
