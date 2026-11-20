import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { personAvatar } from '../../../data/avatar';
import { CP_EXPERTS } from '../../../data/career-path.data';
import { CpExpert } from '../../../interface/career-path';

/** «Лидеры и эксперты»: лидер и эксперты, тег снизу */
@Component({
  selector: '[career-experts]',
  template: `
    <div class="ch"><h3>Лидеры и эксперты<span class="chip">{{ list.length }}</span></h3></div>
    <div class="cb">
      @for (e of list; track e.name) {
        <div class="mem" (click)="nav.go('emp', { emp: e.name })">
          @if (av(e).photo; as photo) {
            <img class="av" [src]="photo" alt="" />
          } @else {
            <span class="av" [class]="av(e).cls"></span>
          }
          <div class="i">
            <div class="nm">{{ e.name }}</div>
            <div class="rl">{{ e.pos }}</div>
            <div class="gltags"><span class="bdg">{{ e.tag }}</span></div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './career-experts.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-experts' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerExperts {
  protected readonly nav = inject(NavService);
  protected readonly list = CP_EXPERTS;
  protected av(e: CpExpert) {
    return personAvatar(e.name);
  }
}
