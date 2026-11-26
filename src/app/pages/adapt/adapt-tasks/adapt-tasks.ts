import { ChangeDetectionStrategy, Component, computed, effect, inject, output, signal } from '@angular/core';
import { iprPl, iprSortTasks, iprTaskSt } from '../../../core/demo/ipr-store.service';
import { AdaptTask } from '../../../data/adapt.data';
import { LEARN_COURSES } from '../../../data/learn.data';
import { IprTask } from '../../../interface/ipr';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { DateRange, DateRangeField, EMPTY_RANGE, inRange } from '../../../shared/ui/date-range/date-range';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { IprTaskAct, IprTaskCard } from '../../../widgets/ipr-task-card/ipr-task-card';
import { AdaptStore } from '../adapt-store';

type Chip = 'work' | 'over' | 'done';
const uniq = (a: string[]) => [...new Set(a)].filter(Boolean).sort((x, y) => x.localeCompare(y, 'ru'));
const stageOf = (t: IprTask) => (t as AdaptTask).stage || '';
const rangeOn = (r: DateRange) => !!(r.a || r.b);

/**
 * «Задачи» плана адаптации: карточки как у ИПР, табы этапов (без «Все»; в черновике — ✎ и корзина).
 * «Добавить» задачу — синяя; «Добавить этап» — текстовая (btn onbg), плюс справа.
 */
