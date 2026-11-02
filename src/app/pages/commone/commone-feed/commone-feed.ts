import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ME_PHOTO, avCls } from '../../../data/people.data';
import { CommPost } from '../../../interface/comm';
import { NewsPost as NewsPostData } from '../../../interface/news';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommCover } from '../../../widgets/comm-cover/comm-cover';
import { NewsPost } from '../../../widgets/news-post/news-post';
import { CommoneState } from '../commone.state';

/**
 * Лента сообщества — та же карточка новости, что на странице «Новости», автор — участник.
 * Открытие, добавление и правка новости — в прототипе (newscard / newsnew с параметрами cm, cmk); удаление — здесь.
 */
@Component({
  selector: '[commone-feed]',
  imports: [NewsPost, CommCover],
  template: `
    <div class="nfeed">
      @for (x of items(); track x.p.key) {
        @let p = x.p;
        <app-news-post class="cmpost" [post]="x.view" [by]="x.by" [admin]="s.adm()" (open)="open(p)" (edit)="edit(p)" (remove)="remove(p)">
          @if (p.img) {
            <div npCover class="npimg" app-comm-cover [comm]="s.c()!" variant="post"></div>
          }
        </app-news-post>
      } @empty {
        <div class="empty sm">Новости не найдены</div>
      }
    </div>
  `,
  host: { class: 'c cofeed nwfeed' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommoneFeed {
  protected readonly s = inject(CommoneState);
  private readonly nav = inject(NavService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly items = computed(() => this.s.list().map((p) => ({ p, view: this.view(p), by: this.by(p) })));

  /** новость сообщества в виде поста ленты */
  private view(p: CommPost): NewsPostData {
    const [date, time] = p.d.split(' ');
    return { id: 'cm-' + this.s.id() + '-' + p.key, cat: 'Мероприятия', title: p.t, lead: p.x, tags: p.tags, date, time, cm: p.cm, vw: p.vw, lk: p.lk, author: 0, authorFio: p.au[0], body: [] };
  }
  private by(p: CommPost) {
    return { name: p.au[0], av: avCls(p.au[0], p.au[3]), photo: p.au[3] === 0 ? ME_PHOTO : undefined };
  }
  protected open(p: CommPost): void {
    this.nav.go('newscard', { cm: this.s.id(), cmk: p.key });
  }
  protected edit(p: CommPost): void {
    this.nav.go('newsnew', { cm: this.s.id(), cmk: p.key });
  }
  protected async remove(p: CommPost): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Удалить новость?',
      text: 'Новость **' + p.t + '** будет удалена из ленты сообщества вместе с комментариями и отметками. Восстановить ее не получится.',
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.s.store.dropPost(this.s.id(), p.key);
    this.toast.show('Новость удалена', p.t + ' — больше не показывается в ленте сообщества.');
  }
}
