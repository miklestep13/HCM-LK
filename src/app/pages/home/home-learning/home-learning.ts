import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { Seg } from '../../../shared/ui/seg/seg';
import { Icon } from '../../../shared/ui/icon/icon';
import { Badge } from '../../../shared/ui/badge/badge';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { NavService } from '../../../core/navigation/nav.service';
import { LearnStore } from '../../../core/demo/learn-store.service';
import { LearningKind } from '../../../interface/learning';

/** Блок «Обучение»: курсы, программы и мероприятия сотрудника (вкладки), с прогрессом и статусом */
@Component({
  selector: 'app-home-learning',
  imports: [Card, Seg, Icon, Badge],
  templateUrl: './home-learning.html',
  styleUrl: './home-learning.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-learning' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLearning {
  protected readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly store = inject(LearnStore);
  protected readonly data = this.store.widget;
  protected readonly tab = signal<LearningKind>('crs');
  /** вкладки со счетчиками «в работе» */
  protected readonly tabs = computed(() => {
    const n = this.data().counts;
    return [
      { value: 'crs' as LearningKind, label: 'Курсы', count: n.crs },
      { value: 'prog' as LearningKind, label: 'Программы', count: n.prog },
      { value: 'ev' as LearningKind, label: 'Мероприятия', count: n.ev },
    ];
  });
  protected readonly items = computed(() => this.data()[this.tab()]);

  /** строка — как карточка: страница курса / программы / мероприятия */
  protected open(id: string | undefined): void {
    const t = this.tab();
    if (!id) return this.nav.go('dev');
    if (t === 'prog') this.nav.go('program', { prog: id, lt: 'my' });
    else this.nav.go('course', t === 'ev' ? { crs: id, kind: 'trn', lt: 'my' } : { crs: id, lt: 'my' });
  }
  protected link(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.toast.show('Трансляция', 'Ссылка на трансляцию откроется в новой вкладке.');
  }
}
