import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { AWARDS } from '../../../data/home.data';

/** Блок «Награды»: значки благодарностей с числом получений (подсказка при наведении) */
@Component({
  selector: 'app-home-awards',
  imports: [Card],
  template: ` <app-card title="Награды" open="growth">
    <div class="cb">
      <div class="aw">
        <div class="list" [style.--awn]="awards.length">
          @for (a of awards; track a.title) {
            <span class="awi" [attr.data-tip]="a.tip"
              ><img [src]="a.image" [alt]="a.title" /><b>{{ a.count }}</b></span
            >
          }
        </div>
      </div>
    </div>
  </app-card>`,
  styleUrl: './home-awards.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-awards' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAwards {
  protected readonly awards = AWARDS;
}
