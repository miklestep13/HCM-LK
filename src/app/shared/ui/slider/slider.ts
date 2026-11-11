import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

/**
 * Ползунок min…max: значение над бегунком, подписи краев под дорожкой. Пока не двигали — value null (без ответа).
 *   <app-slider unit="%" minLabel="0 %" maxLabel="100 %" [(value)]="v" />
 */
@Component({
  selector: 'app-slider',
  template: `
    <div class="sldw">
      <span class="sldv" [style.left.%]="pos()">{{ value() ?? '—' }}{{ value() != null ? ' ' + unit() : '' }}</span>
      <input type="range" class="sld" [min]="min()" [max]="max()" [step]="step()" [value]="value() ?? mid()" [style.--p.%]="value() == null ? 0 : pos()" (input)="value.set(+$any($event.target).value)" />
    </div>
    <div class="sclh"><span>{{ minLabel() }}</span><span>{{ maxLabel() }}</span></div>
  `,
  host: { class: 'slider', '[class.empty]': 'value() == null' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slider {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(5);
  readonly unit = input('');
  readonly minLabel = input('');
  readonly maxLabel = input('');
  readonly value = model<number | null>(null);
  protected readonly mid = computed(() => (this.min() + this.max()) / 2);
  protected readonly pos = computed(() => (((this.value() ?? this.mid()) - this.min()) / (this.max() - this.min())) * 100);
}
