import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { Icon } from '../../../shared/ui/icon/icon';
import { StatCell } from '../../../shared/ui/stat-cell/stat-cell';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { VACATION } from '../../../data/home.data';

/** Блок «Отпуск»: сколько дней использовано, сколько доступно, ближайший отпуск */
@Component({
  selector: 'app-home-vacation',
  imports: [Card, Icon, StatCell, Tooltip],
  template: ` <app-card title="Отпуск" open="vac">
    <div class="cb">
      <div class="vr">
        <span class="l">Использовано</span
        ><span class="v"
          >{{ v.used }} / <span class="dgt">{{ v.total }}</span
          ><span class="vinf" [appTip]="'Сколько дней|' + v.tip"><app-icon name="info" /></span
        ></span>
      </div>
      <div class="bar ok"><i [style.width.%]="v.percent"></i></div>
      <app-stat-cell label="Доступно" wide>{{ v.available }}</app-stat-cell>
      <app-stat-cell label="Ближайший отпуск" wide
        >{{ v.nearest }}<small>{{ v.nearestNote }}</small>
        <button
          statAction
          class="actb"
          title="Изменить"
          (click)="toast.show('Отпуск', 'Изменение дат ближайшего отпуска.')"
        >
          <app-icon name="edit" />
        </button>
      </app-stat-cell>
      <div class="st2">
        <button class="btn raised" style="flex:1" (click)="nav.go('vac')">Подтвердить</button
        ><button class="btn pri" style="flex:1" (click)="nav.go('vac')">Добавить</button>
      </div>
    </div>
  </app-card>`,
  styleUrl: './home-vacation.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-vacation' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeVacation {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
  protected readonly v = VACATION;
}
