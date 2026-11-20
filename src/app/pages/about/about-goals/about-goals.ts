import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ABOUT_GOALS } from '../../../data/about-articles.data';
import { NewsPost } from '../../../widgets/news-post/news-post';

/** «Миссия»: одна статья. */
@Component({
  selector: '[about-goals]',
  imports: [NewsPost],
  template: `
    <div class="ch"><h3>Миссия</h3></div>
    <div class="cb">
      <app-news-post [post]="post" [plain]="true" (open)="open($event)" />
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutGoals {
  private readonly nav = inject(NavService);
  protected readonly post = ABOUT_GOALS;

  protected open(id: string): void {
    this.nav.go('newscard', { news: id });
  }
}
