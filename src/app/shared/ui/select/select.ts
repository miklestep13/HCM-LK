import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

/**
 * Селект прототипа (.fsel): кнопка со значением и всплывающий список (.fpop.selpop).
 *   <app-select [options]="units" [(value)]="unit" />
 *   <app-select label="Подразделение" [options]="units" [(value)]="unit" />   — вид шапки фильтров: подпись над значением
 * search — поле поиска в списке; placeholder — текст, когда ничего не выбрано.
 * allLabel — первый пункт «сбросить» (например «Все»): выбор дает пустое значение.
 * Стили — глобальные (src/styles/_controls.scss), разметка повторяет прототип.
 */
@Component({
  selector: 'app-select',
  template: `
    @if (label()) {
      <span class="ft2lab">{{ label() }}</span>
    }
    <span class="fsv" [class.ph]="!value()">{{ value() ? valuePrefix() + value() : placeholder() }}</span>
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
        class="fpop selpop"
        [style.left.px]="pos().left"
        [style.top.px]="pos().top"
        [style.min-width.px]="pos().width"
        (click)="$event.stopPropagation()"
      >
        @if (search()) {
          <input
            class="fin fsq"
            placeholder="Поиск"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
        }
        <div class="folist">
          @for (o of shown(); track o) {
            <div
              class="foi"
              [class.on]="o === value() || (o === allLabel() && !value())"
              (click)="pick(o)"
            >
              {{ o }}
            </div>
          } @empty {
            <div class="foe">Ничего не найдено</div>
          }
        </div>
      </div>
    }
  `,
  host: {
    class: 'fsel',
    role: 'button',
    tabindex: '0',
    '[class.act]': 'open()',
    '[class.ft2fs]': '!!label()',
    '[class.is-empty]': '!!label() && !value()',
    '(click)': 'toggle()',
    '(document:click)': 'outside($event)',
    '(window:scroll)': 'open.set(false)',
    '(keydown.escape)': 'open.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  readonly options = input.required<string[]>();
  readonly value = model<string>('');
  readonly label = input('');
  readonly placeholder = input('Не выбрано');
  readonly search = input(false);
  readonly allLabel = input('');
  /** приставка к выбранному значению: «Тип: » → «Тип: МВО» */
  readonly valuePrefix = input('');

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly pos = signal({ left: 0, top: 0, width: 0 });
  protected readonly shown = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.allLabel() ? [this.allLabel(), ...this.options()] : this.options();
    return q ? all.filter((o) => o.toLowerCase().includes(q)) : all;
  });
  private readonly el = inject(ElementRef<HTMLElement>);

  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    const r = this.el.nativeElement.getBoundingClientRect();
    this.query.set('');
    this.pos.set({ left: r.left, top: r.bottom + 6, width: r.width });
    this.open.set(true);
  }
  protected pick(o: string): void {
    this.value.set(o === this.allLabel() ? '' : o);
    this.open.set(false);
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }
}
