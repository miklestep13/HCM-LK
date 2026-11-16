import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';

/** вариант с фото и подписью (люди): класс портрета (.av…) или ссылка на фото, подпись — должность */
export interface MultiSelectMeta {
  av?: string;
  img?: string;
  sub?: string;
}

/**
 * Множественный выбор — выглядит и ведет себя как app-select с подписью (.fsel.ft2fs): «Подпись: Все» / «Подпись: значение» / «Подпись: первое +N»;
 * список с отметками, первый пункт «Все» сбрасывает выбор; список не закрывается после выбора.
 *   <app-multi-select label="Оборудование" [options]="eq" [(value)]="selected" />
 * meta — фото и подпись варианта в списке (например, сотрудники: портрет и должность); в поле — только само значение (ФИО).
 */
@Component({
  selector: 'app-multi-select',
  template: `
    <!-- как app-select с подписью: одной строкой «Подпись: значение», пусто — «Подпись: Все», несколько — «Подпись: первое +N» -->
    <span class="ft2lab">{{ label() }}</span>
    <span class="fsv">{{ text() }}</span>
    <svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    @if (open()) {
      <div class="fpop selpop chpop" [style.left.px]="pos().left" [style.top.px]="pos().top" [style.min-width.px]="pos().width"
        (click)="$event.stopPropagation()">
        <div class="folist">
          <div class="foi" [class.on]="!value().length" (click)="value.set([])">Все</div>
          @for (o of options(); track o) {
            @let m = meta()[o];
            @if (m) {
              <div class="foi foper" [class.on]="value().includes(o)" (click)="flip(o)">
                @if (m.img) {
                  <img class="av" [src]="m.img" alt="" />
                } @else {
                  <span class="av" [class]="m.av || ''"></span>
                }
                <span class="cnm"><b>{{ o }}</b>@if (m.sub) {<small>{{ m.sub }}</small>}</span>
              </div>
            } @else {
              <div class="foi" [class.on]="value().includes(o)" (click)="flip(o)">{{ o }}</div>
            }
          }
        </div>
      </div>
    }
  `,
  host: {
    class: 'fsel ft2fs msfs',
    role: 'button',
    tabindex: '0',
    '[class.act]': 'open()',
    '[class.is-empty]': '!value().length',
    '(click)': 'toggle()',
    '(document:click)': 'outside($event)',
    '(window:scroll)': 'open.set(false)',
    '(keydown.escape)': 'open.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelect {
  readonly label = input.required<string>();
  readonly options = input.required<string[]>();
  readonly value = model<string[]>([]);
  readonly meta = input<Record<string, MultiSelectMeta>>({});
  protected readonly open = signal(false);
  protected readonly pos = signal({ left: 0, top: 0, width: 0 });
  private readonly el = inject(ElementRef<HTMLElement>);
  protected readonly text = computed(() => {
    const v = this.value();
    return !v.length ? 'Все' : v.length === 1 ? v[0] : v[0] + ' +' + (v.length - 1);
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
