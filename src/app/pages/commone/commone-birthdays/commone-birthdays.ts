import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { commBirthdays } from '../../../data/comm.data';
import { avCls } from '../../../data/people.data';
import { Badge } from '../../../shared/ui/badge/badge';
import { CommoneState } from '../commone.state';

/** «Дни рождения» участников сообщества — та же строка, что в блоке «Дни рождения» на обзоре компании. */
@Component({
  selector: '[commone-birthdays]',
  imports: [Badge],
  template: `
    <div class="ch"><h3>Дни рождения</h3></div>
    <div class="cb">
      @for (x of list(); track x.p.n) {
        <div class="mem" (click)="nav.go('emp', { emp: x.p.n })">
          <span class="av" [class]="av(x.p.n, x.p.av)"></span>
          <div class="i">
            <div class="nm">{{ x.p.n }}</div>
            <div class="rl">{{ x.p.pos }}</div>
            <div class="gltags">
              <app-badge [tone]="x.when === 'Сегодня' ? 'info' : ''">{{ x.when }}</app-badge>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  host: { class: 'c cmbd' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommoneBirthdays {
  private readonly s = inject(CommoneState);
  protected readonly nav = inject(NavService);
  protected readonly av = avCls;
  protected readonly list = computed(() => commBirthdays(this.s.c()!));
}
