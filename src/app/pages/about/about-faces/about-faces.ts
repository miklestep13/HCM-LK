import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ABOUT_FACES } from '../../../data/about-articles.data';
import { NewsPost } from '../../../widgets/news-post/news-post';
import { AboutRail } from '../about-rail/about-rail';

/** «Дополнительные статьи»: новости банка без автора в карточке. Ряд прокручивается. */
@Component({
  selector: '[about-faces]',
  imports: [NewsPost, AboutRail],
  template: `
    <div class="ch"><h3>Дополнительные статьи</h3></div>
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
export class AboutFaces {
  private readonly nav = inject(NavService);
  protected readonly list = ABOUT_FACES;

  protected open(id: string): void {
    this.nav.go('newscard', { news: id });
  }
}
