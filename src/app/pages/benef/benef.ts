import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { BenefCafe } from './benef-cafe/benef-cafe';
import { BenefSlip } from './benef-slip/benef-slip';

/** «Мой кабинет → Доходы и льготы»: расчетный листок и кафетерий льгот. Роль 1, Павел Иванов. */
@Component({
  selector: 'app-benef',
  imports: [PageHead, BenefSlip, BenefCafe],
  template: `
    <app-page-head title="Доходы и льготы" [noBack]="true" />
    <div class="c mb" benef-slip></div>
    <div class="c" benef-cafe></div>
  `,
  styleUrl: './benef.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-benef' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Benef {}
