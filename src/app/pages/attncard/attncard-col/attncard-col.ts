import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { Icon } from '../../../shared/ui/icon/icon';

/** Стрелка сворачивания блока бланка (слева от заголовка); выбор запоминается для пары «этап + блок» */
@Component({
  selector: 'button[attncard-col]',
  imports: [Icon],
  template: `<app-icon name="chevSm" />`,
  host: {
    class: 'actb afcol',
    '[attr.title]': 'label()',
    '[attr.aria-label]': 'label()',
    '(click)': '$event.stopPropagation(); s.toggleCold(block())',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardCol {
  protected readonly s = inject(AttestStore);
  /** заголовок блока */
  readonly block = input.required<string>({ alias: 'attncard-col' });
  protected readonly label = computed(() => (this.s.isCold(this.block()) ? 'Развернуть' : 'Свернуть'));
}
