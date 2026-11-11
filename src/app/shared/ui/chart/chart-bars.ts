import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** строка горизонтальной диаграммы: подпись, значение, доп. подпись справа (например, «24 чел.»), отметка (верный ответ) */
export interface BarItem {
  l: string;
  v: number;
  sub?: string;
  mark?: boolean;
  /** цвет полосы — как у сегмента кольца рядом (.s1–.s5); по умолчанию синий */
  c?: string;
}

/**
 * Горизонтальные полосы с подписью слева и значением справа (рейтинги, распределения ответов, доли).
 * max — 100 для процентов, иначе — наибольшее значение; suffix — «%» после значения.
 *   <app-chart-bars [items]="[{ l: 'Управление рисков', v: 86, sub: '24 чел.' }]" [max]="100" suffix="%" />
 */
@Component({
  selector: 'app-chart-bars',
  template: `
    @for (b of items(); track $index) {
      <div class="chb" [class.mark]="b.mark" [title]="b.l + ': ' + b.v + suffix() + (b.sub ? ' · ' + b.sub : '')">
        <span class="chbl">{{ b.l }}@if (b.mark) {<em class="chok">верный</em>}</span>
        <span class="chbt"><i [class]="b.c || ''" [style.width.%]="(b.v / top()) * 100"></i></span>
        <span class="chbv"><b>{{ b.v }}{{ suffix() }}</b>@if (b.sub) {<small>{{ b.sub }}</small>}</span>
      </div>
    }
  `,
  host: { class: 'chart-bars' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartBars {
  readonly items = input.required<BarItem[]>();
  readonly max = input(0);
  readonly suffix = input('');
  protected readonly top = computed(() => this.max() || Math.max(1, ...this.items().map((b) => b.v)));
}
