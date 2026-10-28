import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Множественный выбор чипами (.msel прототипа): выбранные значения — чипы с крестиком и «+ добавить»,
 * по клику — список с поиском и отметками.
 *   <app-chip-select [options]="roles" [(value)]="sel" placeholder="Выберите роли" />
 */
@Component({
  selector: 'app-chip-select',
  imports: [Icon],
  template: `
    @for (v of value(); track v) {
      <span class="chp">{{ v }}<button class="chx" (click)="remove(v, $event)"><app-icon name="closeSm" /></button></span>
    } @empty {
      <span class="mph">{{ placeholder() }}</span>
    }
    @if (value().length) {
      <span class="mad">+ добавить</span>
    }
    @if (open()) {
      <div class="fpop selpop" [style.left.px]="pos().left" [style.top.px]="pos().top" [style.min-width.px]="pos().width" (click)="$event.stopPropagation()">
        <input class="fin fsq" placeholder="Поиск" [value]="q()" (input)="q.set($any($event.target).value)" />
        <div class="folist">
          @for (o of shown(); track o) {
            <div class="foi mo" (click)="flip(o)"><span class="ckb"><input type="checkbox" [checked]="value().includes(o)" /><i></i></span>{{ o }}</div>
          } @empty {
            <div class="foe">Ничего не найдено</div>
          }
        </div>
      </div>
    }
  `,
  host: { class: 'msel', '[class.act]': 'open()', '(click)': 'toggle()', '(document:click)': 'outside($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipSelect {
  readonly options = input.required<string[]>();
  readonly value = model<string[]>([]);
  readonly placeholder = input('Не выбрано');
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly open = signal(false);
  protected readonly q = signal('');
  protected readonly pos = signal({ left: 0, top: 0, width: 0 });
  protected readonly shown = computed(() => {
    const s = this.q().trim().toLowerCase();
    return this.options().filter((o) => !s || o.toLowerCase().includes(s));
  });
  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    const r = this.el.getBoundingClientRect();
    this.q.set('');
    this.pos.set({ left: r.left, top: r.bottom + 6, width: r.width });
    this.open.set(true);
    setTimeout(() => this.el.querySelector<HTMLInputElement>('.fsq')?.focus());
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.contains(e.target as Node)) this.open.set(false);
  }
  protected flip(o: string): void {
    const v = this.value();
    this.value.set(v.includes(o) ? v.filter((x) => x !== o) : [...v, o]);
  }
  protected remove(v: string, e: Event): void {
    e.stopPropagation();
    this.value.set(this.value().filter((x) => x !== v));
  }
}
