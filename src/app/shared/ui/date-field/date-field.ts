import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';

const MON = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

/**
 * Поле даты (.dtin): ввод «дд.мм.гггг» вручную или выбор в календаре (кнопка справа).
 *   <app-date-field [(value)]="date" />
 * value меняется при вводе; (committed) — когда дата окончательно выбрана (календарь, Enter, уход из поля).
 */
@Component({
  selector: 'app-date-field',
  template: `
    <input class="fin" [placeholder]="placeholder()" [value]="value()" (input)="value.set($any($event.target).value)"
      (change)="value.set($any($event.target).value)" />
    <button class="dtb" type="button" aria-label="Выбрать дату" (click)="toggle($event)">
      <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3.4" width="12" height="10.4" rx="2" stroke="currentColor" stroke-width="1.4" /><path d="M5.2 1.8v2.6M10.8 1.8v2.6M2 6.6h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
    </button>
    @if (open()) {
      <div class="fpop calpop" [style.left.px]="pos().left" [style.top.px]="pos().top" (click)="$event.stopPropagation()">
        <div class="calh">
          <button class="calnav" (click)="move(-1)">‹</button><b>{{ title() }}</b><button class="calnav" (click)="move(1)">›</button>
        </div>
        <div class="calw"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>
        <div class="calg">
          @for (d of days(); track $index) {
            @if (d === 0) {
              <span class="cday out"></span>
            } @else {
              <span class="cday" [class.on]="isSel(d)" (click)="pick(d)">{{ d }}</span>
            }
          }
        </div>
      </div>
    }
  `,
  host: { class: 'dtin', '(document:click)': 'outside($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateField {
  readonly value = model('');
  readonly placeholder = input('дд.мм.гггг');
  protected readonly open = signal(false);
  protected readonly pos = signal({ left: 0, top: 0 });
  protected readonly y = signal(2026);
  protected readonly m = signal(5);
  private readonly el = inject(ElementRef<HTMLElement>);

  private parsed(): Date | null {
    const r = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(this.value().trim());
    return r ? new Date(+r[3], +r[2] - 1, +r[1]) : null;
  }
  protected readonly title = computed(() => MON[this.m()] + ' ' + this.y());
  protected readonly days = computed(() => {
    const start = (new Date(this.y(), this.m(), 1).getDay() + 6) % 7, dim = new Date(this.y(), this.m() + 1, 0).getDate();
    return [...Array(start).fill(0), ...Array.from({ length: dim }, (_, i) => i + 1)];
  });
  protected isSel(d: number): boolean {
    const s = this.parsed();
    return !!s && s.getDate() === d && s.getMonth() === this.m() && s.getFullYear() === this.y();
  }
  protected toggle(e: Event): void {
    e.stopPropagation();
    if (this.open()) return this.open.set(false);
    const s = this.parsed();
    this.y.set(s ? s.getFullYear() : 2026);
    this.m.set(s ? s.getMonth() : 5);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.pos.set({ left: Math.min(r.left, innerWidth - 262), top: r.bottom + 6 });
    this.open.set(true);
  }
  protected move(d: number): void {
    let m = this.m() + d, y = this.y();
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    this.m.set(m);
    this.y.set(y);
  }
  protected pick(d: number): void {
    this.value.set(String(d).padStart(2, '0') + '.' + String(this.m() + 1).padStart(2, '0') + '.' + this.y());
    this.open.set(false);
  }
  protected outside(e: Event): void {
    if (this.open() && !this.el.nativeElement.contains(e.target as Node)) this.open.set(false);
  }
}
