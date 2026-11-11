import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, model, viewChild } from '@angular/core';

/**
 * Редактор текста с панелью (.rte): полужирный, курсив, подчеркнутый, списки. Значение — HTML.
 *   <app-rich-text [(value)]="desc" />
 * Свои кнопки в конце панели: <button rtbExtra class="rtbb"><app-icon … /></button> (например, «Врезка» в конструкторе).
 */
@Component({
  selector: 'app-rich-text',
  template: `
    <div class="rtb">
      <button class="rtbb" title="Полужирный" (mousedown)="cmd($event, 'bold')"><svg viewBox="0 0 16 16" fill="none"><path d="M4.8 2.8h4a2.6 2.6 0 0 1 0 5.2h-4V2.8ZM4.8 8h4.6a2.6 2.6 0 0 1 0 5.2H4.8V8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg></button>
      <button class="rtbb" title="Курсив" (mousedown)="cmd($event, 'italic')"><svg viewBox="0 0 16 16" fill="none"><path d="M9.8 3h3.4M2.8 13h3.4M9.2 3 6.6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg></button>
      <button class="rtbb" title="Подчеркнутый" (mousedown)="cmd($event, 'underline')"><svg viewBox="0 0 16 16" fill="none"><path d="M4.4 2.6v5a3.6 3.6 0 0 0 7.2 0v-5M3.4 13.6h9.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg></button>
      <button class="rtbb" title="Маркированный список" (mousedown)="cmd($event, 'insertUnorderedList')"><svg viewBox="0 0 16 16" fill="none"><path d="M6 4.4h7.4M6 8h7.4M6 11.6h7.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /><circle cx="3" cy="4.4" r="1.1" fill="currentColor" /><circle cx="3" cy="8" r="1.1" fill="currentColor" /><circle cx="3" cy="11.6" r="1.1" fill="currentColor" /></svg></button>
      <button class="rtbb" title="Нумерованный список" (mousedown)="cmd($event, 'insertOrderedList')"><svg viewBox="0 0 16 16" fill="none"><path d="M6.4 4.4h7M6.4 8h7M6.4 11.6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /><path d="M2.2 3.2h1v3M2 11h2.2l-2.2 2.4h2.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
      <ng-content select="[rtbExtra]" />
    </div>
    <div class="rtc" contenteditable="true" #ed (input)="value.set(ed.innerHTML)"></div>
  `,
  host: { class: 'rte' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichText {
  readonly value = model('');
  private readonly ed = viewChild.required<ElementRef<HTMLElement>>('ed');
  constructor() {
    // начальное значение — один раз, дальше редактор ведет текст сам (не сбиваем курсор)
    afterNextRender(() => (this.ed().nativeElement.innerHTML = this.value()));
  }
  protected cmd(e: Event, c: string): void {
    e.preventDefault();
    this.ed().nativeElement.focus();
    document.execCommand(c);
    this.value.set(this.ed().nativeElement.innerHTML);
  }
}
