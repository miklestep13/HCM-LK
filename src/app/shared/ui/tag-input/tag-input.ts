import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Ввод своих значений чипами (теги): чипы с крестиком и поле ввода после них. Enter или запятая — добавить чип,
 * Backspace в пустом поле — убрать последний; повторы не добавляются. Вид — как у app-chip-select (.msel).
 *   <app-tag-input [(value)]="tags" placeholder="Введите тег и нажмите Enter" />
 */
@Component({
  selector: 'app-tag-input',
  imports: [Icon],
  template: `
    @for (v of value(); track v) {
      <span class="chp">{{ v }}<button type="button" class="chx" title="Убрать" (click)="remove(v, $event)"><app-icon name="closeSm" /></button></span>
    }
    <input class="tgin" [placeholder]="value().length ? '' : placeholder()" (keydown)="key($event)" (blur)="add($any($event.target))" />
  `,
  host: { class: 'msel tgsel', '(click)': 'focus()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagInput {
  readonly value = model<string[]>([]);
  readonly placeholder = input('Введите и нажмите Enter');
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected focus(): void {
    this.el.querySelector<HTMLInputElement>('.tgin')?.focus();
  }
  protected key(e: KeyboardEvent): void {
    const f = e.target as HTMLInputElement;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      this.add(f);
    } else if (e.key === 'Backspace' && !f.value && this.value().length) this.value.set(this.value().slice(0, -1));
  }
  protected add(f: HTMLInputElement): void {
    const t = f.value.replace(/,/g, ' ').trim();
    f.value = '';
    if (t && !this.value().includes(t)) this.value.set([...this.value(), t]);
  }
  protected remove(v: string, e: Event): void {
    e.stopPropagation();
    this.value.set(this.value().filter((x) => x !== v));
  }
}
