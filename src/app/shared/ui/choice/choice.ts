import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

const OTHER = 'Другое';

/**
 * Список вариантов: один ответ или несколько (multi) — строки-плашки без радио / чек-боксов;
 * выбранный — синяя рамка (у multi справа галочка). max — не больше N, other — «Другое» с полем ввода.
 *   <app-choice [options]="…" [(value)]="v" />  ·  <app-choice multi [max]="3" other [options]="…" [(value)]="arr" [(otherText)]="t" />
 */
@Component({
  selector: 'app-choice',
  imports: [Icon],
  template: `
    @for (o of all(); track o) {
      @let on = has(o);
      <button type="button" class="cho" [class.on]="on" [class.dis]="!on && full()" [disabled]="!on && full()" (click)="pick(o)">
        <span class="chot">{{ o }}</span>
        @if (multi() && on) {
          <app-icon class="chook" name="checkSm" />
        }
      </button>
      @if (o === OTHER && other() && on) {
        <input class="fin choin" placeholder="Ваш вариант" [value]="otherText()" (input)="otherText.set($any($event.target).value)" />
      }
    }
    @if (multi() && max()) {
      <small class="chomax">Выбрано {{ picked().length }} из {{ max() }}</small>
    }
  `,
  host: { class: 'choice', '[class.multi]': 'multi()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Choice {
  readonly options = input.required<string[]>();
  readonly value = model<string | string[] | null>(null);
  readonly multi = input(false, { transform: booleanAttribute });
  readonly max = input(0);
  readonly other = input(false, { transform: booleanAttribute });
  readonly otherText = model('');
  protected readonly OTHER = OTHER;
  protected readonly all = computed(() => (this.other() ? [...this.options(), OTHER] : this.options()));
  protected readonly picked = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? v : v ? [v] : [];
  });
  protected readonly full = computed(() => this.multi() && !!this.max() && this.picked().length >= this.max());
  protected has(o: string): boolean {
    return this.picked().includes(o);
  }
  protected pick(o: string): void {
    if (this.multi()) {
      const p = this.picked();
      this.value.set(p.includes(o) ? p.filter((x) => x !== o) : [...p, o]);
    } else {
      this.value.set(this.value() === o ? null : o);
    }
  }
}
