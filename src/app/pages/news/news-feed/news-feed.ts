import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { DemoState } from '../../../core/demo/demo-state.service';
import { NewsStore } from '../../../core/demo/news-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { NewsPost } from '../../../widgets/news-post/news-post';
import { NewsState } from '../news.state';

/** Блок «Лента»: посты по фильтрам; у админа — «⋮» (редактировать, удалить с подтверждением). */
@Component({
  selector: '[news-feed]',
  imports: [NewsPost],
  template: `
    <div class="nfeed">
      @for (n of s.list(); track n.id) {
        <app-news-post
          [post]="n"
          [admin]="demo.newsRole() === 'adm'"
          (open)="open($event)"
          (edit)="nav.go('newsnew', { edit: $event })"
          (remove)="remove($event)"
        />
      } @empty {
        <div class="empty sm">Новости не найдены</div>
      }
    </div>
  `,
  styleUrl: './news-feed.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsFeed {
  protected readonly s = inject(NewsState);
  protected readonly demo = inject(DemoState);
  protected readonly nav = inject(NavService);
  private readonly store = inject(NewsStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected open(id: string): void {
    this.nav.go('newscard', { news: id });
  }

  protected async remove(id: string): Promise<void> {
    const n = this.store.list().find((x) => x.id === id);
    if (!n) return;
    const ok = await this.confirm.ask({
      title: 'Удалить новость?',
      text: `Новость **${n.title}** будет удалена вместе с комментариями и отметками. Восстановить ее не получится.`,
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.store.remove(id);
    this.toast.show('Новость удалена', `${n.title} — больше не показывается в ленте.`);
  }
}
