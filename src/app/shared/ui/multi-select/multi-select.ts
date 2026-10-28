import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';

/**
 * Множественный выбор (.bkms): кнопка с подписью («Оснащение места», «Оснащение: 2» или одно значение) и список с отметками.
 *   <app-multi-select label="Оборудование" [options]="eq" [(value)]="selected" />
 */
@Component({
  selector: 'app-multi-select',
  template: `
    <span class="fsv" [class.ph]="!value().length">{{ text() }}</span>
    <svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    @if (open()) {
      <div class="fpop selpop chpop" [style.left.px]="pos().left" [style.top.px]="pos().top" [style.min-width.px]="pos().width"
        (click)="$event.stopPropagation()">
        <div class="folist">
          @for (o of options(); track o) {
            <div class="foi" [class.on]="value().includes(o)" (click)="flip(o)">{{ o }}</div>
          }
        </div>
      </div>
    }
  `,
  host: { class: 'bkms', role: 'button', tabindex: '0', '[class.act]': 'open()', '(click)': 'toggle()', '(document:click)': 'outside($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelect {
  readonly label = input.required<string>();
  readonly options = input.required<string[]>();
  readonly value = model<string[]>([]);
  protected readonly open = signal(false);
  protected readonly pos = signal({ left: 0, top: 0, width: 0 });
  private readonly el = inject(ElementRef<HTMLElement>);
  protected readonly text = computed(() => {
    const v = this.value();
    return v.length === 1 ? v[0] : v.length ? this.label() + ': ' + v.length : this.label();
  });
  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    const r = this.el.nativeElement.getBoundingClientRect();
    this.pos.set({ left: r.left, top: r.bottom + 6, width: r.width });
    this.open.set(true);
  }
  protected flip(o: string): void {
    const v = this.value();
    this.value.set(v.includes(o) ? v.filter((x) => x !== o) : [...v, o]);
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }
}
