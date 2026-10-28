import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { FAQ, KB_ARTICLES } from '../../../data/kb.data';
import { Faq } from '../../../interface/kb';

/** Блок «Часто задаваемые вопросы»: аккордеон, в ответе — ссылка на раздел или статью. */
@Component({
  selector: '[kbhub-faq]',
  template: `
    <div class="ch"><h3>Часто задаваемые вопросы</h3></div>
    <div class="seaacc hubacc">
      @for (f of faq; track f.q; let k = $index) {
        <div class="seas hubq" [class.open]="opened().has(k)">
          <div class="seash" (click)="toggle(k)">
            <b>{{ f.q }}</b>
            <span class="seac">
              <svg viewBox="0 0 12 12" style="transform: rotate(90deg)" fill="none"><path d="M4.4 3 7.4 6l-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </div>
          <div class="seab">
            <p>{{ f.a }}</p>
            @if (f.link; as l) {
              <button class="lnk" (click)="go(f)">{{ l[0] }}</button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './kbhub-faq.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbhubFaq {
  private readonly nav = inject(NavService);
  protected readonly faq = FAQ;
  protected readonly opened = signal(new Set([0]));
  protected toggle(k: number): void {
    const s = new Set(this.opened());
    s.has(k) ? s.delete(k) : s.add(k);
    this.opened.set(s);
  }
  protected go(f: Faq): void {
    const [t, v] = f.link![1].split(':');
    if (t === 'go') return this.nav.go(v);
    const a = KB_ARTICLES.find((x) => x.title === v);
    this.nav.go('kb', a ? { kbo: a.id } : {});
  }
}
