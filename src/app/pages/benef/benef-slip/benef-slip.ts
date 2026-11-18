import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { BENEF_PERIODS, PAY_SLIP, SLIP_FORM, SLIP_FORM_NEXT } from '../../../data/benef.data';
import { fmt } from '../../../data/shop.data';
import { SlipForm, SlipFormLine } from '../../../interface/benef';
import { DateRange, DateRangeField, EMPTY_RANGE } from '../../../shared/ui/date-range/date-range';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const endOf = (r: DateRange) => r.b || r.a;
const START = BENEF_PERIODS[0];
const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const SHORT = ['янв.', 'фев.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];

/** Месяцы периода, ближайший к концу диапазона — первый */
function monthsOf(a: string, b: string): string[] {
  let y = +b.slice(0, 4);
  let m = +b.slice(4, 6);
  const start = a.slice(0, 6);
  const out: string[] = [];
  for (let i = 0; i < 36 && y > 0; i++) {
    const key = String(y) + String(m).padStart(2, '0');
    out.push(key);
    if (key <= start) break;
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}

/**
 * «Расчетный листок»: период по умолчанию — предыдущий месяц.
 * Сам листок скрыт, пока не нажата «Сформировать отчет».
 * Ближайший месяц — бланк с отпуском; следующий — без отпуска и лишних НДФЛ.
 */
@Component({
  selector: '[benef-slip]',
  imports: [DateRangeField, Select, Icon],
  template: `
    <div class="ch"><h3>Расчетный листок</h3></div>
    <div class="cb">
      <div class="ftrow bfrow">
        <app-date-range label="Период" [value]="range()" (valueChange)="setRange($event)" />
        <app-select label="Быстрый выбор" allLabel="Все" [options]="periodNames" [value]="preset()" (valueChange)="setPreset($event)" />
        <button class="btn pri" type="button" (click)="load()">Сформировать отчет</button>
      </div>

      @if (!ready()) {
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTasks" /></div>
          <b>Отчет не сформирован</b>
          <small>Период уже выбран. Нажмите «Сформировать отчет», чтобы увидеть листок.</small>
        </div>
      } @else {
        <div class="slips">
          @for (m of months(); track m; let i = $index) {
          @let form = formOf(i);
          <div class="slipacc" [class.open]="open().has(m)">
            <div class="slipach" (click)="toggle(m)">
              <button type="button" class="actb" (click)="$event.stopPropagation(); toggle(m)" [attr.aria-expanded]="open().has(m)" [title]="open().has(m) ? 'Свернуть' : 'Развернуть'">
                <app-icon name="chevSm" />
              </button>
              <div class="slipacct">Расчетный листок за {{ label(m) }}</div>
            </div>
            @if (open().has(m)) {
              <div class="slipdoc">
                <div class="sliphead">
                  <div class="sliphead-l">
                    <div><span>Сотрудник:</span><b>{{ s.name }}</b></div>
                    <div><span>Должность:</span><b>{{ s.role }}</b></div>
                    <div><span>Организация:</span><b>{{ s.org }}</b></div>
                    <div><span>Подразделение:</span><b>{{ s.unit }}</b></div>
                  </div>
                  <div class="sliphead-r">
                    <div><span>К выплате:</span><b>{{ form.debtEnd }}</b></div>
                    <div><span>Оклад (тариф):</span><b>{{ tariff() }}</b></div>
                  </div>
                </div>
                <div class="tw">
                  <table class="tbl slipcopy">
                    <thead>
                      <tr>
                        <th rowspan="2">Вид</th>
                        <th rowspan="2" class="num">Период</th>
                        <th colspan="2" class="mid">Рабочие</th>
                        <th rowspan="2" class="num">Оплачено</th>
                        <th rowspan="2" class="num sum">Сумма</th>
                        <th rowspan="2" class="slipsep">Вид</th>
                        <th rowspan="2" class="num">Период</th>
                        <th rowspan="2" class="num sum">Сумма</th>
                      </tr>
                      <tr>
                        <th class="num">Дни</th>
                        <th class="num">Часы</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (line of formLines(form); track $index) {
                        <tr>
                          @if (line.left && line.left.group) {
                            <td class="gl" colspan="5">{{ line.left.group }}</td>
                            <td class="num sum gl">{{ line.left.total }}</td>
                          } @else if (line.left) {
                            <td>{{ line.left.name }}</td>
                            <td class="num">{{ per(line.left, m) }}</td>
                            <td class="num">{{ line.left.days }}</td>
                            <td class="num">{{ line.left.hours }}</td>
                            <td class="num">{{ line.left.paid }}</td>
                            <td class="num sum">{{ line.left.amt }}</td>
                          } @else {
                            <td></td><td></td><td></td><td></td><td></td><td></td>
                          }
                          @if (line.right && line.right.group) {
                            <td class="slipsep gl" colspan="2">{{ line.right.group }}</td>
                            <td class="num sum gl">{{ line.right.total }}</td>
                          } @else if (line.right) {
                            <td class="slipsep">{{ line.right.name }}</td>
                            <td class="num">{{ per(line.right, m) }}</td>
                            <td class="num sum">{{ line.right.amt }}</td>
                          } @else {
                            <td class="slipsep"></td><td></td><td></td>
                          }
                        </tr>
                      }
                      <tr>
                        <td colspan="5">Долг предприятия на начало</td>
                        <td class="num sum">{{ form.debtStart }}</td>
                        <td class="slipsep" colspan="2">Долг предприятия на конец</td>
                        <td class="num sum">{{ form.debtEnd }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="sliptax">Общий облагаемый доход: <b>{{ tax() }}</b></div>
              </div>
            }
          </div>
          }
        </div>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefSlip {
  private readonly toast = inject(ToastService);
  protected readonly s = PAY_SLIP;
  protected readonly periodNames = BENEF_PERIODS.map((p) => p.name);
  /** открытые месяцы; после запроса раскрыт только ближайший */
  protected readonly open = signal<ReadonlySet<string>>(new Set());
  protected readonly range = signal<DateRange>({ a: START.a, b: START.b });
  protected readonly preset = signal(START.name);
  /** листок скрыт, пока расчет не запрошен */
  protected readonly ready = signal(false);
  private hold = false;

  protected tariff(): string {
    return fmt(this.s.tariff).replace(/ /g, '\u00a0') + '\u00a0₽';
  }
  protected tax(): string {
    const [a, b] = this.s.taxable.toFixed(2).split('.');
    return fmt(+a).replace(/ /g, '\u00a0') + ',' + b + '\u00a0₽';
  }
  protected months(): string[] {
    const a = this.range().a;
    const b = endOf(this.range());
    return a && b && a <= b ? monthsOf(a, b) : [];
  }
  protected label(key: string): string {
    return MONTHS[+key.slice(4, 6) - 1] + ' ' + key.slice(0, 4);
  }
  protected toggle(key: string): void {
    const next = new Set(this.open());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.open.set(next);
  }
  /** период строки: фиксированная дата или месяц листка / предыдущий */
  protected per(line: SlipFormLine | undefined, key: string): string {
    if (!line) return '';
    if (line.period) return line.period;
    if (!line.when) return '';
    let y = +key.slice(0, 4);
    let mo = +key.slice(4, 6) - 1;
    if (line.when === 'prev') {
      mo -= 1;
      if (mo < 0) {
        mo = 11;
        y -= 1;
      }
    }
    return SHORT[mo] + ' ' + y;
  }
  /** 0 — бланк с отпуском; дальше — упрощенный пример без отпуска и лишних НДФЛ */
  protected formOf(i: number): SlipForm {
    return i === 0 ? SLIP_FORM : SLIP_FORM_NEXT;
  }
  protected formLines(form: SlipForm): { left?: SlipFormLine; right?: SlipFormLine }[] {
    const n = Math.max(form.left.length, form.right.length);
    return Array.from({ length: n }, (_, i) => ({ left: form.left[i], right: form.right[i] }));
  }

  protected setRange(v: DateRange): void {
    this.range.set(v);
    this.afterDates();
  }
  protected setPreset(name: string): void {
    this.hold = true;
    this.preset.set(name);
    this.ready.set(false);
    const p = BENEF_PERIODS.find((x) => x.name === name);
    this.range.set(p ? { a: p.a, b: p.b } : EMPTY_RANGE);
    queueMicrotask(() => (this.hold = false));
  }
  protected load(): void {
    const a = this.range().a, b = endOf(this.range());
    if (!a || !b) {
      this.toast.show('Укажите период', 'Выберите даты или готовый период, затем получите расчет.');
      return;
    }
    if (a > b) {
      this.toast.show('Проверьте даты', 'Дата начала позже даты окончания.');
      return;
    }
    const list = monthsOf(a, b);
    this.open.set(new Set(list[0] ? [list[0]] : []));
    this.ready.set(true);
  }

  private afterDates(): void {
    if (this.hold) return;
    const r = this.range();
    const hit = BENEF_PERIODS.find((p) => r.a === p.a && endOf(r) === p.b);
    this.preset.set(hit?.name ?? '');
    this.ready.set(false);
  }
}
