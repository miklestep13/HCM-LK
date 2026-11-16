import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

/** Период: ключи дат «ГГГГММДД»; пустые — период не задан. Один день — a === b. */
export interface DateRange {
  a: string;
  b: string;
}
export const EMPTY_RANGE: DateRange = { a: '', b: '' };

/** «12.05.2026» попадает в период (или период не задан) */
export function inRange(r: DateRange, date: string): boolean {
  if (!r.a) return true;
  const k = dateKey(date);
  return !!k && k >= r.a && k <= (r.b || r.a);
}
const dateKey = (d: string) => {
  const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(d || '');
  return m ? m[3] + m[2] + m[1] : '';
};
const fmt = (k: string) => k.slice(6, 8) + '.' + k.slice(4, 6) + '.' + k.slice(0, 4);
const MON = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
/** «сегодня» демо-данных прототипа */
export const TODAY = new Date(2026, 8, 30);

/**
 * Поле-период в шапке фильтров (.dtin.ftrng): один день или диапазон, календарь во всплывающем окне.
 *   <app-date-range label="Дата публикации" [(value)]="range" />
 */
@Component({
  selector: 'app-date-range',
  template: `
    <!-- как app-select с подписью: одной строкой «Подпись: период» (подпись серая), пустой — «Подпись: Все» -->
    <span class="ft2lab">{{ label() }}</span>
    <span class="fsv" [title]="text()">{{ text() || 'Все' }}</span>
    <button class="dtb" type="button" aria-label="Выбрать период">
      <svg viewBox="0 0 16 16" fill="none">
        <rect
          x="2.2"
          y="3.6"
          width="11.6"
          height="10.2"
          rx="2"
          stroke="currentColor"
          stroke-width="1.4"
        />
        <path
          d="M5.4 2v3M10.6 2v3M2.2 6.8h11.6"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </svg>
    </button>
    @if (open()) {
      <div
        class="fpop calpop kbrng"
        [style.left.px]="pos().left"
        [style.top.px]="pos().top"
        (click)="$event.stopPropagation()"
      >
        <div class="calh">
          <button class="calnav" (click)="move(-1)">‹</button><b>{{ title() }}</b
          ><button class="calnav" (click)="move(1)">›</button>
        </div>
        <div class="calw">
          <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span
          ><span>Вс</span>
        </div>
        <div class="calg">
          @for (d of days(); track $index) {
            @if (d === 0) {
              <span class="cday out"></span>
            } @else {
              <span class="cday" [class]="dayCls(d)" (click)="pick(d)">{{ d }}</span>
            }
          }
        </div>
        <div class="kbrngf">
          <span>{{
            !a()
              ? 'Выберите день или начало периода'
              : !b()
                ? 'За выбранный день. Выберите конец периода'
                : 'За выбранный период'
          }}</span>
          @if (a()) {
            <button class="lnk" (click)="clear()">Сбросить</button>
          }
        </div>
      </div>
    }
  `,
  host: {
    class: 'fsel ft2fs dtin ftrng',
    role: 'button',
    tabindex: '0',
    '[class.act]': 'open()',
    '[class.is-empty]': '!value().a',
    '(click)': 'toggle()',
    '(document:click)': 'outside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeField {
  readonly label = input('Период');
  readonly value = model<DateRange>(EMPTY_RANGE);

  protected readonly open = signal(false);
  protected readonly pos = signal({ left: 0, top: 0 });
  protected readonly y = signal(TODAY.getFullYear());
  protected readonly m = signal(TODAY.getMonth());
  /** начало и конец выбора в окне (конец пустой — выбран один день) */
  protected readonly a = signal('');
  protected readonly b = signal('');
  private readonly el = inject(ElementRef<HTMLElement>);

  protected readonly text = computed(() => {
    const { a, b } = this.value();
    if (!a) return '';
    if (a === b || !b) return fmt(a);
    return (a.slice(0, 4) === b.slice(0, 4) ? fmt(a).slice(0, 5) : fmt(a)) + ' – ' + fmt(b);
  });
  protected readonly title = computed(() => MON[this.m()] + ' ' + this.y());
  /** ячейки месяца: 0 — пустая клетка до первого числа */
  protected readonly days = computed(() => {
    const start = (new Date(this.y(), this.m(), 1).getDay() + 6) % 7,
      dim = new Date(this.y(), this.m() + 1, 0).getDate();
    return [...Array(start).fill(0), ...Array.from({ length: dim }, (_, i) => i + 1)];
  });

  private key(d: number): string {
    return '' + this.y() + String(this.m() + 1).padStart(2, '0') + String(d).padStart(2, '0');
  }

  protected dayCls(d: number): string {
    const k = this.key(d),
      a = this.a(),
      z = this.b() || a;
    if (!a) return '';
    return k === a && k === z ? 'on' : k === a ? 'rs' : k === z ? 're' : k > a && k < z ? 'in' : '';
  }

  protected toggle(): void {
    if (this.open()) return this.open.set(false);
    const v = this.value();
    this.a.set(v.a);
    this.b.set(v.b && v.b !== v.a ? v.b : '');
    const base = v.a ? new Date(+v.a.slice(0, 4), +v.a.slice(4, 6) - 1, 1) : TODAY;
    this.y.set(base.getFullYear());
    this.m.set(base.getMonth());
    const r = this.el.nativeElement.getBoundingClientRect();
    this.pos.set({ left: Math.min(r.left, innerWidth - 262), top: r.bottom + 6 });
    this.open.set(true);
  }
  protected move(d: number): void {
    let m = this.m() + d,
      y = this.y();
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    this.m.set(m);
    this.y.set(y);
  }
  protected pick(d: number): void {
    const k = this.key(d),
      a = this.a(),
      b = this.b();
    if (!a || b) {
      this.a.set(k);
      this.b.set('');
      return this.apply();
    }
    if (k === a) {
      this.apply();
      return this.open.set(false);
    }
    if (k < a) {
      this.b.set(a);
      this.a.set(k);
    } else this.b.set(k);
    this.apply();
    setTimeout(() => this.open.set(false), 250);
  }
  protected clear(): void {
    this.a.set('');
    this.b.set('');
    this.apply();
  }
  private apply(): void {
    this.value.set({ a: this.a(), b: this.b() || this.a() });
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }
}
