import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { CAL_MONTHS_GEN } from '../../../data/cal.data';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CalState } from '../cal.state';
import { cHM, cIso, cMin } from '../cal.utils';

const ME = 'Иванов Павел Сергеевич';

/**
 * Быстрое создание встречи (как в Outlook): клик по пустому месту выделяет интервал, рядом — окно с названием, местом,
 * началом и концом, «Сохранить» — встреча на выделенное время. «Дополнительные сведения» и кнопка
 * в шапке — полная форма встречи (страница eventnew) с уже введенными данными.
 */
@Component({
  selector: 'app-cal-quick',
  imports: [Float, Icon, Select],
  template: `
    @if (s.quick(); as q) {
      <div class="fpop clqk" [appFloat]="anchor()" (click)="$event.stopPropagation()">
        <div class="clqh">
          <b>{{ date() }}</b>
          <button class="actb" title="Открыть полную форму" aria-label="Открыть полную форму" (click)="more()"><app-icon name="fit" /></button>
        </div>
        <div class="clqb">
          <input class="fin clqt" placeholder="Название встречи" [value]="t()" (input)="t.set(val($event))" (keydown.enter)="save()" />
          <input class="fin" placeholder="Добавьте расположение" [value]="place()" (input)="place.set(val($event))" (keydown.enter)="save()" />
          <div class="clqr">
            <app-select [options]="times" [value]="hm(q.s)" (valueChange)="setS($event)" />
            <app-select [options]="endTimes()" [value]="hm(q.e)" (valueChange)="setE($event)" />
          </div>
        </div>
        <div class="clqf">
          <button class="lnk" (click)="more()">Дополнительные сведения</button>
          <button class="btn pri" (click)="save()">Сохранить</button>
        </div>
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalQuick {
  protected readonly s = inject(CalState);
  private readonly toast = inject(ToastService);
  /** выделенный интервал в сетке или ячейка месяца */
  readonly anchor = input.required<HTMLElement>();
  protected readonly t = signal('');
  protected readonly place = signal('');
  protected readonly hm = cHM;
  protected readonly val = (e: Event) => (e.target as HTMLInputElement).value;
  /** время с шагом 30 минут; конец — позже начала */
  protected readonly times = Array.from({ length: 48 }, (_, i) => cHM(i * 30));
  protected readonly endTimes = computed(() => this.times.filter((x) => cMin(x) > (this.s.quick()?.s ?? 0)).concat('23:59'));
  protected readonly date = computed(() => {
    const d = this.s.quick()!.d;
    return d.getDate() + ' ' + CAL_MONTHS_GEN[d.getMonth()] + ' ' + d.getFullYear() + ' г.';
  });
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    afterNextRender(() => this.host.querySelector<HTMLInputElement>('.clqt')?.focus());
  }

  protected setS(v: string): void {
    const q = this.s.quick()!, s = cMin(v);
    this.s.quick.set({ ...q, s, e: Math.max(s + 30, s + (q.e - q.s)) });
  }
  protected setE(v: string): void {
    this.s.quick.update((q) => (q ? { ...q, e: v === '23:59' ? 24 * 60 - 1 : cMin(v) } : q));
  }
  protected save(): void {
    const q = this.s.quick()!, t = this.t().trim();
    if (!t) return this.toast.show('Введите название', 'Без названия встречу не сохранить.');
    const id = 'e' + Date.now();
    this.s.events.update((l) => [
      ...l,
      { id, t, d: cIso(q.d), s: q.s, e: q.e, all: 0, loc: this.place().trim(), link: '', org: ME, ppl: [ME], my: 'yes', col: 'blue', rep: null },
    ]);
    this.s.quick.set(null);
    this.s.flash(id);
    this.toast.show('Готово', 'Встреча «' + t + '» создана.');
  }
  /** полная форма с введенными данными */
  protected more(): void {
    const q = this.s.quick()!;
    this.s.quick.set(null);
    this.s.create({ ...q, t: this.t(), place: this.place() });
  }
}
