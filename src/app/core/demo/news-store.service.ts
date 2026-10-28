import { Injectable, signal } from '@angular/core';
import { NEWS } from '../../data/news.data';
import { NewsPost } from '../../interface/news';

/** Лента новостей в демо: исходные данные из data/news.data.ts, удаление и лайки живут до перезагрузки страницы. */
@Injectable({ providedIn: 'root' })
export class NewsStore {
  readonly list = signal<NewsPost[]>(NEWS.map((n) => ({ ...n })));
  /** отмеченные лайком (id) */
  readonly liked = signal(new Set<string>());

  remove(id: string): void {
    this.list.update((l) => l.filter((n) => n.id !== id));
  }
  toggleLike(id: string): void {
    const s = new Set(this.liked());
    s.has(id) ? s.delete(id) : s.add(id);
    this.liked.set(s);
  }
}
