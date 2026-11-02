import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { GOAL_STAGES } from '../../interface/goal';
import { HomeProfile } from './home-profile/home-profile';
import { HomeDevelopment } from './home-development/home-development';
import { HomeAwards } from './home-awards/home-awards';
import { HomeWallet } from './home-wallet/home-wallet';
import { HomeVacation } from './home-vacation/home-vacation';
import { HomeTimeOff } from './home-time-off/home-time-off';
import { HomeTasks } from './home-tasks/home-tasks';
import { HomeLearning } from './home-learning/home-learning';
import { HomeGoals } from './home-goals/home-goals';
import { HomeIpr } from './home-ipr/home-ipr';
import { HomeColleagues } from './home-colleagues/home-colleagues';
import { HomeRequests } from './home-requests/home-requests';

/**
 * Страница «Мой кабинет → Обзор» (главная).
 * Собрана из блоков: левая колонка — личные данные, центр — задачи и развитие, правая — коллеги и заявки.
 * Порядок блоков меняется здесь, содержимое блока — в его папке.
 */
@Component({
  selector: 'app-home',
  imports: [
    HomeProfile,
    HomeDevelopment,
    HomeAwards,
    HomeWallet,
    HomeVacation,
    HomeTimeOff,
    HomeTasks,
    HomeLearning,
    HomeGoals,
    HomeIpr,
    HomeColleagues,
    HomeRequests,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-home' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnDestroy {
  protected readonly nav = inject(NavService);
  private readonly demo = inject(DemoState);
  /** баннер «Открыт период самооценки» — только на этапе самооценки */
  protected readonly selfBanner = computed(() => this.demo.goalStage() === 'self');

  private readonly unregister = inject(DevPanelService).register({
    id: 'goalStage',
    label: 'Статус карты целей',
    options: GOAL_STAGES.map((s) => ({ value: s.value, label: s.label })),
    value: this.demo.goalStatus,
  });

  ngOnDestroy(): void {
    this.unregister();
  }
}
