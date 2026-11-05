import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { parseDT } from '../../../core/demo/events-store.service';
import { CAL_MONTHS_GEN, CAL_WD } from '../../../data/cal.data';
import { EVENT_REPEAT, EVENT_REPEAT_END, EVENT_REPEAT_UNIT } from '../../../data/events.data';
import { plural } from '../../../data/org.data';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { EventnewState } from '../eventnew.state';

const END_KEY: ('never' | 'date' | 'cnt')[] = ['never', 'date', 'cnt'];
/** «в первый понедельник / в первую среду / в первое воскресенье»: род — по дню недели */
const ORD: Record<'m' | 'f' | 'n', string[]> = {
  m: ['первый', 'второй', 'третий', 'четвертый', 'последний'],
  f: ['первую', 'вторую', 'третью', 'четвертую', 'последнюю'],
  n: ['первое', 'второе', 'третье', 'четвертое', 'последнее'],
};
const WD_GENDER: ('m' | 'f' | 'n')[] = ['m', 'm', 'f', 'm', 'f', 'f', 'n'];
const WD_ACC = ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'];

/**
 * «Повторение» (как в форме встречи календаря): правило; «Каждые N дней / недель / месяцев / лет»;
 * для еженедельного — дни недели; для ежемесячного — то же число или тот же день недели месяца;
 * окончание — никогда, в дату или после N повторений; итог одной строкой. Начало повторений — дата мероприятия.
 * Просмотр (s.ro): только итог (s.repText).
 */
