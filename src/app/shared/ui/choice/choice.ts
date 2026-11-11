import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';

const OTHER = 'Другое';

/**
 * Список вариантов: один ответ (радиокнопки) или несколько (чек-боксы, multi).
 * max — не больше N вариантов (остальные блокируются), other — «Другое» с полем ввода (текст — otherText).
 *   <app-choice [options]="…" [(value)]="v" />  ·  <app-choice multi [max]="3" other [options]="…" [(value)]="arr" [(otherText)]="t" />
 */
@Component({
  selector: 'app-choice',
  template: `
    @for (o of all(); track o) {
      @let on = has(o);
      <label class="cho" [class.on]="on" [class.dis]="!on && full()">
        @if (multi()) {
          <span class="ckb"><input type="checkbox" [checked]="on" [disabled]="!on && full()" (change)="flip(o)" /><i></i></span>
        } @else {
          <span class="rdb"><input type="radio" [name]="name" [checked]="on" (change)="value.set(o)" /><i></i></span>
        }
        <span class="chot">{{ o }}</span>
      </label>
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
  protected readonly name = 'cho' + Math.random().toString(36).slice(2, 8);
  protected readonly all = computed(() => (this.other() ? [...this.options(), OTHER] : this.options()));
  protected readonly picked = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? v : v ? [v] : [];
  });
  protected readonly full = computed(() => this.multi() && !!this.max() && this.picked().length >= this.max());
  protected has(o: string): boolean {
    return this.picked().includes(o);
  }
  protected flip(o: string): void {
    const p = this.picked();
    this.value.set(p.includes(o) ? p.filter((x) => x !== o) : [...p, o]);
  }
}
