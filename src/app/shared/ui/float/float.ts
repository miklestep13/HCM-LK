import { DestroyRef, Directive, ElementRef, afterNextRender, booleanAttribute, inject, input } from '@angular/core';

/**
 * Всплывающая панель у элемента (floatPanel прототипа): под элементом, а если не помещается — над ним или левее.
 *   @if (open()) { <div class="fpop amenu" [appFloat]="btn">…</div> }
 * anchor — элемент, к которому привязана панель. Панель .fpop — position: fixed.
 * floatTrack — панель следует за элементом при прокрутке страницы или таблицы и при изменении окна
 * (сторона — под или над элементом — выбирается один раз при открытии, чтобы панель не прыгала).
 */
@Directive({ selector: '[appFloat]' })
export class Float {
  readonly appFloat = input.required<HTMLElement>();
  readonly floatTrack = input(false, { transform: booleanAttribute });
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroy = inject(DestroyRef);
  /** панель над элементом (решается при открытии) */
  private up = false;
  constructor() {
    afterNextRender(() => {
      this.place(true);
      if (!this.floatTrack()) return;
      const on = () => this.place(false);
      addEventListener('scroll', on, true);
      addEventListener('resize', on);
      this.destroy.onDestroy(() => (removeEventListener('scroll', on, true), removeEventListener('resize', on)));
    });
  }
  private place(first: boolean): void {
    const r = this.appFloat().getBoundingClientRect(), w = this.el.offsetWidth, h = this.el.offsetHeight;
    let left = r.left;
    if (left + w > innerWidth - 12) left = r.right - w;
    if (first) this.up = r.bottom + 6 + h > innerHeight - 12;
    const top = this.up ? r.top - h - 6 : r.bottom + 6;
    this.el.style.left = Math.max(12, left) + 'px';
    this.el.style.top = (first ? Math.max(12, top) : top) + 'px';
  }
}