@Component({
  selector: '[eventnew-repeat]',
  imports: [Field, Select, DateField, Icon],
  template: `
    @let f = s.f();
    <div class="ch"><h3>Повторение</h3></div>
    @if (s.ro()) {
      <div class="cb"><div class="ensum env"><app-icon name="refresh" />{{ s.repText() }}</div></div>
    } @else {
    <div class="cb">
      <div class="frm enrp">
        <app-field label="Повторять" filled>
          <app-select [options]="kinds" [value]="f.repKind" (valueChange)="setKind($event)" />
        </app-field>
        @if (unit(); as u) {
          <div class="enint">
            <span>{{ every() }}</span>
            <input class="fin" type="number" min="1" max="30" aria-label="Интервал" [value]="f.repN" (change)="setN($event)" />
            <span>{{ u }}</span>
          </div>
        }
      </div>
      @if (f.repKind === 'Еженедельно') {
        <div class="enwd" role="group" aria-label="Дни недели">
          @for (w of wd; track w; let i = $index) {
            <button type="button" [class.on]="f.repDays.includes(i)" (click)="toggleDay(i)">{{ w }}</button>
          }
        </div>
      }
      @if (f.repKind === 'Ежемесячно' && day()) {
        <div class="frm enrp">
          <app-field label="Когда" filled>
            <app-select [options]="monthOpts()" [value]="monthOpts()[f.repMonth === 'week' ? 1 : 0]" (valueChange)="s.set('repMonth', $event === monthOpts()[1] ? 'week' : 'day')" />
          </app-field>
        </div>
      }
      @if (f.repKind !== 'Не повторять') {
        <div class="frm enrp">
          <app-field label="Окончание" filled>
            <app-select [options]="ends" [value]="ends[endIdx()]" (valueChange)="setEnd($event)" />
          </app-field>
          @if (f.repEnd === 'date') {
            <app-field label="Дата завершения" required [filled]="!!f.repTo" [error]="s.bad() === 'repTo'">
              <app-date-field [value]="f.repTo" (valueChange)="s.set('repTo', $event)" />
            </app-field>
          } @else if (f.repEnd === 'cnt') {
            <div class="enint">
              <span>После</span>
              <input class="fin" type="number" min="1" max="99" aria-label="Количество повторений" [value]="f.repCount" (change)="setCount($event)" />
              <span>{{ countWord() }}</span>
            </div>
          }
        </div>
        <div class="ensum"><app-icon name="refresh" />{{ summary() }}</div>
      }
    </div>
    }
  `,
  host: { class: 'c mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventnewRepeat {
  protected readonly s = inject(EventnewState);
  protected readonly kinds = EVENT_REPEAT;
  protected readonly ends = EVENT_REPEAT_END;
  protected readonly wd = CAL_WD;

  /** день мероприятия (начало повторений) */
  protected readonly day = computed(() => parseDT(this.s.f().date, ''));
  private readonly wdi = computed(() => ((this.day()?.getDay() ?? 1) + 6) % 7);
  protected readonly unit = computed(() => {
    const u = EVENT_REPEAT_UNIT[this.s.f().repKind];
    return u ? plural(this.s.f().repN || 1, u[0], u[1], u[2]) : '';
  });
  /** «Каждый 1 месяц» / «Каждую 1 неделю» / «Каждые 2 недели» */
  protected readonly every = computed(() => {
    const n = this.s.f().repN || 1, one = n % 10 === 1 && n % 100 !== 11;
    return !one ? 'Каждые' : this.s.f().repKind === 'Еженедельно' ? 'Каждую' : 'Каждый';
  });
  protected readonly endIdx = computed(() => END_KEY.indexOf(this.s.f().repEnd));
  protected readonly countWord = computed(() => plural(this.s.f().repCount || 1, 'повторения', 'повторений', 'повторений'));
  /** «30-го числа» / «в последний вторник» — по дате мероприятия */
  protected readonly monthOpts = computed(() => {
    const d = this.day()!, nth = Math.min(4, Math.ceil(d.getDate() / 7) - 1);
    return ['Каждый месяц ' + d.getDate() + '-го числа', 'Каждый месяц в ' + ORD[WD_GENDER[this.wdi()]][nth] + ' ' + WD_ACC[this.wdi()]];
  });

  /** итог: «Каждые 2 недели по пн и ср, до 31.12.2026» */
  protected readonly summary = computed(() => {
    const f = this.s.f(), d = this.day(), n = f.repN || 1;
    const every = (u: [string, string, string]) => 'Каждые ' + n + ' ' + plural(n, u[0], u[1], u[2]);
    let t = '';
    switch (f.repKind) {
      case 'Ежедневно':
        t = n === 1 ? 'Каждый день' : every(EVENT_REPEAT_UNIT['Ежедневно']);
        break;
      case 'По рабочим дням':
        t = 'По рабочим дням, пн–пт';
        break;
      case 'Еженедельно': {
        const days = [...f.repDays].sort().map((i) => CAL_WD[i].toLowerCase());
        t = (n === 1 ? 'Каждую неделю' : every(EVENT_REPEAT_UNIT['Еженедельно'])) + (days.length ? ' по ' + days.join(', ') : '');
        break;
      }
      case 'Ежемесячно':
        t = d ? this.monthOpts()[f.repMonth === 'week' ? 1 : 0].replace('Каждый месяц', n === 1 ? 'Каждый месяц' : every(EVENT_REPEAT_UNIT['Ежемесячно'])) : 'Каждый месяц';
        break;
      case 'Ежегодно':
        t = (n === 1 ? 'Каждый год' : every(EVENT_REPEAT_UNIT['Ежегодно'])) + (d ? ' ' + d.getDate() + ' ' + CAL_MONTHS_GEN[d.getMonth()] : '');
        break;
    }
    const start = f.date ? ', с ' + f.date : '';
    const end = f.repEnd === 'date' && f.repTo ? ' по ' + f.repTo : f.repEnd === 'cnt' ? ', ' + f.repCount + ' ' + plural(f.repCount, 'раз', 'раза', 'раз') : ', без окончания';
    return t + start + end;
  });

  protected setKind(v: string): void {
    const f = this.s.f();
    this.s.set('repKind', v);
    // еженедельно — по умолчанию день недели мероприятия
    if (v === 'Еженедельно' && !f.repDays.length) this.s.set('repDays', [this.wdi()]);
  }
  protected setN(e: Event): void {
    const v = Math.max(1, Math.min(30, Math.round(+(e.target as HTMLInputElement).value) || 1));
    (e.target as HTMLInputElement).value = String(v);
    this.s.set('repN', v);
  }
  protected setCount(e: Event): void {
    const v = Math.max(1, Math.min(99, Math.round(+(e.target as HTMLInputElement).value) || 1));
    (e.target as HTMLInputElement).value = String(v);
    this.s.set('repCount', v);
  }
  protected setEnd(v: string): void {
    this.s.set('repEnd', END_KEY[this.ends.indexOf(v)] || 'never');
  }
  /** день недели: хотя бы один остается выбранным */
  protected toggleDay(i: number): void {
    const d = this.s.f().repDays;
    if (d.includes(i) && d.length === 1) return;
    this.s.set('repDays', d.includes(i) ? d.filter((x) => x !== i) : [...d, i]);
  }
}
