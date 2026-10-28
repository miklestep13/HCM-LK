import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { ListItem } from '../../../shared/ui/list-item/list-item';
import { NavService } from '../../../core/navigation/nav.service';
import { REQUESTS } from '../../../data/home.data';

/** Блок «Заявки»: последние заявки сотрудника (название, дата, статус) */
@Component({
  selector: 'app-home-requests',
  imports: [Card, ListItem],
  template: ` <app-card title="Заявки" [counter]="requests.total" open="req">
    <div class="cb">
      @for (r of requests.items; track r.id) {
        <app-list-item
          [title]="r.title"
          [meta]="r.meta"
          [badge]="r.badge"
          link
          (click)="nav.go('req')"
        />
      }
    </div>
  </app-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeRequests {
  protected readonly nav = inject(NavService);
  protected readonly requests = REQUESTS;
}
