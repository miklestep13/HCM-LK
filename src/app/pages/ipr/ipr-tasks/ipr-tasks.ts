import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, output, signal } from '@angular/core';
import { IprStore, iprSortTasks, iprTaskSt } from '../../../core/demo/ipr-store.service';
import { LEARN_COURSES } from '../../../data/learn.data';
import { IprTask } from '../../../interface/ipr';
import { DateRange, EMPTY_RANGE, DateRangeField, inRange } from '../../../shared/ui/date-range/date-range';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { IprTaskAct, IprTaskCard } from '../../../widgets/ipr-task-card/ipr-task-card';

type Chip = 'work' | 'over' | 'done' | 'unrated';
const uniq = (a: string[]) => [...new Set(a)].filter(Boolean).sort((x, y) => x.localeCompare(y, 'ru'));

/**
 * Раздел «Задачи»: поиск, «Добавить» (черновик и утвержденный план), чипсы статусов и фильтры (срок, компетенция, автор),
 * карточки задач. Сворачивается стрелкой в шапке.
 */
@Component({
  selector: '[ipr-tasks]',
  imports: [FilterBar, Select, DateRangeField, Icon, IprTaskCard],
  template: `
    @let T = s.plan().tasks;
    <div class="ch">
      <button class="actb ipcol" title="Свернуть" (click)="cold.set(!cold())"><app-icon name="chevSm" /></button>
      <h3>Задачи</h3>
      <span class="chip">{{ T.length }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по задачам" [(query)]="q">
      @if (s.editable()) {
        <button ftAction class="btn pri ipadd" (click)="add.emit()">Добавить</button>
      }
      @if (T.length) {
        <div class="fchips" ftName="Статус">
          @for (c of chips(); track c.k) {
            <button class="fchip" [class.on]="f().has(c.k)" (click)="flip(c.k)">{{ c.label }} <em>{{ c.n }}</em></button>
          }
        </div>
        <app-date-range label="Срок" [(value)]="due" />
        <app-select label="Компетенция" [options]="compOpts()" allLabel="Все" placeholder="Компетенция" [(value)]="comp" />
        <app-select label="Автор" [options]="byOpts()" allLabel="Все" placeholder="Автор" [(value)]="by" />
      }
    </app-filter-bar>
    <div class="cb iptcb">
      @if (T.length) {
        <div class="iplist ipcards">
          @for (r of list(); track r.i) {
            <div
              ipr-task-card
              [task]="r.t"
              [index]="r.i"
              [status]="s.st()"
              [editable]="s.editable()"
              [open]="s.open().has(r.i)"
              [mgr]="s.isMgr()"
              [rate]="s.att()[r.i]"
              [cm]="(s.comments()[r.i] || []).length"
              [class.hidden]="!r.ok"
              (act)="act.emit($event)"
            ></div>
          }
        </div>
      } @else {
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTasks" /></div>
          <b>Задач пока нет</b>
          <small>{{ s.editable() ? 'Добавьте первую задачу: что нужно сделать, какой результат ожидается и к какому сроку.' : 'В этом плане нет задач.' }}</small>
        </div>
      }
    </div>
  `,
  host: { class: 'c mt ipsect', '[class.ipcold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprTasks {
  protected readonly s = inject(IprStore);
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly add = output<void>();
  readonly act = output<IprTaskAct>();

  protected readonly cold = signal(false);
  protected readonly q = signal('');
  protected readonly f = signal(new Set<Chip>());
  protected readonly due = signal<DateRange>(EMPTY_RANGE);
  protected readonly comp = signal('');
  protected readonly by = signal('');

  protected readonly compOpts = computed(() => uniq(this.s.plan().tasks.flatMap((t) => t.comps)));
  protected readonly byOpts = computed(() => uniq(this.s.plan().tasks.map((t) => t.by)));
  protected readonly chips = computed(() => {
    const T = this.s.plan().tasks;
    if (this.s.st() === 'Аттестация') return [{ k: 'unrated' as Chip, label: 'Не оценено', n: T.length - this.s.attN() }];
    return [
      { k: 'done' as Chip, label: 'Выполнено', n: T.filter((t) => t.done).length },
      { k: 'work' as Chip, label: 'Не выполнено', n: T.filter((t) => !t.done).length },
      { k: 'over' as Chip, label: 'Просрочено', n: T.filter((t) => iprTaskSt(t) === 'Просрочено').length },
    ];
  });

  private text(t: IprTask): string {
    return [t.t, t.res, t.crs ? LEARN_COURSES[t.crs]?.t : '', t.link, t.art, t.note, ...t.comps, t.due, t.by].join(' ').toLowerCase();
  }
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(),
      F = this.f(),
      A = this.s.att();
    return iprSortTasks(this.s.plan().tasks).map(({ t, i }) => {
      const st = iprTaskSt(t);
      const ok =
        (!F.size || (F.has('done') && t.done) || (F.has('work') && !t.done) || (F.has('over') && st === 'Просрочено') || (F.has('unrated') && !A[i])) &&
        (!q || this.text(t).includes(q)) &&
        inRange(this.due(), t.due) &&
        (!this.comp() || t.comps.includes(this.comp())) &&
        (!this.by() || t.by === this.by());
      return { t, i, ok };
    });
  });

  protected flip(k: Chip): void {
    this.f.update((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  }

  /** из таблицы компетенций — к задачам, которые ее развивают: фильтр по названию, карточки раскрыты */
  showComp(name: string): void {
    this.q.set(name);
    this.f.set(new Set());
    this.cold.set(false);
    this.s.open.set(new Set(this.s.plan().tasks.map((t, i) => (t.comps.includes(name) ? i : -1)).filter((i) => i >= 0)));
    (this.el.nativeElement as HTMLElement).scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}
