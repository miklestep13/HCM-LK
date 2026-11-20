import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ABOUT_VALUE_CARDS } from '../../../data/about-articles.data';
import { NewsPost } from '../../../widgets/news-post/news-post';

/** «Наши ценности»: восемь статей, заголовок и лид, ровно по четыре в ряд. */
@Component({
  selector: '[about-values]',
  imports: [NewsPost],
  template: `
    <div class="ch"><h3>Наши ценности</h3></div>
    <div class="cb">
      <div class="ab-grid ab-vals">
        @for (p of list; track p.id) {
          <app-news-post [post]="p" [plain]="true" (open)="open($event)" />
        }
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutValues {
  private readonly nav = inject(NavService);
  protected readonly list = ABOUT_VALUE_CARDS;

  protected open(id: string): void {
    this.nav.go('newscard', { news: id });
  }
}
