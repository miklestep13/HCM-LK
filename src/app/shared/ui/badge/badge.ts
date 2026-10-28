import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { Tone } from '../../../interface/common';

/** Бейдж статуса (.bdg): <app-badge tone="warn">В работе</app-badge>. Хост сам является .bdg — работает в сетке .item */
@Component({
  selector: 'app-badge',
  template: '<ng-content />',
  host: {
    class: 'bdg',
    '[class.ok]': "tone()==='ok'",
    '[class.warn]': "tone()==='warn'",
    '[class.dg]': "tone()==='dg'",
    '[class.info]': "tone()==='info'",
    '[class.sm]': 'sm()',
    '[class.live]': 'live()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  readonly tone = input<Tone>('');
  readonly sm = input(false, { transform: booleanAttribute });
  readonly live = input(false, { transform: booleanAttribute });
}
