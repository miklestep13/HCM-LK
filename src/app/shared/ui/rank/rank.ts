import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Ранжирование: варианты по порядку (наверху — первое место), перетаскивание за строку или стрелки ↑ ↓.
 * Пока порядок не задан — value пустой (вопрос без ответа): номера серые, под списком «Порядок не задан» и «Оставить этот порядок»
 * (если порядок по умолчанию уже подходит). Любое перемещение или эта кнопка задают ответ: номера синие, «✓ Порядок задан» и «Сбросить».
 *   <app-rank [options]="…" [(value)]="order" />
 */
@Component({
  selector: 'app-rank',
  imports: [Icon],
  template: `
    @for (o of order(); track o; let i = $index, last = $last) {
      <div class="rki" draggable="true" [class.drag]="drag() === i" [class.set]="value().length > 0"
        (dragstart)="drag.set(i)" (dragend)="drag.set(-1)" (dragover)="$event.preventDefault(); over(i)">
        <app-icon class="rkg" name="grip" />
        <span class="rkn">{{ i + 1 }}</span>
        <span class="rkt">{{ o }}</span>
        <button type="button" class="rkb" title="Выше" [disabled]="i === 0" (click)="move(i, i - 1)"><app-icon name="stepUp" /></button>
        <button type="button" class="rkb" title="Ниже" [disabled]="last" (click)="move(i, i + 1)"><app-icon name="stepDown" /></button>
      </div>
    }
    <div class="rkst" [class.set]="value().length > 0">
      @if (value().length) {
        <span class="rkok"><app-icon name="checkSm" />Порядок задан</span>
        <button type="button" class="lnk" (click)="value.set([])">Сбросить</button>
      } @else {
        <span>Порядок не задан — перетащите варианты или подтвердите текущий</span>
        <button type="button" class="lnk" (click)="value.set([...options()])">Оставить этот порядок</button>
      }
    </div>
  `,
  host: { class: 'rank', '[class.set]': 'value().length > 0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rank {
  readonly options = input.required<string[]>();
  readonly value = model<string[]>([]);
  protected readonly drag = signal(-1);
  protected readonly order = computed(() => (this.value().length ? this.value() : this.options()));
  protected move(a: number, b: number): void {
    const l = [...this.order()];
    const [x] = l.splice(a, 1);
    l.splice(b, 0, x);
    this.value.set(l);
  }
  protected over(i: number): void {
    const d = this.drag();
    if (d < 0 || d === i) return;
    this.move(d, i);
    this.drag.set(i);
  }
}
