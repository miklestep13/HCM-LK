import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Community } from '../../interface/comm';
import { commCover } from './comm-cover.art';

/** Обложка сообщества: <div class="cmcv" app-comm-cover [comm]="c"></div> — SVG рисуется внутрь хоста. */
@Component({
  selector: '[app-comm-cover]',
  template: '',
  host: { '[innerHTML]': 'svg()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommCover {
  readonly comm = input.required<Pick<Community, 'id' | 'cat'>>();
  readonly variant = input<'card' | 'wide' | 'post'>('card');
  private readonly san = inject(DomSanitizer);
  protected readonly svg = computed(() => this.san.bypassSecurityTrustHtml(commCover(this.comm(), this.variant())));
}
