import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavService } from '../../../core/navigation/nav.service';
import { BENEF_COMMENTS, BENEF_OFFERS } from '../../../data/benef.data';
import { COMPANY_AVA, COMPANY_NAME } from '../../../data/news.data';
import { BenefOffer } from '../../../interface/benef';
import { NewsPost as NewsPostData } from '../../../interface/news';
import { Attach } from '../../../shared/ui/attach/attach';
import { Icon } from '../../../shared/ui/icon/icon';
import { PageHead } from '../../../shared/ui/page-head/page-head';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommentItem, Comments } from '../../../widgets/comments/comments';
import { NewsPost } from '../../../widgets/news-post/news-post';

/**
 * Карточка льготы — полностью как «Новость» (#/legacy/newscard): two73, шапка автора,
 * статья, лайк/просмотры, материалы, комментарии; справа «Другие льготы» без картинок.
 * Отличия: заголовок «Льгота», вместо тегов — «Подать заявку».
 */
@Component({
  selector: 'app-benefcard',
  imports: [PageHead, Attach, Comments, Icon, NewsPost],
  template: `
    @let O = offer();
    <app-page-head title="Льгота" backTo="benef" backLabel="К доходам и льготам" />
    @if (O) {
      <div class="two73">
        <div class="colL">
          <div class="c">
            <div class="cb nart">
              <div class="nartp">
                <div class="npau">
                  <span class="npav">{{ ava }}</span>
                  <span class="i"><b>{{ author }}</b><time>{{ O.date }}</time></span>
                </div>
                <button type="button" class="btn pri" (click)="apply()">Подать заявку</button>
              </div>
              <h1 class="nctt">{{ O.title }}</h1>
              <div class="nbody">
                <p>{{ O.lead }}</p>
                @for (b of O.body; track b.h) {
                  <h4>{{ b.h }}</h4>
                  <p>{{ b.p }}</p>
                }
                @if (O.cover) {
                  <figure><img [src]="O.cover" alt="" /></figure>
                }
              </div>
              <div class="narth">
                <span class="nfs">
                  <button type="button" class="lkb" [class.on]="liked()" title="Нравится" (click)="toggleLike()">
                    <app-icon name="like" /><span>{{ O.lk + (liked() ? 1 : 0) }}</span>
                  </button>
                  <span title="Просмотры"><app-icon name="eye" /><span>{{ O.vw }}</span></span>
                </span>
              </div>
            </div>
          </div>

          <div class="c">
            <div class="ch"><h3>Прикрепленные материалы</h3><span class="chip">{{ O.files.length }}</span></div>
            <div class="cb"><app-attach [files]="O.files" /></div>
          </div>

          <div class="c">
            <div class="ch"><h3>Комментарии</h3><span class="chip">{{ chat().length }}</span></div>
            <div class="cb">
              <app-comments
                [items]="chat()"
                empty="Комментариев пока нет. Задайте вопрос о льготе первым."
                (send)="send($event)"
                (like)="like($event)"
                (remove)="remove($event)"
                (todo)="todo($event)"
              />
            </div>
          </div>
        </div>

        <div class="colR">
          <div class="c">
            <div class="ch"><h3>Другие льготы</h3></div>
            <div class="cb cofeed ncsim">
              <div class="nfeed">
                @for (p of others(); track p.id) {
                  <app-news-post [post]="p" [compact]="true" (open)="open($event)" />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="c"><div class="cb empty sm">Льгота не найдена</div></div>
    }
  `,
  styleUrl: './benefcard.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-benefcard' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Benefcard {
  /** id льготы из адреса ?bf= */
  readonly bf = input('');
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);
  protected readonly author = COMPANY_NAME;
  protected readonly ava = COMPANY_AVA;
  protected readonly liked = signal(false);
  protected readonly offer = computed(() => {
    const o = BENEF_OFFERS.find((x) => x.id === this.bf()) ?? null;
    return o ? { ...o, lk: o.lk ?? 12, vw: o.vw ?? 156 } : null;
  });
  protected readonly others = computed(() =>
    BENEF_OFFERS.filter((o) => o.id !== this.bf())
      .slice(0, 3)
      .map((o) => this.asPost(o)),
  );
  protected readonly chat = signal<CommentItem[]>(BENEF_COMMENTS.map((c) => ({ ...c })));

  constructor() {
    effect(() => {
      const o = this.offer();
      this.title.setTitle((o ? o.title : 'Льгота') + ' · Q.HCM');
      this.liked.set(false);
      if (this.bf() && !o) this.nav.go('benef');
    });
  }

  /** пост для сайдбара «Другие льготы» — как compact news-post, без обложки */
  private asPost(o: BenefOffer): NewsPostData {
    const [date, time = ''] = o.date.split(/\s+/);
    return {
      id: o.id,
      cat: 'Льготы',
      title: o.title,
      lead: o.lead,
      tags: o.tags,
      date,
      time,
      cm: o.cm ?? 2,
      vw: o.vw ?? 86,
      lk: o.lk ?? 8,
      author: 0,
      authorFio: COMPANY_NAME,
      body: [],
    };
  }

  protected open(id: string): void {
    this.nav.go('benefcard', { bf: id });
  }
  protected apply(): void {
    this.toast.show('Заявка', 'Форма заявки на льготу скоро появится.');
  }
  protected toggleLike(): void {
    this.liked.update((v) => !v);
  }
  protected send(text: string): void {
    this.chat.update((l) => [{ av: 0, author: 'Вы', date: 'сейчас', text, likes: 0, mine: true }, ...l]);
  }
  protected like(i: number): void {
    this.chat.update((l) => l.map((c, k) => (k === i ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) } : c)));
  }
  protected remove(i: number): void {
    this.chat.update((l) => l.filter((_, k) => k !== i));
  }
  protected todo(msg: string): void {
    this.toast.show('Скоро', msg);
  }
}
