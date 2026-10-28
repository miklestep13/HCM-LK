import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { NewsStore } from '../../../core/demo/news-store.service';
import { Icon } from '../../../shared/ui/icon/icon';
import { NewsPost } from '../../../widgets/news-post/news-post';

/** Блок «Лента новостей»: посты из data/news.data.ts, клик — карточка новости. */
@Component({
  selector: '[company-feed]',
  imports: [Icon, NewsPost],
  template: `
    <div class="ch">
      <h3>Лента новостей</h3>
      <button
        class="ib2 hubopen"
        title="Открыть раздел"
        aria-label="Открыть раздел"
        (click)="nav.go('news')"
      >
        <app-icon name="open" />
      </button>
    </div>
    <div class="nfeed">
      @for (n of news(); track n.id) {
        <app-news-post [post]="n" (open)="nav.go('newscard', { news: $event })" />
      }
    </div>
  `,
  styleUrl: './company-feed.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyFeed {
  protected readonly nav = inject(NavService);
  protected readonly news = inject(NewsStore).list;
}
