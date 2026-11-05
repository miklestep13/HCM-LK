import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, linkedSignal, model, output, signal } from '@angular/core';
import { ME, avCls } from '../../data/people.data';
import { shortFio } from '../../data/org.data';
import { Member } from '../../interface/member';
import { CalState } from '../../pages/cal/cal.state';
import { CAL_TODAY, calHits, cAdd, cFD, cHM, cHash, cKey, cMin, cPD } from '../../pages/cal/cal.utils';
import { CAL_WD } from '../../data/cal.data';
import { Float } from '../../shared/ui/float/float';
import { Select } from '../../shared/ui/select/select';
import { Icon } from '../../shared/ui/icon/icon';

/** занятый интервал на шкале, % ширины */
interface Block {
  left: number;
  width: number;
  mb: boolean;
  all: boolean;
  title: string;
}

const H0 = 8, H1 = 20, SPAN = (H1 - H0) * 60;
/** высота строки участника: поле выбора с ФИО и должностью */
const RH = 60;

/**
 * «Участники» с занятостью на шкале дня (как в сайдбаре встречи календаря) — для формы мероприятия и встречи.
 * Сверху «Добавить» — новая строка; сотрудник, подразделение или команда выбирается и меняется в строке (список с вкладками),
 * в строке — ФИО и должность или состав группы, справа — роль (список). Слева список, справа шкала 8–20 на всю ширину:
 * занятые интервалы, рамка времени встречи, предупреждение о пересечениях; сверху — день со стрелками (рамка встречи — в ее день), часы — «11:00»; клик по часу переносит встречу на этот день и час (move).
 * Подразделение или команда занята весь день (без проверки пересечений).
 *   <div class="c" busy-chart [(people)]="list" [pool]="pool" date="30.09.2026" t1="14:00" t2="15:30" (move)="setTime($event)"></div>
 */
