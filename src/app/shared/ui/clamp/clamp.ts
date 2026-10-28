import { DestroyRef, Directive, ElementRef, afterRenderEffect, inject, input } from '@angular/core';

/**
 * Описание в шапке курса / программы (lfClamp прототипа): колонка не выше картинки — лишний текст обрезается по строкам,
 * под ним ссылка «Читать все» / «Свернуть».
 *   <div class="abt crsab" [appClamp]="text"></div>  — колонка .crsinfo, картинка — .crsimg img соседней колонки
 */
@Directive({ selector: '[appClamp]' })
export class Clamp {
  /** содержимое (пересчет при смене) */
  readonly appClamp = input<unknown>();
  private readonly ab: HTMLElement = inject(ElementRef).nativeElement;
  private btn: HTMLButtonElement | null = null;

  constructor() {
    afterRenderEffect(() => {
      this.appClamp();
      this.reset();
      requestAnimationFrame(() => this.measure());
    });
    inject(DestroyRef).onDestroy(() => this.btn?.remove());
  }

  private reset(): void {
    this.ab.classList.remove('clamp', 'open');
    this.ab.style.maxHeight = '';
    this.btn?.remove();
    this.btn = null;
  }
  private measure(): void {
    const ab = this.ab, info = ab.closest('.crsinfo') as HTMLElement | null, img = info?.parentElement?.querySelector('.crsimg img, .crsimg>svg');
    if (!info || !img) return;
    const lh = parseFloat(getComputedStyle(ab).lineHeight) || 22, over = info.scrollHeight - img.getBoundingClientRect().height;
    if (over <= 1) return;
    const avail = Math.floor((ab.clientHeight - over - 28) / lh) * lh;
    if (avail < lh * 2) return;
    ab.classList.add('clamp');
    ab.style.maxHeight = avail + 'px';
    const b = document.createElement('button');
    b.className = 'lnk crsmore';
    b.textContent = 'Читать все';
    ab.insertAdjacentElement('afterend', b);
    this.btn = b;
    let bt = b.nextElementSibling as HTMLElement | null;
    while (bt && bt.classList.contains('hidden')) bt = bt.nextElementSibling as HTMLElement | null;
    const isBtn = !!bt && bt.classList.contains('crsbtn'),
      gap = bt ? bt.getBoundingClientRect().top + (isBtn ? parseFloat(getComputedStyle(bt).paddingTop) : 0) - b.getBoundingClientRect().bottom : 0;
    const mt = gap > 16 ? 4 + gap - 16 + 'px' : '';
    b.style.marginTop = mt;
    b.onclick = () => {
      const op = ab.classList.toggle('open');
      ab.style.maxHeight = op ? '' : avail + 'px';
      b.textContent = op ? 'Свернуть' : 'Читать все';
      b.style.marginTop = op ? '' : mt;
    };
  }
}
