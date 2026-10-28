import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { CommStore } from '../../../core/demo/comm-store.service';
import { DemoState } from '../../../core/demo/demo-state.service';
import { NavService } from '../../../core/navigation/nav.service';
import { COMM_CATS, COMM_MY_ADMIN } from '../../../data/comm.data';
import { plural } from '../../../data/org.data';
import { Community } from '../../../interface/comm';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommCover } from '../../../widgets/comm-cover/comm-cover';
import { CommState } from '../comm.state';

/** Блок «Сетка сообществ»: карточки с обложкой; кнопка зависит от роли (вступить / управлять / редактировать). */
@Component({
  selector: '[comm-grid]',
  imports: [CommCover],
  templateUrl: './comm-grid.html',
  styleUrl: './comm-grid.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommGrid {
  protected readonly s = inject(CommState);
  protected readonly demo = inject(DemoState);
  private readonly nav = inject(NavService);
  private readonly store = inject(CommStore);
  private readonly toast = inject(ToastService);
  protected readonly cats = COMM_CATS;
  protected readonly myAdmin = COMM_MY_ADMIN;
  protected readonly membersText = (n: number) => `${n} ${plural(n, 'участник', 'участника', 'участников')}`;

  protected open(c: Community): void {
    this.nav.go('commone', { cm: c.id, role: this.demo.commRole() });
  }
  protected join(c: Community, e: Event): void {
    e.stopPropagation();
    const [t, m] = this.store.join(c.id);
    this.toast.show(t, m);
  }
  protected edit(e: Event): void {
    e.stopPropagation();
    this.toast.show('Скоро', 'Редактирование сообщества появится на следующей итерации.');
  }
}
