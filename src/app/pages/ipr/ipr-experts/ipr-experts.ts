import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IPR_EXPERTS } from '../../../data/ipr.data';
import { avCls } from '../../../data/people.data';

/** «Заключения экспертов» — на этапе «Оценка эксперта» */
@Component({
  selector: '[ipr-experts]',
  template: `
    <div class="ch">
      <h3>Заключения экспертов</h3>
      <span class="chip">{{ list.length }}</span>
    </div>
    <div class="cb">
      @for (x of list; track x.name; let k = $index) {
        <div class="ipexr">
          <div class="ipexh">
            <span class="av" [class]="av(x.name, k + 3)"></span><span class="i"><b>{{ x.name }}</b><small>{{ x.role }}</small></span>
            <span class="bdg" [class]="x.status === 'Согласовано' ? 'ok' : 'info'">{{ x.status }}</span>
          </div>
          @if (x.comment) {
            <div class="iprd"><span class="l">Комментарий</span>{{ x.comment }}</div>
          }
        </div>
      }
    </div>
  `,
  host: { class: 'c mt ipexpc' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprExperts {
  protected readonly list = IPR_EXPERTS;
  protected readonly av = avCls;
}