@Component({
  selector: '[busy-chart]',
  imports: [Float, Icon, Select],
  template: `
    @let L = lanes();
    <div class="ch">
      <h3>{{ title() }}</h3>
      <span class="chip" title="Всего приглашенных с учетом подразделений и команд">{{ total() }}</span>
    </div>
    <div class="cb">
      <!-- день на шкале: переключение по дням; рамка встречи — только в ее день -->
      <div class="bcday">
        <button type="button" class="actb" title="Предыдущий день" aria-label="Предыдущий день" (click)="shift(-1)"><app-icon name="pgPrev" /></button>
        <b>{{ dayLabel() }}</b>
        <button type="button" class="actb" title="Следующий день" aria-label="Следующий день" (click)="shift(1)"><app-icon name="pgNext" /></button>
        @if (date() && view() !== date()) {
          <button type="button" class="lnk bcback" (click)="view.set(date())">К дню встречи</button>
        }
      </div>
      <div class="bcw">
        <div class="bcn">
          <div class="bch"><span class="bchn">Участник</span>@if (roles().length) {<span class="bchr">Роль</span>}</div>
          @for (r of L.rows; track r.i) {
            <div class="bcr" [class.cf]="r.conf">
              @if (r.n === me || ro()) {
                <!-- организатор (вы) и просмотр — без смены и удаления -->
                <span class="bcwho"
                  ><span class="av" [class]="r.av"></span><span class="cnm"><b [title]="r.n">{{ r.n }}{{ r.n === me ? ' (вы)' : '' }}</b><small>{{ r.sub }}</small></span></span
                >
                @if (roles().length) {
                  <span class="bcrl bcrlt">{{ r.role }}</span>
                }
                <span class="bctr"></span>
              } @else {
                <button type="button" class="bcsel" [class.act]="pick()?.i === r.i" aria-label="Участник" (click)="openPick($event, r.i)">
                  @if (r.n) {
                    <span class="av" [class]="r.av"></span><span class="cnm"><b [title]="r.n">{{ r.n }}</b><small>{{ r.sub }}</small></span>
                  } @else {
                    <span class="ph">Выберите сотрудника или команду</span>
                  }
                  <app-icon name="chevDown" />
                </button>
                @if (roles().length) {
                  <span class="bcrl" (click)="$event.stopPropagation()">
                    <app-select [options]="roles()" [value]="r.role" (valueChange)="setRole(r.i, $event)" />
                  </span>
                }
                <button type="button" class="actb dg" title="Убрать участника" aria-label="Убрать участника" (click)="remove(r.i)"><app-icon name="trashSm" /></button>
              }
            </div>
          } @empty {
            <div class="bcr bcem">{{ empty() }}</div>
          }
        </div>
        <div class="bcg">
          <div class="bct">
            @for (i of hours; track i) {
              <span [style.left.%]="(i * 100) / hours.length">{{ hm((h0 + i) * 60) }}</span>
            }
            @if (L.band; as b) {
              <i class="bcband" [style.left.%]="b.left" [style.width.%]="b.width"></i>
            }
            @for (r of L.rows; track r.i; let ri = $index) {
              <div class="bcl" [style.top.px]="34 + ri * RH">
                @for (b of r.blocks; track $index) {
                  <i class="bcbz" [class.mb]="b.mb" [class.all]="b.all" [style.left.%]="b.left" [style.width.%]="b.width" [title]="b.title"></i>
                }
              </div>
            }
            <div class="bchit" [class.ro]="ro()" [style.height.px]="34 + Math.max(1, L.rows.length) * RH" [title]="ro() ? '' : 'Нажмите на час, чтобы перенести встречу'" (click)="pickHour($event)"></div>
          </div>
        </div>
      </div>
      <!-- «Добавить участника» — под списком: новая строка, выбор сотрудника сразу открыт -->
      @if (pool().length && !ro()) {
        <button type="button" class="lnk lnkadd" (click)="add()"><app-icon name="plus" />Добавить участника</button>
      }
      @if (L.conf.length) {
        <div class="bcwarn">{{ confText() }}</div>
      } @else if (L.persons > 1 && L.band) {
        <div class="bcok"><svg viewBox="0 0 16 16" fill="none"><path d="m3.4 8.4 3 3 6.2-6.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>Все сотрудники свободны в это время</div>
      }
    </div>
    @if (pick(); as k) {
      <div class="fpop selpop cupop mbpick" [appFloat]="k.el" [style.width.px]="Math.max(480, k.el.offsetWidth)" (click)="$event.stopPropagation()">
        <input class="fin fsq" placeholder="Поиск по ФИО, подразделению или команде" [value]="pq()" (input)="pq.set($any($event.target).value)" />
        @if (kinds().length) {
          <div class="mbpk" role="tablist">
            @for (t of kinds(); track t[0]) {
              <button role="tab" [class.on]="pk() === t[0]" [attr.aria-selected]="pk() === t[0]" (click)="pk.set(t[0])">{{ t[1] }}</button>
            }
          </div>
        }
        <div class="folist cul">
          @for (x of found(); track x.n) {
            <button class="mbko" [class.on]="x.n === people()[k.i]?.n" (click)="choose(x)">
              <span class="av" [class]="av(x)"></span><span class="cnm"><b>{{ x.n }}</b><small>{{ x.pos }}</small></span>
              @if (x.n === people()[k.i]?.n) {
                <app-icon name="checkSm" />
              }
            </button>
          } @empty {
            <div class="foe">Ничего не нашли. Проверьте написание.</div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './busy-chart.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-busy', '(document:click)': 'pick.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusyChart {
  readonly people = model<Member[]>([]);
  /** кого можно добавить: сотрудники, подразделения и команды (kind); пусто — без «Добавить» */
  readonly pool = input<Member[]>([]);
  /** роли участника (колонка «Роль»); новый — addRole */
  readonly roles = input<string[]>([]);
  /** роль нового участника */
  readonly addRole = input('Участник');
  readonly title = input('Участники');
  readonly empty = input('Добавьте участников');
  /** день встречи: дд.мм.гггг */
  readonly date = input('');
  readonly t1 = input('');
  readonly t2 = input('');
  readonly allDay = input(false, { transform: booleanAttribute });
  /** только просмотр: без выбора, смены роли, удаления, добавления и переноса встречи */
  readonly ro = input(false, { transform: booleanAttribute });
  /** встреча календаря, которую показываем или правим, — не считается занятостью */
  readonly skip = input('');
  /** выбранный день и час: новая дата и время начала и окончания (длительность сохраняется) */
  readonly move = output<{ date: string; t1: string; t2: string }>();
  /** день на шкале (дд.мм.гггг): по умолчанию — день встречи, переключается стрелками */
  protected readonly view = linkedSignal(() => this.date() || cFD(CAL_TODAY));
  protected readonly hm = cHM;
  protected readonly dayLabel = computed(() => {
    const d = cPD(this.view());
    return d ? CAL_WD[(d.getDay() + 6) % 7] + ', ' + this.view() + (cKey(d) === cKey(CAL_TODAY) ? ' · сегодня' : '') : this.view();
  });
  protected shift(n: number): void {
    const d = cPD(this.view()) || CAL_TODAY;
    this.view.set(cFD(cAdd(d, n)));
  }

  private readonly cal = inject(CalState);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly Math = Math;
  protected readonly RH = RH;
  protected readonly me = ME[0];
  protected readonly h0 = H0;
  protected readonly hours = Array.from({ length: H1 - H0 }, (_, i) => i);
  protected readonly av = (m: Member) => (m.kind ? 'mbgrp' : avCls(m.n, m.av));
  /** приглашенных всего: группа — все ее сотрудники */
  protected readonly total = computed(() => this.people().reduce((a, p) => a + (p.n ? p.cnt || 1 : 0), 0));

  /** занятость человека в день: [начало, конец, под вопросом] — свои встречи из календаря, у коллег — демо по имени и дате */
  private busy(name: string, d: Date): [number, number, boolean][] {
    if (name === ME[0]) return this.cal.day(d).filter((o) => !o.ev.all && o.ev.my !== 'no').map((o) => [o.ev.s, o.ev.e, o.ev.my === 'maybe']);
    const own: [number, number, boolean][] = this.cal
      .events()
      .filter((e) => e.id !== this.skip() && !e.all && (e.org === name || e.ppl.includes(name)) && calHits(e, d))
      .map((e) => [e.s, e.e, false]);
    const h = cHash(name + cKey(d)), n = d.getDay() % 6 === 0 ? 0 : 1 + Math.floor(h * 3);
    for (let i = 0; i < n; i++) {
      const s = (9 + Math.floor(cHash(name + i + cKey(d)) * 9)) * 60 + (cHash(name + i) < 0.5 ? 0 : 30);
      own.push([s, s + (cHash(name + i + 'd') < 0.5 ? 60 : 90), cHash(name + i + 'm') < 0.25]);
    }
    return own;
  }

  protected readonly lanes = computed(() => {
    const d = cPD(this.view()), pc = (m: number) => ((m - H0 * 60) / SPAN) * 100;
    // рамка встречи и пересечения — только в день встречи
    const s = cMin(this.t1()), e = this.t2() ? cMin(this.t2()) : s + 60, has = !!d && this.view() === this.date() && !this.allDay() && !!this.t1();
    const rows = this.people().map((p, i) => {
      if (!p.n) return { i, n: '', sub: '', role: p.role || this.addRole(), av: '', conf: false, blocks: [] as Block[] };
      if (p.kind)
        return {
          i, n: p.n, sub: p.pos, role: p.role || this.addRole(), av: 'mbgrp', conf: false,
          blocks: [{ left: 0, width: 100, mb: false, all: true, title: (p.kind === 'dep' ? 'Подразделение' : 'Команда') + ' занято весь день' }],
        };
      const B = d ? this.busy(p.n, d) : [];
      return {
        i,
        n: p.n,
        sub: p.pos + (p.dep ? ' · ' + p.dep : ''),
        role: p.role || this.addRole(),
        av: avCls(p.n, p.av),
        conf: has && B.some((b) => b[0] < e && b[1] > s),
        blocks: B.filter((b) => b[1] > H0 * 60 && b[0] < H1 * 60).map((b) => {
          const l = pc(Math.max(b[0], H0 * 60)), r = pc(Math.min(b[1], H1 * 60));
          return { left: l, width: Math.max(0.5, r - l - 0.3), mb: b[2], all: false, title: (b[2] ? 'Под вопросом' : 'Занят') + ' ' + cHM(b[0]) + '–' + cHM(b[1]) };
        }),
      };
    });
    const bl = pc(Math.max(s, H0 * 60)), br = pc(Math.min(e, H1 * 60));
    const band = has && br > 0 && bl < 100 ? { left: bl, width: Math.max(0.6, br - bl) } : null;
    return { rows, band, conf: rows.filter((r) => r.conf).map((r) => r.n), persons: this.people().filter((p) => p.n && !p.kind).length };
  });
  protected readonly confText = computed(() => {
    const c = this.lanes().conf;
    const who = c.length === 1 && c[0] === ME[0] ? 'вы заняты' : (c.length === 1 ? 'занят ' : 'заняты ') + c.map((n) => (n === ME[0] ? 'вы' : shortFio(n))).join(', ');
    return ('В это время ' + who).replace(/\.?$/, '.') + (this.ro() ? '' : ' Нажмите на свободный час в шкале, чтобы перенести встречу.');
  });

  /** клик по шкале — встреча переносится на этот час */
  protected pickHour(e: MouseEvent): void {
    if (this.ro()) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect(), h = H0 + Math.min(H1 - H0 - 1, Math.floor(((e.clientX - r.left) / r.width) * (H1 - H0)));
    const du = this.t1() && this.t2() ? Math.max(15, cMin(this.t2()) - cMin(this.t1())) : 60;
    this.move.emit({ date: this.view(), t1: cHM(h * 60), t2: cHM(Math.min(23 * 60 + 45, h * 60 + du)) });
  }

  // ——— выбор в строке: список с поиском и вкладками (как в таблице участников) ———
  protected readonly pick = signal<{ el: HTMLElement; i: number } | null>(null);
  protected readonly pq = signal('');
  protected readonly pk = signal('all');
  protected readonly kinds = computed(() => {
    const p = this.pool(), k: [string, string][] = [['all', 'Все'], ['emp', 'Сотрудники']];
    if (p.some((x) => x.kind === 'dep')) k.push(['dep', 'Подразделения']);
    if (p.some((x) => x.kind === 'team')) k.push(['team', 'Команды']);
    return k.length > 2 ? k : [];
  });
  protected readonly found = computed(() => {
    const k = this.pick(), s = this.pq().trim().toLowerCase(), t = this.pk();
    if (!k) return [];
    const skip = this.people().filter((_, j) => j !== k.i).map((m) => m.n);
    return this.pool().filter((x) => !skip.includes(x.n) && (t === 'all' || (x.kind || 'emp') === t) && (!s || (x.n + ' ' + x.pos).toLowerCase().includes(s)));
  });
  protected openPick(e: Event, i: number): void {
    e.stopPropagation();
    if (this.pick()?.i === i) return this.pick.set(null);
    this.pq.set('');
    this.pk.set('all');
    this.pick.set({ el: e.currentTarget as HTMLElement, i });
  }
  /** выбранный сотрудник или группа — в ту же строку, роль строки остается */
  protected choose(x: Member): void {
    const i = this.pick()!.i, role = this.people()[i]?.role || this.addRole();
    this.people.set(this.people().map((m, j) => (j === i ? { ...x, role } : m)));
    this.pick.set(null);
  }
  /** «Добавить участника» — новая пустая строка внизу, выбор сразу открыт */
  protected add(): void {
    this.people.set([...this.people(), { n: '', pos: '', av: 0, role: this.addRole() }]);
    setTimeout(() => {
      const b = [...this.host.querySelectorAll<HTMLElement>('.bcsel')].pop();
      b?.click();
    });
  }
  protected setRole(i: number, role: string): void {
    this.people.set(this.people().map((m, j) => (j === i ? { ...m, role } : m)));
  }
  protected remove(i: number): void {
    this.pick.set(null);
    this.people.set(this.people().filter((_, j) => j !== i));
  }
}
