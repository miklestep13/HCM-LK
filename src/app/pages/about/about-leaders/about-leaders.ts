import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ABOUT_BOARD_WIDE } from '../../../data/about-articles.data';
import { NewsPost } from '../../../widgets/news-post/news-post';

/** «Слово генерального директора»: заголовок острова, внутри цитата. Фото и текст поровну. */
@Component({
  selector: '[about-leaders]',
  imports: [NewsPost],
  template: `
    <div class="ch"><h3>Слово генерального директора</h3></div>
    <div class="cb">
      <app-news-post [post]="wide" [plain]="true" (open)="open($event)" />
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutLeaders {
  private readonly nav = inject(NavService);
  protected readonly wide = ABOUT_BOARD_WIDE;

  protected open(id: string): void {
    this.nav.go('newscard', { news: id });
  }
}
