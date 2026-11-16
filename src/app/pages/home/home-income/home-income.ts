import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Card } from '../../../shared/ui/card/card';
import { Icon } from '../../../shared/ui/icon/icon';
import { INCOME } from '../../../data/income.data';
import { fmt } from '../../../data/shop.data';

/**
 * Блок «Доход»: ежемесячный доход и последние начисления.
 * Суммы скрыты по умолчанию, как в банковских приложениях: вместо цифр — размытая заглушка из 7 знаков.
 * Показать / скрыть — кнопка-глаз справа от суммы или щелчок по любой сумме; цифры проявляются из размытия.
 */
@Component({
  selector: 'app-home-income',
  imports: [Card, Icon, NgTemplateOutlet],
  template: ` <app-card title="Доход" open="benef" openTitle="Доходы и льготы" cls="hmin">
    <div class="cb">
      <div class="hminsum">
        <div class="hminrow">
          <ng-container *ngTemplateOutlet="amt; context: { $implicit: d.monthly, sign: '', big: true }" />
          <button
            type="button"
            class="hmineye"
            [attr.aria-pressed]="shown()"
            [attr.aria-label]="shown() ? 'Скрыть суммы' : 'Показать суммы'"
            [title]="shown() ? 'Скрыть суммы' : 'Показать суммы'"
            (click)="toggle()"
          >
            <app-icon [name]="shown() ? 'eyeOff' : 'eye'" />
          </button>
        </div>
        <div class="hminsub">{{ d.note }}</div>
      </div>
      <div class="hminops">
        <div class="hmincap">Последние начисления</div>
        @for (o of d.ops; track o.kind + o.period) {
          <div class="kv">
            <span class="k">{{ o.kind }} за {{ o.period }}<small>{{ o.paid }}</small></span>
            <span class="v">
              <ng-container *ngTemplateOutlet="amt; context: { $implicit: o.amt, sign: '+', big: false }" />
            </span>
          </div>
        }
      </div>
    </div>

    <!-- сумма-кнопка: цифры или размытая заглушка -->
    <ng-template #amt let-n let-sign="sign" let-big="big">
      <button
        type="button"
        class="hminamt"
        [class.big]="big"
        [class.hid]="!shown()"
        [attr.aria-label]="shown() ? sign + fmt(n) + ' ₽. Скрыть суммы' : 'Сумма скрыта. Показать суммы'"
        (click)="toggle()"
      >
        @if (shown()) {
          <span class="hminval">{{ sign }}{{ fmt(n) }} ₽</span>
        } @else {
          <span class="hminmask" aria-hidden="true">{{ mask }}</span>
        }
      </button>
    </ng-template>
  </app-card>`,
  styleUrl: './home-income.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-income' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIncome {
  protected readonly d = INCOME;
  protected readonly fmt = fmt;
  /** заглушка под размытием: всегда 7 знаков, чтобы по ширине не угадать сумму */
  protected readonly mask = '0 000 000';
  /** суммы показаны; по умолчанию скрыты */
  protected readonly shown = signal(false);

  protected toggle(): void {
    this.shown.update((v) => !v);
  }
}
