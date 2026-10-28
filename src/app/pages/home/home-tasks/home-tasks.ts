import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { ListItem } from '../../../shared/ui/list-item/list-item';
import { NavService } from '../../../core/navigation/nav.service';
import { TASKS } from '../../../data/home.data';

/** Блок «Задания»: ближайшие задания сотрудника со сроком и статусом */
@Component({
  selector: 'app-home-tasks',
  imports: [Card, ListItem],
  template: ` <app-card title="Задания" [counter]="tasks.total" open="mytasks">
    <div class="cb">
      @for (t of tasks.items; track t.id) {
        <app-list-item
          [title]="t.title"
          [meta]="t.meta"
          [badge]="t.badge"
          link
          (click)="nav.go('mytasks')"
        />
      }
    </div>
  </app-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeTasks {
  protected readonly nav = inject(NavService);
  protected readonly tasks = TASKS;
}
