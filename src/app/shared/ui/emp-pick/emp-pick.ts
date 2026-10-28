import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';
import { avCls } from '../../../data/people.data';
import { Icon } from '../icon/icon';

/** Сотрудник в списке выбора */
export interface PickPerson {
  name: string;
  post: string;
  av: number;
}
const short = (n: string) => {
  const [f, i, o] = n.split(' ');
  return o ? `${f} ${i[0]}. ${o[0]}.` : n;
};

/**
 * Выбор нескольких сотрудников (cuEmpPick прототипа): чипы в поле, список с поиском, «Выбрать всех», чек-боксы, аватар + ФИО + должность.
 *   <app-emp-pick [people]="list" [(value)]="names" />
 * busy(name) — сотрудник недоступен (busyText — подпись вместо должности).
 */
@Component({
  selector: 'app-emp-pick',
  imports: [Icon],
  template: `
    <span class="fsv" [class.ph]="!value().length" [class.cuchips]="!!value().length">
      @for (n of value(); track n) {
        <span class="cuchip"
          ><span class="av" [class]="av(n)"></span>{{ value().length === 1 ? n : short(n)
          }}<span class="cux" role="button" aria-label="Убрать" (click)="remove(n, $event)">×</span></span
        >
      } @empty {
        {{ placeholder() }}
      }
    </span>
    <app-icon name="chevDown" />
    @if (open()) {
      <div class="fpop selpop cupop" [style.left.px]="pos().left" [style.top.px]="pos().top" [style.width.px]="pos().width" (click)="$event.stopPropagation()">
        <input class="fin fsq" placeholder="Поиск по ФИО или должности" [value]="q()" (input)="q.set($any($event.target).value)" />
        <div class="cuall">
          @if (free().length) {
            <label class="ckb cuo"
              ><input type="checkbox" [checked]="allOn()" (change)="all($any($event.target).checked)" /><i></i
              ><span>{{ q().trim() ? 'Выбрать всех найденных' : 'Выбрать всех' }} ({{ free().length }})</span></label
            >
          }
        </div>
        <div class="folist cul">
          @for (e of shown(); track e.name) {
            @let b = busy()(e.name);
            <label class="ckb cuo" [class.off]="b"
              ><input type="checkbox" [checked]="value().includes(e.name)" [disabled]="b" (change)="flip(e.name)" /><i></i
              ><span class="av" [class]="av(e.name)"></span><span class="cnm"><b>{{ e.name }}</b><small>{{ b ? busyText() : e.post }}</small></span></label
            >
          } @empty {
            <div class="foe">Никого не нашли. Проверьте написание.</div>
          }
        </div>
      </div>
    }
  `,
  host: {
    class: 'fsel cupick',
    role: 'button',
    tabindex: '0',
    '[class.act]': 'open()',
    '(click)': 'toggle()',
    '(document:click)': 'outside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpPick {
  readonly people = input.required<PickPerson[]>();
  readonly value = model<string[]>([]);
  readonly placeholder = input('Выберите сотрудников');
  readonly busy = input<(name: string) => boolean>(() => false);
  readonly busyText = input('Уже выбран');
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly open = signal(false);
  protected readonly q = signal('');
  protected readonly pos = signal({ left: 0, top: 0, width: 0 });
  protected readonly short = short;
  protected readonly shown = computed(() => {
    const s = this.q().trim().toLowerCase();
    return this.people().filter((e) => !s || (e.name + ' ' + e.post).toLowerCase().includes(s));
  });
  protected readonly free = computed(() => this.shown().filter((e) => !this.busy()(e.name)));
  protected readonly allOn = computed(() => this.free().length > 0 && this.free().every((e) => this.value().includes(e.name)));

  protected av(n: string): string {
    const p = this.people().find((e) => e.name === n);
    return avCls(n, p?.av ?? 1);
  }
  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    const r = this.el.getBoundingClientRect();
    this.q.set('');
    this.pos.set({ left: r.left, top: r.bottom + 6, width: r.width });
    this.open.set(true);
    setTimeout(() => this.el.querySelector<HTMLInputElement>('.cupop .fsq')?.focus());
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.contains(e.target as Node)) this.open.set(false);
  }
  protected flip(n: string): void {
    const v = this.value();
    this.value.set(v.includes(n) ? v.filter((x) => x !== n) : [...v, n]);
  }
  protected all(on: boolean): void {
    const names = this.free().map((e) => e.name),
      v = this.value().filter((x) => !names.includes(x));
    this.value.set(on ? [...v, ...names] : v);
  }
  protected remove(n: string, e: Event): void {
    e.stopPropagation();
    this.value.set(this.value().filter((x) => x !== n));
  }
}
