import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, inject, signal, viewChild } from '@angular/core';
import { absCount, absDate } from '../../../core/demo/absence-store.service';
import { ABS_KINDS, ABS_KIND_GROUP, ABS_KIND_LABEL, ABS_STATUSES } from '../../../data/absence.data';
import { CAL_WD } from '../../../data/cal.data';
import { plural } from '../../../data/org.data';
import { ME_PHOTO, avCls } from '../../../data/people.data';
import { AbsEntry, AbsPerson } from '../../../interface/absence';
import { DateRangeField, TODAY } from '../../../shared/ui/date-range/date-range';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { PeriodBar } from '../../../shared/ui/period-bar/period-bar';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { ViewSwitch, ViewMode } from '../../../shared/ui/view-switch/view-switch';
import { AbsencesTable } from '../absences-table/absences-table';
import { MultiSelect } from '../../../shared/ui/multi-select/multi-select';
import { Select } from '../../../shared/ui/select/select';
import { AbsencesState } from '../absences.state';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAY = 864e5;

/** строка диаграммы: сотрудник и его отсутствия в периоде */
interface Row {
  p: AbsPerson;
  mine: boolean;
  added: boolean;
  bars: { x: AbsEntry; left: number; width: number; label: string; tip: string }[];
}

/**
 * Диаграмма Ганта «График отсутствий»: панель периода как в «Моем календаре» — «Сегодня», ‹ ›, период (2026 / Сентябрь 2026,
 * по стрелке — выбор года / месяца), вид «Месяц / Год»; под ней панель фильтров — поиск по сотруднику, вид отсутствия, статус. Строки: я, команды подразделений (название подразделения; у руководителя — несколько, каждая сворачивается),
 * «Добавленные» (можно убрать), внизу — «Добавить участника»: новая строка с выбором сотрудника из списка с поиском
 * (как в участниках встречи). У сотрудника — должность. Полоса — вид отсутствия цветом
 * (главные — ярко, остальные — светлее), неподтвержденные (черновик, согласование) — штриховкой и статусом в подписи; клик — карточка отсутствия.
 * Видно полгода или две недели; лента — три периода подряд, при прокрутке в соседний год / месяц он становится текущим, а лента
 * незаметно сдвигается (бесконечная прокрутка без упора).
 * Красная линия — сегодня; в месяце выходные — серым.
 */
