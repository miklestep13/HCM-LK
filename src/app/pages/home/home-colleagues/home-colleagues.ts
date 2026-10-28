import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { Badge } from '../../../shared/ui/badge/badge';
import { NavService } from '../../../core/navigation/nav.service';
import { COLLEAGUES } from '../../../data/home.data';

/** Блок «Коллеги»: команда сотрудника — фото, ФИО, должность и статусы (руководитель, отпуск, день рождения) */
@Component({
  selector: 'app-home-colleagues',
  imports: [Card, Badge],
  template: ` <app-card
    title="Коллеги"
    [counter]="people.length"
    open="org"
    openTitle="Оргструктура"
  >
    <div class="cb cbscroll" style="max-height:536px">
      @for (m of people; track m.name) {
        <div class="mem" (click)="nav.go('emp')">
          <img [src]="m.photo" alt="" />
          <div class="i">
            <div class="nm">{{ m.name }}</div>
            <div class="rl">{{ m.role }}</div>
            <div class="gltags">
              @for (t of m.tags; track t.text) {
                <app-badge [tone]="t.tone">{{ t.text }}</app-badge>
              }
            </div>
          </div>
        </div>
      }
    </div>
  </app-card>`,
  styleUrl: './home-colleagues.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-colleagues' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeColleagues {
  protected readonly nav = inject(NavService);
  protected readonly people = COLLEAGUES;
}
