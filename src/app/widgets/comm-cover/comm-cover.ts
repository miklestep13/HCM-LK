import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Community } from '../../interface/comm';
import { commCover } from './comm-cover.art';

/** Обложка сообщества: <div class="cmcv" app-comm-cover [comm]="c"></div> — своя картинка (cover) или SVG по категории. */
@Component({
  selector: '[app-comm-cover]',
  template: '',
  host: { '[innerHTML]': 'svg()' },
  styles: '[app-comm-cover] > img.cmimg { display: block; width: 100%; height: 100%; object-fit: cover; }',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommCover {
  readonly comm = input.required<Pick<Community, 'id' | 'cat' | 'cover'>>();
  readonly variant = input<'card' | 'wide' | 'post'>('card');
  private readonly san = inject(DomSanitizer);
  protected readonly svg = computed(() => {
    const c = this.comm();
    return this.san.bypassSecurityTrustHtml(c.cover ? `<img class="cmimg" src="${c.cover}" alt="" />` : commCover(c, this.variant()));
  });
}