@Component({
  selector: '[adapt-tasks]',
  imports: [FilterBar, Select, DateRangeField, Icon, IprTaskCard],
  template: `
    @let T = s.plan().tasks;
    <div class="ch">
      <button class="actb ipcol" type="button" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())"><app-icon name="chevSm" /></button>
      <span class="ad-ht"><h3>Задачи</h3><span class="chip">{{ T.length }}</span></span>
    </div>
    <div class="ctabs">
      @for (tab of tabs(); track tab.id) {
        <span [class.on]="stage() === tab.id" (click)="stage.set(tab.id)">
          {{ tab.name }}<span class="pntc">{{ tab.n }}</span>
          @if (s.editable()) {
            <button
              class="actb ad-sted"
              type="button"
              title="Редактировать этап"
              aria-label="Редактировать этап"
              (click)="$event.stopPropagation(); editStage.emit(tab.i)"
            >
              <app-icon name="edit" />
            </button>
            @if (s.stages().length > 1) {
              <button
                class="actb ad-stdel"
                type="button"
                title="Удалить этап"
                aria-label="Удалить этап"
                (click)="$event.stopPropagation(); delStage(tab.i)"
              >
                <app-icon name="trashSm" />
              </button>
            }
          }
        </span>
      }
      @if (s.editable()) {
        <button class="btn onbg ad-stadd" type="button" (click)="editStage.emit(-1)">Добавить этап<app-icon name="plus" /></button>
      }
    </div>
    <app-filter-bar placeholder="Поиск по задачам" [(query)]="q">
      @if (s.editable()) {
        <button ftAction class="btn pri ipadd" type="button" (click)="onAdd()">Добавить</button>
      }
      @if (T.length) {
        <div class="fchips" ftName="Статус">
          @for (c of chips(); track c.k) {
            <button class="fchip" type="button" [class.on]="f().has(c.k)" (click)="flip(c.k)">{{ c.label }} <em>{{ c.n }}</em></button>
          }
        </div>
        <app-date-range label="Срок" [(value)]="due" />
        <app-select label="Ответственный" [options]="byOpts()" allLabel="Все" placeholder="Ответственный" [(value)]="by" />
      }
    </app-filter-bar>
    <div class="cb iptcb">
      @if (visible().length) {
        <div class="iplist ipcards">
          @for (r of visible(); track r.i) {
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
              [showAuthor]="false"
              [showDoneAt]="false"
              [dueText]="stageDays(r.t)"
              runIcon="checkSquare"
              runTitle="Завершить задачу"
              (act)="act.emit($event)"
            ></div>
          }
        </div>
      } @else {
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTasks" /></div>
          <b>{{ emptyTitle() }}</b>
          <small>{{ emptyHint() }}</small>
        </div>
      }
    </div>
  `,
  host: { class: 'c ipsect', '[class.ipcold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptTasks {
  protected readonly s = inject(AdaptStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  readonly add = output<void>();
  readonly act = output<IprTaskAct>();
  /** индекс этапа для сайдбара; −1 — новый */
  readonly editStage = output<number>();

  protected readonly cold = signal(false);
  private readonly finished = computed(() => ['Выполнено', 'Выполнено частично', 'Не выполнено'].includes(this.s.st()));

  constructor() {
    effect(() => this.cold.set(this.finished()));
    // первый этап по умолчанию; если удалили активный — соседний
    effect(() => {
      const stages = this.s.stages();
      const id = this.stage();
      if (!stages.length) return;
      if (!stages.some((x) => x.name === id)) this.stage.set(stages[0].name);
    });
  }
  protected readonly stage = signal(this.s.stages()[0]?.name || '');
  protected readonly q = signal('');
  protected readonly f = signal(new Set<Chip>());
  protected readonly due = signal<DateRange>(EMPTY_RANGE);
  protected readonly by = signal('');

  protected readonly tabs = computed(() => {
    const T = this.s.plan().tasks;
    return this.s.stages().map((s, i) => ({
      id: s.name,
      name: s.name,
      n: T.filter((t) => stageOf(t) === s.name).length,
      i,
    }));
  });
  protected readonly byOpts = computed(() => uniq(this.s.plan().tasks.map((t) => t.by)));
  protected readonly chips = computed(() => {
    const T = this.s.plan().tasks.filter((t) => stageOf(t) === this.stage());
    return [
      { k: 'work' as Chip, label: 'В работе', n: T.filter((t) => !t.done && iprTaskSt(t) !== 'Просрочено').length },
      { k: 'over' as Chip, label: 'Просрочено', n: T.filter((t) => iprTaskSt(t) === 'Просрочено').length },
      { k: 'done' as Chip, label: 'Выполнено', n: T.filter((t) => t.done).length },
    ];
  });

  private text(t: IprTask): string {
    return [t.t, t.res, t.crs ? LEARN_COURSES[t.crs]?.t : '', t.link, t.art, t.note, ...t.comps, t.due, t.by, stageOf(t)].join(' ').toLowerCase();
  }
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    const F = this.f();
    const tab = this.stage();
    return iprSortTasks(this.s.plan().tasks).map(({ t, i }) => {
      const st = iprTaskSt(t);
      const ok =
        stageOf(t) === tab &&
        (!F.size || (F.has('done') && t.done) || (F.has('work') && !t.done && st !== 'Просрочено') || (F.has('over') && st === 'Просрочено')) &&
        (!q || this.text(t).includes(q)) &&
        inRange(this.due(), t.due) &&
        (!this.by() || t.by === this.by());
      return { t, i, ok };
    });
  });
  protected readonly visible = computed(() => this.list().filter((r) => r.ok));
  private readonly filtered = computed(
    () => !!this.q().trim() || !!this.f().size || rangeOn(this.due()) || !!this.by(),
  );
  protected readonly emptyTitle = computed(() =>
    this.s.plan().tasks.length && this.filtered() ? 'Ничего не найдено' : 'Задач пока нет',
  );
  protected readonly emptyHint = computed(() => {
    if (!this.s.plan().tasks.length) {
      return this.s.editable()
        ? 'Добавьте первую задачу: что нужно сделать, какой результат ожидается и к какому сроку.'
        : 'В этом плане нет задач.';
    }
    if (this.filtered()) return 'Измените поиск или фильтры.';
    return this.s.editable() ? 'Добавьте задачу в этот этап или выберите другой.' : 'В этом этапе нет задач.';
  });

  /** срок в карточке — длительность этапа задачи («7 дней») */
  protected stageDays(t: IprTask): string {
    const name = stageOf(t);
    const st = this.s.stages().find((x) => x.name === name);
    const n = st?.days ?? 0;
    return n + ' ' + iprPl(n, 'день', 'дня', 'дней');
  }

  protected flip(k: Chip): void {
    this.f.update((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  }
  protected onAdd(): void {
    this.s.nextStage = this.stage() || this.s.stages()[0]?.name || '';
    this.add.emit();
  }

  protected async delStage(i: number): Promise<void> {
    const st = this.s.stages()[i];
    if (!st || this.s.stages().length <= 1) return;
    const n = this.s.plan().tasks.filter((t) => stageOf(t) === st.name).length;
    const text =
      n > 0
        ? `Этап **${st.name}** будет удален. ${n} ${n === 1 ? 'задача перейдет' : 'задач перейдут'} в соседний этап.`
        : `Этап **${st.name}** будет удален из плана.`;
    if (!(await this.confirm.ask({ title: 'Удалить этап?', text, ok: 'Удалить', danger: true }))) return;
    this.s.removeStage(i);
    this.toast.show('Этап удален', st.name);
  }
}
