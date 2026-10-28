import { Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

/**
 * Подсказка при наведении: [appTip]="'Заголовок|строка 1|строка 2'" — первая часть жирным, строки через «|».
 */
@Directive({ selector: '[appTip]', host: { '(mouseenter)': 'show()', '(mouseleave)': 'hide()' } })
export class Tooltip implements OnDestroy {
  readonly appTip = input<string>('');
  private readonly el = inject(ElementRef<HTMLElement>);
  private box?: HTMLDivElement;

  show(): void {
    const t = this.appTip();
    if (!t) return;
    const [h, ...rest] = t.split('|');
    const b = document.createElement('div');
    b.className = 'apptip';
    b.innerHTML = '<b>' + esc(h) + '</b>' + rest.map((r) => '<span>' + esc(r) + '</span>').join('');
    document.body.appendChild(b);
    const r = this.el.nativeElement.getBoundingClientRect();
    const left = Math.min(
      window.innerWidth - b.offsetWidth - 8,
      Math.max(8, r.left + r.width / 2 - b.offsetWidth / 2),
    );
    b.style.left = left + 'px';
    b.style.top =
      (r.top - b.offsetHeight - 8 < 8 ? r.bottom + 8 : r.top - b.offsetHeight - 8) + 'px';
    this.box = b;
  }
  hide(): void {
    this.box?.remove();
    this.box = undefined;
  }
  ngOnDestroy(): void {
    this.hide();
  }
}
const esc = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
