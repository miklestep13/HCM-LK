import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Poll } from '../../../widgets/poll/poll';

/** Блок «Опрос»: карточка с виджетом опроса. */
@Component({
  selector: '[company-poll]',
  imports: [Poll],
  template: `
    <div class="ch"><h3>Опрос</h3></div>
    <app-poll class="cb" />
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyPoll {}
