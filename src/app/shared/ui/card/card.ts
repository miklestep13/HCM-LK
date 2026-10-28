import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { NavService } from '../../../core/navigation/nav.service';

/**
 * Карточка-блок (.c): заголовок, счетчик, кнопка перехода в раздел и содержимое.
 * <app-card title="Задания" [counter]="12" open="mytasks"> <div class="cb">…</div> </app-card>
 * Содержимое передается внутрь как есть — обычно это .cb (отступы карточки).
 */
@Component({
  selector: 'app-card',
  imports: [Icon],
  template: ` <div class="c" [class]="cls()">
    @if (title()) {
      <div class="ch">
        <h3>{{ title() }}<ng-content select="[cardTitle]" /></h3>
        @if (counter() != null) {
          <span class="chip">{{ counter() }}</span>
        }
        <ng-content select="[cardActions]" />
        @if (open()) {
          <button
            class="ib2 hubopen"
            [title]="openTitle()"
            [attr.aria-label]="openTitle()"
            (click)="nav.go(open()!)"
          >
            <app-icon name="open" />
          </button>
        }
      </div>
    }
    <ng-content />
  </div>`,
  host: { style: 'display:block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  protected readonly nav = inject(NavService);
  readonly title = input<string>('');
  readonly counter = input<number | string | null>(null);
  /** ключ страницы для кнопки «Открыть раздел» */
  readonly open = input<string | null>(null);
  readonly openTitle = input('Открыть раздел');
  /** дополнительные классы карточки (например, ecard) */
  readonly cls = input<string>('');
}
