import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';

/**
 * Шкала-кнопки: числа from…to (шкала согласия 1–5, eNPS 0–10) или свои подписи (items: «Да / Нет»).
 * Подписи краев — minLabel / maxLabel под шкалой; nps — выбранная кнопка красная 0–6, желтая 7–8, зеленая 9–10.
 *   <app-scale [from]="1" [to]="5" minLabel="Не согласен" maxLabel="Согласен" [(value)]="v" />
 */
@Component({
  selector: 'app-scale',
  template: `
    <div class="scl">
      @for (x of list(); track x) {
        <button type="button" [class]="'sclb' + (value() === x ? ' on' + (nps() ? ' ' + tone(+x) : '') : '')" (click)="value.set(value() === x ? null : x)">{{ x }}</button>
      }
    </div>
    @if (minLabel() || maxLabel()) {
      <div class="sclh"><span>{{ minLabel() }}</span><span>{{ maxLabel() }}</span></div>
    }
  `,
  host: { class: 'scale', '[class.txt]': 'items().length > 0', '[class.nps]': 'nps()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Scale {
  readonly from = input(1);
  readonly to = input(5);
  /** свои варианты вместо чисел */
  readonly items = input<string[]>([]);
  readonly minLabel = input('');
  readonly maxLabel = input('');
  readonly nps = input(false, { transform: booleanAttribute });
  readonly value = model<string | number | null>(null);
  protected readonly list = computed<(string | number)[]>(() =>
    this.items().length ? this.items() : Array.from({ length: this.to() - this.from() + 1 }, (_, i) => this.from() + i),
  );
  protected tone(n: number): string {
    return n <= 6 ? 'dg' : n <= 8 ? 'warn' : 'ok';
  }
}
