import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { NewsFeed } from './news-feed/news-feed';
import { NewsFilters } from './news-filters/news-filters';
import { NewsSide } from './news-side/news-side';
import { NewsState } from './news.state';

/**
 * Страница «Новости» (ключ прототипа: news): поиск и фильтры, лента, справа — мероприятия и опрос.
 * Демо-роль (сотрудник / админ) — в dev-панели: админ видит «Добавить» и действия у постов.
 */
@Component({
  selector: 'app-news',
  imports: [PageHead, NewsFilters, NewsFeed, NewsSide],
  providers: [NewsState],
  template: `
    <app-page-head title="Новости">
      @if (demo.newsRole() === 'adm') {
        <span class="nchead"
          ><button class="btn pri" (click)="nav.go('newsnew')">Добавить</button></span
        >
      }
    </app-page-head>
    <div class="c cmbar" news-filters></div>
    <div class="nlay">
      <div class="c cofeed nwfeed" news-feed></div>
      <div class="nsidew"><div class="nside" news-side></div></div>
    </div>
  `,
  styleUrl: './news.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-news' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class News implements OnDestroy {
  protected readonly demo = inject(DemoState);
  protected readonly nav = inject(NavService);
  private readonly off = inject(DevPanelService).register({
    id: 'newsRole',
    label: 'Роль в новостях',
    options: [
      { value: 'emp', label: 'Сотрудник' },
      { value: 'adm', label: 'Админ' },
    ],
    value: this.demo.newsRole,
  });
  ngOnDestroy(): void {
    this.off();
  }
}
