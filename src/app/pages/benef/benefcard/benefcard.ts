import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavService } from '../../../core/navigation/nav.service';
import { BENEF_COMMENTS, BENEF_OFFERS } from '../../../data/benef.data';
import { COMPANY_AVA, COMPANY_NAME } from '../../../data/news.data';
import { BenefOffer } from '../../../interface/benef';
import { Attach } from '../../../shared/ui/attach/attach';
import { PageHead } from '../../../shared/ui/page-head/page-head';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommentItem, Comments } from '../../../widgets/comments/comments';

/**
 * Карточка льготы — раскладка как у новости (two73): слева статья, материалы и комментарии;
 * справа «Другие льготы» без картинок. Заголовок страницы — «Льгота».
 */
@Component({
  selector: 'app-benefcard',
  imports: [PageHead, Attach, Comments],
  template: `
    @let O = offer();
    <app-page-head title="Льгота" backTo="benef" backLabel="К доходам и льготам" />
    @if (O) {
      <div class="two73 bfcard">
        <div class="colL">
          <div class="c nart">
            <div class="cb">
              <div class="nartp">
                <div class="npau">
                  <span class="av avco">{{ ava }}</span>
                  <span><b>{{ author }}</b><small class="kbdt">{{ O.date }}</small></span>
                </div>
                <div class="tags">
                  @for (t of O.tags; track t) {
                    <span class="tag">#{{ t.toLowerCase() }}</span>
                  }
                </div>
              </div>
              <h1 class="nctt">{{ O.title }}</h1>
              <p class="bflead">{{ O.lead }}</p>
              @for (b of O.body; track b.h) {
                <h4>{{ b.h }}</h4>
                <p>{{ b.p }}</p>
              }
              @if (O.cover) {
                <div class="bfcover"><img [src]="O.cover" alt="" /></div>
              }
            </div>
          </div>

          <div class="c mt">
            <div class="ch"><h3>Прикрепленные материалы</h3><span class="chip">{{ O.files.length }}</span></div>
            <div class="cb"><app-attach [files]="O.files" /></div>
          </div>

          <div class="c mt">
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
            <div class="cb bfmore">
              @for (x of others(); track x.id) {
                <button type="button" class="bfmi" (click)="open(x)">
                  <b>{{ x.title }}</b>
                  <small>{{ x.text }}</small>
                  <span class="tags">
                    @for (t of x.tags; track t) {
                      <span class="tag">#{{ t.toLowerCase() }}</span>
                    }
                  </span>
                </button>
              }
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
  protected readonly offer = computed(() => BENEF_OFFERS.find((o) => o.id === this.bf()) ?? null);
  protected readonly others = computed(() => BENEF_OFFERS.filter((o) => o.id !== this.bf()).slice(0, 5));
  protected readonly chat = signal<CommentItem[]>(BENEF_COMMENTS.map((c) => ({ ...c })));

  constructor() {
    effect(() => {
      const o = this.offer();
      this.title.setTitle((o ? o.title : 'Льгота') + ' · Q.HCM');
      if (this.bf() && !o) this.nav.go('benef');
    });
  }

  protected open(o: BenefOffer): void {
    this.nav.go('benefcard', { bf: o.id });
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
