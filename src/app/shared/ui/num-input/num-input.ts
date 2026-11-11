import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Поле-число со стрелками прототипа (.numin): ввод только цифр, справа — «больше» / «меньше» (шаг 1, в пределах min…max).
 * Значение — строка ('' — пусто), как у обычного поля.
 *   <app-field label="Количество попыток" [filled]="!!n()"><app-num-input [min]="1" [(value)]="n" /></app-field>
 */
@Component({
  selector: 'app-num-input',
  imports: [Icon],
  template: `
    <input class="fin" inputmode="numeric" [placeholder]="placeholder()" [value]="value()" (input)="type($event)" />
    <span class="nustep"
      ><button type="button" class="nub" title="Больше" aria-label="Больше" (click)="step(1)"><app-icon name="stepUp" /></button
      ><button type="button" class="nub" title="Меньше" aria-label="Меньше" (click)="step(-1)"><app-icon name="stepDown" /></button
    ></span>
  `,
  host: { class: 'numin' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumInput {
  readonly value = model('');
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly placeholder = input('');
  /** ввод: только цифры (и минус, если min не задан или меньше нуля) */
  protected type(e: Event): void {
    const f = e.target as HTMLInputElement;
    const neg = this.min() == null || this.min()! < 0;
    const v = f.value.replace(neg ? /[^\d-]|(?!^)-/g : /\D/g, '');
    f.value = v;
    this.value.set(v === '' || v === '-' ? v : String(this.clamp(+v)));
    if (v !== '' && v !== '-' && this.value() !== v) f.value = this.value();
  }
  protected step(d: number): void {
    const v = this.value();
    const n = v === '' || v === '-' ? (this.min() ?? 0) : this.clamp(+v + d);
    this.value.set(String(n));
  }
  private clamp(n: number): number {
    const lo = this.min(), hi = this.max();
    return Math.min(hi ?? Infinity, Math.max(lo ?? -Infinity, n));
  }
}
