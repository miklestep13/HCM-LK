import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { BENEF_OFFERS } from '../../../data/benef.data';

/**
 * «Кафетерий льгот»: строки как у виджета статей (эмодзи, название, пояснение).
 * Клик открывает карточку льготы (как новость): pages/benef/benefcard.
 */
@Component({
  selector: '[benef-cafe]',
  template: `
    <div class="ch"><h3>Кафетерий льгот</h3></div>
    <div class="cb bfcafe">
      @for (o of offers; track o.id) {
        <button type="button" class="bfi" (click)="nav.go('benefcard', { bf: o.id })">
          <span class="bfem" aria-hidden="true">{{ o.emoji }}</span>
          <span class="i">
            <span class="bft">{{ o.title }}</span>
            <span class="bfd">{{ o.text }}</span>
          </span>
        </button>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefCafe {
  protected readonly nav = inject(NavService);
  protected readonly offers = BENEF_OFFERS;
}
