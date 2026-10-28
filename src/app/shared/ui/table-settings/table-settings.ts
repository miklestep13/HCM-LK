import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, signal } from '@angular/core';

/**
 * Кнопка «Настройка таблицы» в шапке фильтров: список столбцов с отметками (первый столбец скрыть нельзя).
 * Скрытые столбцы — номера с 1; на таблицу вешаются классы hcN: [class]="hiddenCols(hidden())".
 *   <button ftAction app-table-settings [columns]="cols" [(hidden)]="hidden"></button>
 */
@Component({
  selector: 'button[app-table-settings]',
  template: `
    <svg viewBox="0 0 16 16" fill="none"><path d="M2.4 4.4h5.4M12 4.4h1.6M2.4 8h1.4M8 8h5.6M2.4 11.6h5.4M12 11.6h1.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /><circle cx="9.9" cy="4.4" r="1.5" stroke="currentColor" stroke-width="1.3" /><circle cx="5.9" cy="8" r="1.5" stroke="currentColor" stroke-width="1.3" /><circle cx="9.9" cy="11.6" r="1.5" stroke="currentColor" stroke-width="1.3" /></svg>
    @if (open()) {
      <div class="fpop selpop chpop plcolp" [style.left.px]="pos().left" [style.top.px]="pos().top" (click)="$event.stopPropagation()">
        <div class="plcolh">Столбцы таблицы</div>
        <div class="folist">
          @for (c of columns(); track c; let i = $index) {
            <div class="foi" [class.on]="!hidden().includes(i + 1)" [class.dis]="i === 0" (click)="flip(i + 1)">{{ c }}</div>
          }
        </div>
      </div>
    }
  `,
  host: { class: 'ib3 ibsq ftset', type: 'button', title: 'Настройка таблицы', '(click)': 'toggle()', '(document:click)': 'outside($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSettings {
  readonly columns = input.required<string[]>();
  readonly hidden = model<number[]>([]);
  protected readonly open = signal(false);
  protected readonly pos = signal({ left: 0, top: 0 });
  private readonly el = inject(ElementRef<HTMLElement>);
  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    const r = this.el.nativeElement.getBoundingClientRect();
    this.pos.set({ left: Math.min(r.left, innerWidth - 248), top: r.bottom + 6 });
    this.open.set(true);
  }
  protected flip(n: number): void {
    if (n === 1) return;
    const h = this.hidden();
    this.hidden.set(h.includes(n) ? h.filter((x) => x !== n) : [...h, n]);
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }
}

/** классы скрытых столбцов для таблицы: [3, 5] → 'hc3 hc5' */
export const hiddenCols = (h: number[]) => h.map((n) => 'hc' + n).join(' ');
