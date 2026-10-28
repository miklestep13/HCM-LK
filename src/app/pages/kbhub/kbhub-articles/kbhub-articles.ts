import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavService } from '../../../core/navigation/nav.service';
import { KB_ARTICLES, KB_TYPES, KB_TYPE_ICONS, kbKey } from '../../../data/kb.data';
import { KbType } from '../../../interface/kb';
import { Icon } from '../../../shared/ui/icon/icon';

/** Блок «Статьи»: 5 свежих статей базы знаний (обложка или плитка с иконкой типа), переход ко всем статьям. */
@Component({
  selector: '[kbhub-articles]',
  imports: [Icon],
  template: `
    <div class="ch">
      <h3>Статьи</h3>
      <button class="ib2 hubopen" title="Все статьи" aria-label="Все статьи" (click)="nav.go('kb')"><app-icon name="open" /></button>
    </div>
    <div class="cb colist colm hubarts">
      @for (a of list; track a.id) {
        <button class="coli cocrs" (click)="nav.go('kb', { kbo: a.id })">
          @if (a.cover) {
            <img [src]="a.cover" alt="" />
          } @else {
            <span class="hubti" [innerHTML]="icon(a.type)"></span>
          }
          <span class="i">
            <span class="colt" [title]="a.title">{{ a.title }}</span>
            <span class="coim">
              <span><span class="kbt" [innerHTML]="icon(a.type)"></span>{{ types[a.type] }}</span>
              <span><app-icon name="calendar" />{{ a.date.slice(0, 10) }}</span>
            </span>
          </span>
        </button>
      }
    </div>
  `,
  styleUrl: './kbhub-articles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbhubArticles {
  protected readonly nav = inject(NavService);
  private readonly san = inject(DomSanitizer);
  protected readonly types = KB_TYPES;
  protected readonly list = [...KB_ARTICLES].sort((x, y) => (kbKey(x.date) < kbKey(y.date) ? 1 : -1)).slice(0, 5);
  protected icon(t: KbType) { return this.san.bypassSecurityTrustHtml(KB_TYPE_ICONS[t] ?? KB_TYPE_ICONS.page); }
}
