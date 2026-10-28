import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NewsStore } from '../../core/demo/news-store.service';
import { COMPANY_AVA, COMPANY_NAME } from '../../data/news.data';
import { NewsPost as NewsPostData } from '../../interface/news';
import { Icon } from '../../shared/ui/icon/icon';

/**
 * Пост ленты новостей: автор → дата → обложка → заголовок → лид → теги → лайки/комментарии/просмотры.
 * Используется в «Компания → Обзор» (лента) и в разделе «Новости».
 * compact — короткий вид («Похожие новости»): заголовок h4, без лида.
 * admin — у автора кнопка «⋮» с действиями «Редактировать» и «Удалить».
 */
@Component({
  selector: 'app-news-post',
  imports: [Icon],
  templateUrl: './news-post.html',
  styleUrl: './news-post.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'npost',
    '[class.nocov]': '!post().img',
    '(click)': 'open.emit(post().id)',
    '(document:click)': 'menu.set(null)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPost {
  readonly post = input.required<NewsPostData>();
  readonly compact = input(false);
  readonly admin = input(false);
  /** клик по посту или по «Комментарии» — открыть новость */
  readonly open = output<string>();
  readonly edit = output<string>();
  readonly remove = output<string>();

  private readonly store = inject(NewsStore);
  protected readonly author = COMPANY_NAME;
  protected readonly ava = COMPANY_AVA;
  protected readonly liked = computed(() => this.store.liked().has(this.post().id));
  protected readonly menu = signal<{ left: number; top: number } | null>(null);

  protected like(e: Event): void {
    e.stopPropagation();
    this.store.toggleLike(this.post().id);
  }
  protected more(e: MouseEvent): void {
    e.stopPropagation();
    if (this.menu()) return this.menu.set(null);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.menu.set({ left: Math.min(r.left, innerWidth - 208), top: r.bottom + 6 });
  }
  protected act(e: Event, a: 'edit' | 'remove'): void {
    e.stopPropagation();
    this.menu.set(null);
    (a === 'edit' ? this.edit : this.remove).emit(this.post().id);
  }
}
