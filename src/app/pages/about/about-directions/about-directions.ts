import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ABOUT_WORK } from '../../../data/about-articles.data';
import { NewsPost } from '../../../widgets/news-post/news-post';
import { AboutRail } from '../about-rail/about-rail';

/** «Направления деятельности»: короткие статьи о продуктах, ряд прокручивается. */
@Component({
  selector: '[about-directions]',
  imports: [NewsPost, AboutRail],
  template: `
    <div class="ch"><h3>Направления деятельности</h3></div>
    <div class="cb">
      <div about-rail>
        @for (p of list; track p.id) {
          <app-news-post [post]="p" [plain]="true" (open)="open($event)" />
        }
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutDirections {
  private readonly nav = inject(NavService);
  protected readonly list = ABOUT_WORK;

  protected open(id: string): void {
    this.nav.go('newscard', { news: id });
  }
}
