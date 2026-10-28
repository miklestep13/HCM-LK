import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const K: Record<string, number> = { Специалист: 1, Старший: 2, Ведущий: 3, Лидер: 4 };

/** Уровень компетенции точками: <span ipr-level level="Ведущий"></span> */
@Component({
  selector: '[ipr-level]',
  template: `<span class="lvd">
      @for (i of dots; track i) {
        <i [class]="i <= k() ? 'l' + k() : ''"></i>
      }</span
    ><small>{{ level() }}</small>`,
  host: { '[class]': '"lvw l" + k()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprLevel {
  readonly level = input.required<string>();
  protected readonly k = computed(() => K[this.level()] || 1);
  protected readonly dots = [1, 2, 3, 4];
}
