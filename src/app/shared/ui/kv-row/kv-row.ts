import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Строка «метка — значение» (.kv) */
@Component({
  selector: 'app-kv-row',
  template: `<span class="k">{{ label() }}</span
    ><span class="v"><ng-content /></span>`,
  host: { class: 'kv' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KvRow {
  readonly label = input.required<string>();
}