@Component({
  selector: '[absences-gantt]',
  imports: [NgTemplateOutlet, FilterBar, PeriodBar, Select, MultiSelect, Icon, Float, Tooltip, ViewSwitch, AbsencesTable, DateRangeField],
  template: `
    <div class="ch"><h3>Отсутствия</h3></div>
    <app-filter-bar placeholder="Поиск по сотруднику" [(query)]="s.q" [(opened)]="s.ftOpen">
      <app-view-switch ftAction [options]="modes" [value]="s.mode()" (valueChange)="s.mode.set($any($event))" />
      @if (s.mode() === 'table') {
        <app-date-range label="Период" [(value)]="s.tper" />
      }
      <!-- показываемые виды — галочками; отпуск по уходу за ребенком по умолчанию снят -->
      <app-multi-select label="Вид отсутствия" [options]="kindLabels" [(value)]="s.kinds" />
      <app-select label="Статус" allLabel="Все" [options]="statuses" [(value)]="s.status" />
    </app-filter-bar>
    <div app-period-bar picker [class.hidden]="s.mode() === 'table'" [label]="period()" [views]="views" [value]="s.view()" (valueChange)="s.view.set($any($event))" (shift)="s.shift($event)" (today)="s.toToday()" (pick)="togglePer($event)"></div>
    @if (per(); as el) {
      <!-- выбор периода: год — списком, месяц — сеткой месяцев с переключением года -->
      <div class="fpop abpk" [class.amenu]="s.view() === 'year'" [appFloat]="el" (click)="$event.stopPropagation()">
        @if (s.view() === 'year') {
          @for (y of years; track y) {
            <button class="ami" [class.on]="y === s.year()" (click)="s.year.set(y); per.set(null)">{{ y }}</button>
          }
        } @else {
          <div class="abpkh">
            <button class="actb" title="Предыдущий год" aria-label="Предыдущий год" (click)="pkYear.set(pkYear() - 1)"><app-icon name="pgPrev" /></button>
            <b>{{ pkYear() }}</b>
            <button class="actb" title="Следующий год" aria-label="Следующий год" (click)="pkYear.set(pkYear() + 1)"><app-icon name="pgNext" /></button>
          </div>
          <div class="abpkg">
            @for (m of monthsShort; track $index) {
              <button [class.on]="pkYear() === s.year() && $index === s.month()" (click)="s.year.set(pkYear()); s.month.set($index); per.set(null)">{{ m }}</button>
            }
          </div>
        }
      </div>
    }
    <div class="cb">
      @if (s.mode() === 'table') {
        <div absences-table [draft]="draft()" (pick)="openPick($event)" (dropDraft)="draft.set(false); pick.set(null)"></div>
      }
      <div class="abw" #box [class.hidden]="s.mode() === 'table'" (scroll)="scrolled()">
        <div class="abg" [class.mon]="s.view() === 'month'" [style.--k]="k()" [style.min-width.px]="minW()">
          <!-- шапка: месяцы или дни -->
          <div class="abr abhd">
            <div class="abl">Сотрудник</div>
            <div class="abt">
              @for (c of cols(); track $index) {
                <span class="abc" [class.we]="c.we" [class.today]="c.today" [style.left.%]="c.left" [style.width.%]="c.width"
                  >{{ c.l }}@if (c.sub) {<small>{{ c.sub }}</small>}</span
                >
              }
            </div>
          </div>
          <ng-template #rowTpl let-r>
            <div class="abr" [class.abcur]="admin() && (s.who()?.n ?? me()) === r.p.n">
              <div class="abl" [class.abpick]="admin()" [attr.title]="admin() ? (r.mine ? 'Моя статистика' : 'Статистика сотрудника') : null" (click)="admin() && s.who.set(r.mine ? null : r.p)">
                <span class="av" [class]="av(r.p)" [style.background-image]="r.mine ? 'url(' + mePhoto + ')' : null"></span>
                <span class="cnm">
                  <b>{{ r.p.n }}{{ r.mine ? ' (вы)' : '' }}</b>
                  <small>{{ r.p.pos }}</small>
                </span>
                @if (r.added) {
                  <button class="actb dg" title="Убрать из графика" aria-label="Убрать из графика" (click)="$event.stopPropagation(); s.store.removeAdded(r.p.n)"><app-icon name="trashSm" /></button>
                }
              </div>
              <div class="abt">
                @for (c of cols(); track $index) {
                  <i class="abcl" [class.we]="c.we" [style.left.%]="c.left" [style.width.%]="c.width"></i>
                }
                @if (todayAt() !== null) {
                  <i class="abnow" [style.left.%]="todayAt()"></i>
                }
                @for (b of r.bars; track b.x.id) {
                  <button
                    class="abb"
                    [class]="'ab-' + group(b.x.kind)"
                    [class.plan]="b.x.status === 'Черновик' || b.x.status === 'Согласование'"
                    [class.rej]="b.x.status === 'Отклонено'"
                    [class.open]="b.x.open"
                    [style.left.%]="b.left"
                    [style.width.%]="b.width"
                    [appTip]="b.tip"
                    (click)="s.entry.set({ p: r.p, x: b.x, mine: r.mine })"
                  >
                    @if (b.label) {
                      <span>{{ b.label }}</span>
                    }
                  </button>
                }
              </div>
            </div>
          </ng-template>
          @if (meRow(); as r) {
            <ng-container *ngTemplateOutlet="rowTpl; context: { $implicit: r }" />
          }
          <!-- группы — подразделения (у руководителя может быть несколько), каждая сворачивается -->
          @for (t of teamRows(); track t.dep) {
            <button class="abgr" [class.on]="!s.teamClosed().has(t.dep)" (click)="s.toggleTeam(t.dep)">
              <app-icon name="chevDown" />{{ t.dep }}<span class="pntc">{{ t.rows.length }}</span>
            </button>
            @if (!s.teamClosed().has(t.dep)) {
              @for (r of t.rows; track r.p.n) {
                <ng-container *ngTemplateOutlet="rowTpl; context: { $implicit: r }" />
              } @empty {
                <div class="abe">Никого не нашли</div>
              }
            }
          }
          @if (addedRows().length || draft()) {
            <div class="abgr abgs">Добавленные<span class="pntc">{{ addedRows().length }}</span></div>
            @for (r of addedRows(); track r.p.n) {
              <ng-container *ngTemplateOutlet="rowTpl; context: { $implicit: r }" />
            }
            @if (draft()) {
              <!-- новая строка: выбор сотрудника, как в участниках встречи -->
              <div class="abr">
                <div class="abl">
                  <button type="button" class="absel" [class.act]="pick()" aria-label="Сотрудник" (click)="openPick($event)">
                    <span class="ph">Выберите сотрудника</span><app-icon name="chevDown" />
                  </button>
                  <button class="actb dg" title="Убрать строку" aria-label="Убрать строку" (click)="draft.set(false); pick.set(null)"><app-icon name="trashSm" /></button>
                </div>
                <div class="abt">
                  @for (c of cols(); track $index) {
                    <i class="abcl" [class.we]="c.we" [style.left.%]="c.left" [style.width.%]="c.width"></i>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>
      <!-- вне прокрутки: полоса прокрутки шкалы не перекрывает кнопку -->
      @if (s.mode() === 'cal' || admin()) {
        <button class="lnk lnkadd abadd" (click)="add($event)"><app-icon name="plus" />Добавить участника</button>
      }
      <div class="ablg" [class.hidden]="s.mode() === 'table'">
        @for (k of legend(); track k.k) {
          <span><i [class]="'ab-' + k.k"></i>{{ k.label }}</span>
        }
        <span class="ablgs"><i class="abplanb"></i>Неподтвержденный</span>
      </div>
    </div>
    @if (pick(); as el) {
      <div class="fpop selpop cupop mbpick" [appFloat]="el" [style.width.px]="Math.max(420, el.offsetWidth)" (click)="$event.stopPropagation()">
        <input class="fin fsq" placeholder="Поиск по ФИО или должности" [value]="pq()" (input)="pq.set($any($event.target).value)" />
        <div class="folist cul">
          @for (p of found(); track p.n) {
            <button class="mbko" (click)="choose(p.n)">
              <span class="av" [class]="av(p)"></span><span class="cnm"><b>{{ p.n }}</b><small>{{ p.pos }}</small></span>
            </button>
          } @empty {
            <div class="foe">Ничего не нашли. Проверьте написание.</div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './absences-gantt.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c ab-gantt', '(document:click)': 'pick.set(null); per.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbsencesGantt {
  protected readonly s = inject(AbsencesState);
  protected readonly kinds = ABS_KINDS;
  /** цвет полосы: виды дополнительного отпуска — цветом дополнительного */
  protected readonly group = ABS_KIND_GROUP;
  /** легенда — только виды, выбранные в фильтре «Вид отсутствия» (ничего не выбрано — все) */
  protected readonly legend = computed(() => {
    const on = this.s.kinds();
    return on.length ? ABS_KINDS.filter((k) => on.includes(k.label)) : ABS_KINDS;
  });
  protected readonly kindLabels = ABS_KINDS.map((k) => k.label);
  protected readonly statuses = ABS_STATUSES;
  protected readonly views = [
    { value: 'month' as const, label: 'Месяц' },
    { value: 'year' as const, label: 'Год' },
  ];
  protected readonly mePhoto = ME_PHOTO;
  protected readonly av = (p: AbsPerson) => avCls(p.n, p.av);

  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  protected readonly Math = Math;
  /** «Календарь / Таблица»; в таблице сотрудник видит свои заявки, администратор — заявки сотрудников */
  protected readonly modes: ViewMode[] = ['cal', 'table'];
  /** руководитель: клик по сотруднику — его статистика наверху */
  protected readonly admin = computed(() => this.s.store.role() === 'admin');
  protected readonly me = computed(() => this.s.store.me().n);

  // ——— выбор периода по стрелке у подписи ———
  protected readonly per = signal<HTMLElement | null>(null);
  protected readonly pkYear = signal(TODAY.getFullYear());
  protected readonly years = Array.from({ length: 5 }, (_, i) => TODAY.getFullYear() - 2 + i);
  protected readonly monthsShort = MONTHS.map((m) => m.slice(0, 3));
  protected togglePer(el: HTMLElement): void {
    if (this.per()) return this.per.set(null);
    this.pick.set(null);
    this.pkYear.set(this.s.year());
    this.per.set(el);
  }

  // ——— «Добавить участника»: новая строка с выбором (как в участниках встречи), список с поиском открыт сразу ———
  protected readonly draft = signal(false);
  protected readonly pick = signal<HTMLElement | null>(null);
  protected readonly pq = signal('');
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  protected readonly found = computed(() => {
    const q = this.pq().trim().toLowerCase(), added = this.s.store.added();
    return this.s.store.pool.filter((p) => !added.includes(p.n) && (!q || (p.n + ' ' + p.pos).toLowerCase().includes(q)));
  });
  protected add(e: Event): void {
    e.stopPropagation();
    this.draft.set(true);
    // новая строка в текущем виде (календарь или таблица) — список выбора сразу открыт
    setTimeout(() => this.host.querySelector<HTMLElement>(this.s.mode() === 'table' ? '.abtbl .absel' : '.abg .absel')?.click());
  }
  protected openPick(e: Event): void {
    e.stopPropagation();
    if (this.pick()) return this.pick.set(null);
    this.pq.set('');
    this.pick.set(e.currentTarget as HTMLElement);
  }
  protected choose(n: string): void {
    this.s.store.add([n]);
    this.pick.set(null);
    this.draft.set(false);
  }
  /** во сколько раз лента (три периода) шире видимой части: год — 6 (видно полгода), месяц — дней / 14 (видно две недели) */
  protected readonly k = computed(() => (this.s.view() === 'year' ? 6 : this.total() / 14));
  /** минимальная ширина ленты: день — не уже 56px (иначе даты «дд.мм» налезают друг на друга), месяц — не уже 80px */
  protected readonly minW = computed(() => 300 + (this.s.view() === 'year' ? 36 * 80 : this.total() * 56));
  private readonly cdr = inject(ChangeDetectorRef);
  /** лента сдвинута прокруткой — позицию уже поставили, автоматическая установка не нужна */
  private fromScroll = false;

  constructor() {
    afterRenderEffect(() => {
      this.s.range();
      if (this.s.mode() === 'table') return;
      const el = this.box().nativeElement;
      if (this.fromScroll) return void (this.fromScroll = false);
      // новый период (стрелки, «Сегодня», выбор, вид) — сегодня примерно на трети видимой части, иначе начало периода
      const { a, b } = this.s.focus(), vw = el.clientWidth - 300;
      el.scrollLeft = TODAY >= a && TODAY <= b ? this.px(+TODAY) - vw / 3 : this.px(+a);
    });
  }

  /** px на ленте ↔ дата */
  private px(ms: number): number {
    const el = this.box().nativeElement;
    return ((ms - +this.s.range().a) / (this.total() * DAY)) * (el.scrollWidth - 300);
  }
  private dateAt(x: number): number {
    const el = this.box().nativeElement;
    return +this.s.range().a + (x / (el.scrollWidth - 300)) * this.total() * DAY;
  }
  /** прокрутка: центр видимой части ушел в соседний период — он становится текущим, лента сдвигается на период */
  protected scrolled(): void {
    const el = this.box().nativeElement, mid = this.dateAt(el.scrollLeft + (el.clientWidth - 300) / 2), { a, b } = this.s.focus();
    const n = mid < +a ? -1 : mid >= +b + DAY ? 1 : 0;
    if (!n) return;
    // дата у левого края → сдвиг ленты → сразу перерисовать и встать на ту же дату (без кадра со скачком)
    const anchor = this.dateAt(el.scrollLeft);
    this.fromScroll = true;
    this.s.shift(n);
    this.cdr.detectChanges();
    el.scrollLeft = this.px(anchor);
  }

  protected readonly period = computed(() => (this.s.view() === 'year' ? String(this.s.year()) : MONTHS[this.s.month()] + ' ' + this.s.year()));
  private readonly total = computed(() => Math.round((+this.s.range().b - +this.s.range().a) / DAY) + 1);
  private readonly at = (d: Date) => ((+d - +this.s.range().a) / DAY / this.total()) * 100;

  /** колонки ленты: месяцы трех лет (ширина — по числу дней) или дни трех месяцев «дд.мм» (выходные, сегодня) */
  protected readonly cols = computed(() => {
    const { a } = this.s.range(), y = this.s.year() - 1;
    if (this.s.view() === 'year')
      return Array.from({ length: 36 }, (_, i) => {
        const s = new Date(y, i, 1), e = new Date(y, i + 1, 1);
        return { l: MONTHS[i % 12].slice(0, 3), sub: '', left: this.at(s), width: this.at(e) - this.at(s), we: false, today: false };
      });
    return Array.from({ length: this.total() }, (_, i) => {
      const d = new Date(+a + i * DAY), wd = (d.getDay() + 6) % 7;
      return { l: String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0'), sub: CAL_WD[wd].toLowerCase(), left: (i / this.total()) * 100, width: 100 / this.total(), we: wd > 4, today: +d === +TODAY };
    });
  });
  protected readonly todayAt = computed(() => {
    const { a, b } = this.s.range();
    return TODAY >= a && TODAY <= b ? this.at(TODAY) + (this.s.view() === 'month' ? 50 / this.total() : 0) : null;
  });

  private row(p: AbsPerson, mine = false, added = false): Row {
    const { a, b } = this.s.range(), mon = this.s.view() === 'month';
    const bars = this.s.visible(p).map((x) => {
      const f = absDate(x.from)!, t = absDate(x.to)!, s0 = f < a ? a : f, e0 = t > b ? b : t;
      const left = this.at(s0), width = this.at(new Date(+e0 + DAY)) - left;
      // подпись — вид и число дней, если умещается (день не уже 56px, в годе — месяц не уже 80px):
      // «Отгул · 3 дн.» → «Отгул» → «3 дн.»; не умещается ничего — только подсказка
      const px = (Math.min(+t, +b) - Math.max(+f, +a) + DAY) / DAY * (mon ? 56 : 80 / 30.4), kind = ABS_KIND_LABEL[x.kind];
      // неподтвержденное (черновик, согласование) и отклоненное — со статусом: «Отпуск · 14 дн. · Согласование»
      const days = absCount(x) + ' дн.', st = x.status === 'Согласовано' || x.status === 'Использовано' ? '' : ' · ' + x.status;
      const label = [kind + ' · ' + days + st, kind + st, kind + ' · ' + days, kind, days].find((l) => l.length * 6.6 + 20 <= px) ?? '';
      // подсказка: вид (жирным), период и дни, статус; у командировки — город, у больничного — открыт ли листок
      const per = x.open ? 'с ' + x.from + ' · листок открыт' : x.from === x.to ? x.from : x.from + ' – ' + x.to;
      const tip = [ABS_KIND_LABEL[x.kind] + (x.trip ? ' — ' + x.trip.city : ''), per + ' · ' + absCount(x) + ' ' + plural(absCount(x), 'день', 'дня', 'дней'), x.status].join('|');
      return { x, left, width, label, tip };
    });
    return { p, mine, added, bars };
  }
  protected readonly meRow = computed(() => (this.s.match(this.s.store.me()) ? this.row(this.s.store.me(), true) : null));
  protected readonly teamRows = computed(() => this.s.store.teams().map((t) => ({ dep: t.dep, rows: t.people.filter((p) => this.s.match(p)).map((p) => this.row(p)) })));
  protected readonly addedRows = computed(() => this.s.store.addedPeople().filter((p) => this.s.match(p)).map((p) => this.row(p, false, true)));
}
