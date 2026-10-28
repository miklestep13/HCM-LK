import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { goalLetterCap } from '../../core/demo/goals-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { GOAL_STAGES, GoalStage } from '../../interface/goal';
import { attachBusy } from '../../shared/ui/attach/attach';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { MygoalviewEval } from './mygoalview-eval/mygoalview-eval';
import { MygoalviewHead } from './mygoalview-head/mygoalview-head';
import { MygoalviewMeas } from './mygoalview-meas/mygoalview-meas';
import { MygoalviewPpl } from './mygoalview-ppl/mygoalview-ppl';
import { MygoalviewScale } from './mygoalview-scale/mygoalview-scale';
import { MygoalviewSelf } from './mygoalview-self/mygoalview-self';
import { MygoalviewState } from './mygoalview.state';

type MapStage = GoalStage | 'idle';

/**
 * «Цели → Просмотр цели»: шапка цели и блоки по этапу карты.
 * До самооценки — участники и шкала; на самооценке — «Показатель и критерии» с фактическим результатом и блок «Оценка»;
 * после — оценки участников аккордеоном; на оценке заказчиков у качественной цели — своя оценка.
 * Параметры адреса: gl — цель, mode=edit — открыта на оценку.
 */
@Component({
  selector: 'app-mygoalview',
  imports: [PageHead, Icon, MygoalviewHead, MygoalviewPpl, MygoalviewScale, MygoalviewMeas, MygoalviewSelf, MygoalviewEval],
  template: `
    <app-page-head title="Просмотр цели" backTo="mygoals" backLabel="К карте целей">
      @if (canEdit()) {
        <button class="btn raised gvedit" (click)="edit()">Редактировать</button>
      }
    </app-page-head>
    @if (s.goal(); as g) {
      <div mygoalview-head (open)="openGoal($event)"></div>
      @switch (s.mode()) {
        @case ('self') {
          <div mygoalview-meas edit></div>
          <div mygoalview-ppl collapsed count></div>
          <div mygoalview-self></div>
          <div class="c ipisl">
            <div class="ipff"><button class="btn raised" (click)="close()">Отменить</button><button class="btn pri" (click)="saveSelf()">Сохранить</button></div>
          </div>
        }
        @case ('cust') {
          <div mygoalview-meas></div>
          <div mygoalview-ppl collapsed count></div>
          <div mygoalview-eval [form]="myForm()"></div>
          <div class="c ipisl">
            <div class="ipff">
              <button class="btn raised" (click)="close()">{{ myForm() ? 'Отменить' : 'Закрыть' }}</button>
              @if (myForm()) {
                <button class="btn pri" (click)="saveCust()">Сохранить</button>
              }
            </div>
          </div>
        }
        @default {
          <div mygoalview-ppl [collapsed]="s.mode() === 'res'"></div>
          <div class="c mb ipsect" [class.ipcold]="scaleCold()" [class.hidden]="s.F().kind === 'str'">
            <div class="ch">
              <button class="actb ipcol" [title]="scaleCold() ? 'Развернуть' : 'Свернуть'" (click)="scaleCold.set(!scaleCold())"><app-icon name="chevSm" /></button>
              <h3>Шкала оценки</h3>
            </div>
            <div class="cb"><div mygoalview-scale></div></div>
          </div>
          @if (s.mode() === 'res') {
            <div mygoalview-eval></div>
          }
          <div class="c ipisl">
            <div class="ipff"><button class="btn raised" (click)="close()">Отменить</button></div>
          </div>
        }
      }
    }
  `,
  styleUrl: './mygoalview.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [MygoalviewState],
  host: { class: 'pg pg-mygoalview', '[class.glgvro]': "s.mode() === 'self' || s.mode() === 'cust'" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mygoalview implements OnDestroy {
  protected readonly s = inject(MygoalviewState);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly dev = inject(DevPanelService);
  private readonly evalB = viewChild(MygoalviewEval);
  /** цель (параметр адреса) */
  readonly gl = input('');
  /** edit — открыта на оценку (карандаш) */
  readonly mode = input('');
  protected readonly scaleCold = signal(false);
  protected readonly canEdit = computed(() => ['draft', 'appr'].includes(this.s.stage()));
  protected readonly myForm = computed(() => this.s.edit() && this.s.F().kind === 'txt');
  private readonly off: (() => void)[] = [];

  constructor() {
    effect(() => {
      const id = this.gl(), m = this.mode();
      untracked(() => {
        this.s.id.set(id);
        this.s.edit.set(m === 'edit');
        this.s.kind.set('');
      });
    });
    // демо-данные этапа (как на карте целей) и форма самооценки
    effect(() => {
      const st = this.s.stage(), id = this.s.id();
      untracked(() => {
        if (st !== 'idle') this.s.store.prepare(st);
        this.scaleCold.set(st === 'self' || ['wait', 'cust', 'fin'].includes(st));
        if (id) this.s.initSelf();
      });
    });
    this.off.push(
      this.dev.register({
        id: 'goalStage',
        label: 'Этап карты целей',
        options: [{ value: 'idle', label: 'Ожидание' }, ...GOAL_STAGES.map((x) => ({ value: x.value, label: x.value === 'plan' ? 'Утверждены' : x.label }))],
        value: devValue<MapStage>(
          () => this.s.stage(),
          (v) => {
            this.s.demo.goalIdle.set(v === 'idle');
            if (v !== 'idle') this.s.demo.goalStage.set(v as GoalStage);
          },
        ),
      }),
    );
    // демо: та же цель как количественная / качественная / бинарная — в просмотре и результатах
    effect((onCleanup) => {
      if (this.s.mode() === 'self' || this.s.mode() === 'cust') return;
      onCleanup(
        this.dev.register({
          id: 'goalKind',
          label: 'Тип измерения',
          options: [
            { value: 'num', label: 'Количественная' },
            { value: 'txt', label: 'Качественная' },
            { value: 'str', label: 'Бинарная' },
          ],
          value: devValue<string>(() => this.s.F().kind, (v) => this.s.kind.set(v)),
        }),
      );
    });
  }

  protected openGoal(id: string): void {
    if (this.s.store.goals().some((g) => g.id === id)) this.nav.go('mygoalview', { gl: id });
    else this.nav.go('wip', { name: 'Цель', sub: 'Страница вышестоящей цели — в разработке' });
  }
  protected edit(): void {
    this.nav.go('mygoalnew', { edit: this.s.id() });
  }
  protected close(): void {
    this.nav.go('mygoals');
  }

  protected saveSelf(): void {
    const g = this.s.goal()!, F = this.s.F(), G = this.s.self(), num = F.kind === 'num', bin = F.kind === 'str';
    if (num && G.fact == null) return this.s.selfErr.set('Укажите фактический результат числом — оценка рассчитается автоматически.');
    if (!G.o) return this.s.selfErr.set(bin ? 'Выберите «Выполнено» или «Не выполнено».' : 'Выберите оценку от A до E.');
    if (attachBusy(this.s.selfDocs())) return this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
    const self = { o: G.o, n: G.n, fact: num ? G.fact : null, cm: (G.cm || '').trim(), docs: this.s.selfDocs().filter((f) => f.st !== 'load') as never };
    this.s.store.update(g.id, num || bin ? { self, fin: { o: G.o, n: bin ? G.n : goalLetterCap(G.o) } } : { self });
    this.nav.go('mygoals');
    this.toast.show('Самооценка сохранена', '«' + g.t + '» — ' + G.o + ', ' + (bin ? G.n.toLowerCase() : goalLetterCap(G.o).toLowerCase()) + '.');
  }
  protected saveCust(): void {
    if (this.evalB()?.save()) this.nav.go('mygoals');
  }

  ngOnDestroy(): void {
    this.off.forEach((f) => f());
  }
}
