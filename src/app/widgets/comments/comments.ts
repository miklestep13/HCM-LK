import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, input, output, signal } from '@angular/core';
import { ME_PHOTO, avCls } from '../../data/people.data';
import { Icon } from '../../shared/ui/icon/icon';
import { ToastService } from '../../shared/ui/toast/toast.service';

/** Комментарий в обсуждении */
export interface CommentItem {
  /** портрет av1–av8 (для своих — фото пользователя) */
  av: number;
  author: string;
  date: string;
  text: string;
  likes: number;
  liked?: boolean;
  /** свой комментарий: можно редактировать и удалить */
  mine?: boolean;
}

/**
 * Обсуждение: форма «Оставьте комментарий» и список комментариев (лайк, ответ — поле под комментарием, ответы с отступом;
 * у своих — правка и удаление).
 * Используется на странице товара; так же устроены комментарии новости.
 */
@Component({
  selector: 'app-comments',
  imports: [Icon],
  template: `
    <div class="cform">
      <span class="av avme" [style.background-image]="'url(' + mePhoto + ')'"></span>
      <div class="cfin">
        <textarea class="fta" rows="3" [placeholder]="placeholder()" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
        <div class="cfact">
          <span class="cfhint">{{ hint() }}</span>
          <button class="btn pri" (click)="submit()">Отправить</button>
        </div>
      </div>
    </div>
    <!-- пустой список и линия над ним не рисуются, если empty="" -->
    @if (items().length || empty()) {
    <div class="clist">
      @for (m of items(); track $index; let k = $index) {
        <div class="cmt">
          @if (m.mine) {
            <span class="av avme" [style.background-image]="'url(' + mePhoto + ')'"></span>
          } @else {
            <span class="av" [class]="avCls(m.author, m.av)"></span>
          }
          <div>
            <div class="cmth"><b>{{ m.mine ? meName() : m.author }}</b><time>{{ m.date }}</time></div>
            <p>{{ m.text }}</p>
            <div class="cmta">
              <button class="npb" [class.on]="m.liked" title="Нравится" (click)="like.emit(k)"><app-icon name="like" /><span>{{ m.likes }}</span></button>
              <button class="npb" title="Ответить" (click)="openReply(k)">
                <svg viewBox="0 0 16 16" fill="none"><path d="M6.2 3.4 2.4 7l3.8 3.6M2.6 7h6.6a4.2 4.2 0 0 1 4.2 4.2v1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
              @if (m.mine) {
                <button class="npb" title="Редактировать" (click)="todo.emit('Редактирование комментария.')">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M11.2 2.6a1.7 1.7 0 0 1 2.4 2.4l-7.5 7.5-3.2.8.8-3.2 7.5-7.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
                </button>
                <button class="npb cmdel" title="Удалить" (click)="remove.emit(k)">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M2.8 4.4h10.4M6.4 4.4V3.2a1 1 0 0 1 1-1h1.2a1 1 0 0 1 1 1v1.2M4.2 4.4l.6 8.2a1.2 1.2 0 0 0 1.2 1.1h4a1.2 1.2 0 0 0 1.2-1.1l.6-8.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
              }
            </div>
          </div>
        </div>
        <!-- ответы: под комментарием с отступом; поле ответа открывается по «Ответить» -->
        @for (r of replies()[k] || []; track $index) {
          <div class="cmt cmrp">
            <span class="av avme" [style.background-image]="'url(' + mePhoto + ')'"></span>
            <div>
              <div class="cmth"><b>{{ meName() }}</b><time>{{ r.date }}</time></div>
              <p><span class="cmto">{{ r.to }},</span> {{ r.text }}</p>
            </div>
          </div>
        }
        @if (replyTo() === k) {
          <div class="cmrf">
            <span class="av avme" [style.background-image]="'url(' + mePhoto + ')'"></span>
            <div class="cfin">
              <textarea class="fta" rows="2" placeholder="Ваш ответ" [value]="rtext()" (input)="rtext.set($any($event.target).value)"></textarea>
              <div class="cfact cmrfa">
                <button class="btn raised" (click)="replyTo.set(null)">Отменить</button>
                <button class="btn pri" (click)="sendReply(k)">Ответить</button>
              </div>
            </div>
          </div>
        }
      } @empty {
        <p class="shnocm">{{ empty() }}</p>
      }
    </div>
    }
  `,
  styleUrl: './comments.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-comments' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Comments {
  readonly items = input.required<CommentItem[]>();
  readonly placeholder = input('Оставьте комментарий');
  readonly hint = input('Комментарий увидят все сотрудники компании');
  readonly empty = input('Комментариев пока нет.');
  /** как подписан свой комментарий */
  readonly meName = input('Иванов Павел');
  readonly send = output<string>();
  readonly like = output<number>();
  readonly remove = output<number>();
  /** действие-заглушка (ответ, правка) */
  readonly todo = output<string>();
  protected readonly mePhoto = ME_PHOTO;
  protected readonly avCls = avCls;
  protected readonly text = signal('');
  private readonly toast = inject(ToastService);
  /** ответы по номеру комментария (до перезагрузки) и открытое поле ответа */
  protected readonly replies = signal<Record<number, { date: string; text: string; to: string }[]>>({});
  protected readonly replyTo = signal<number | null>(null);
  protected readonly rtext = signal('');
  protected openReply(k: number): void {
    this.rtext.set('');
    this.replyTo.set(k);
  }
  protected sendReply(k: number): void {
    const t = this.rtext().trim();
    if (!t) return this.toast.show('Пустой ответ', 'Напишите текст ответа.');
    const d = new Date(), z = (n: number) => String(n).padStart(2, '0'), m = this.items()[k];
    const date = `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`;
    this.replies.update((r) => ({ ...r, [k]: [...(r[k] || []), { date, text: t, to: m.mine ? this.meName() : m.author }] }));
    this.replyTo.set(null);
    this.toast.show('Ответ опубликован', 'Автор комментария получит уведомление.');
  }
  protected submit(): void {
    this.send.emit(this.text().trim());
    if (this.text().trim()) this.text.set('');
  }
}
