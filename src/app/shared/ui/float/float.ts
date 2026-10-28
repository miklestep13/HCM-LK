import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Всплывающая панель у элемента (floatPanel прототипа): под элементом, а если не помещается — над ним или левее.
 *   @if (open()) { <div class="fpop amenu" [appFloat]="btn">…</div> }
 * anchor — элемент, к которому привязана панель. Панель .fpop — position: fixed.
 */
@Directive({ selector: '[appFloat]' })
export class Float {
  readonly appFloat = input.required<HTMLElement>();
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  constructor() {
    afterNextRender(() => {
      const r = this.appFloat().getBoundingClientRect(), w = this.el.offsetWidth, h = this.el.offsetHeight;
      let left = r.left, top = r.bottom + 6;
      if (left + w > innerWidth - 12) left = r.right - w;
      if (top + h > innerHeight - 12) top = r.top - h - 6;
      this.el.style.left = Math.max(12, left) + 'px';
      this.el.style.top = Math.max(12, top) + 'px';
    });
  }
}
