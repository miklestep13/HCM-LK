import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

/**
 * Кнопка сортировки в шапке фильтров (⇅ со стрелкой) и список вариантов.
 *   <button app-sort-button [options]="sorts" [(value)]="sort"></button>
 */
@Component({
  selector: 'button[app-sort-button]',
  template: `
    <svg viewBox="0 0 16 16" fill="none">
      <path
        d="M5 12.4V3.6M2.8 5.8 5 3.6l2.2 2.2M11 3.6v8.8M8.8 10.2 11 12.4l2.2-2.2"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <svg viewBox="0 0 16 16" fill="none">
      <path
        d="M4 6.4 8 10.4l4-4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    @if (open()) {
      <div
        class="fpop selpop chpop plcolp"
        [style.left.px]="pos().left"
        [style.top.px]="pos().top"
        (click)="$event.stopPropagation()"
      >
        <div class="plcolh">{{ title() }}</div>
        <div class="folist">
          @for (o of options(); track o) {
            <div class="foi" [class.on]="o === value()" (click)="pick(o)">{{ o }}</div>
          }
        </div>
      </div>
    }
  `,
  host: {
    class: 'ib3 ic',
    type: 'button',
    '[attr.title]': 'title()',
    '[attr.aria-label]': 'title()',
    '(click)': 'toggle()',
    '(document:click)': 'outside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortButton {
  readonly options = input.required<string[]>();
  readonly value = model('');
  readonly title = input('Сортировка');
  protected readonly open = signal(false);
  protected readonly pos = signal({ left: 0, top: 0 });
  private readonly el = inject(ElementRef<HTMLElement>);

  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    const r = this.el.nativeElement.getBoundingClientRect();
    this.pos.set({ left: Math.min(r.left, innerWidth - 240), top: r.bottom + 6 });
    this.open.set(true);
  }
  protected pick(o: string): void {
    this.value.set(o);
    this.open.set(false);
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }
}
