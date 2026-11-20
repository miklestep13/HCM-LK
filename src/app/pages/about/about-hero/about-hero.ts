import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ABOUT_LINE } from '../../../data/about.data';
import { ABOUT_STORY } from '../../../data/about-articles.data';
import { NewsPost } from '../../../widgets/news-post/news-post';

/** Первая статья на всю ширину: представление банка и ссылка на сайт. */
@Component({
  selector: '[about-hero]',
  imports: [NewsPost],
  template: `
    <app-news-post class="ab-hero" [post]="post" [plain]="true" (open)="open($event)">
      <a npAct class="btn raised" [href]="site" target="_blank" rel="noopener" (click)="$event.stopPropagation()">Перейти на сайт</a>
    </app-news-post>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutHero {
  private readonly nav = inject(NavService);
  protected readonly post = ABOUT_STORY;
  protected readonly site = ABOUT_LINE.siteHref;

  protected open(id: string): void {
    this.nav.go('newscard', { news: id });
  }
}
