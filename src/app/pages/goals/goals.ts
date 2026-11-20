import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, effect, inject, input, untracked, viewChild } from '@angular/core';
import { goalLetterCap } from '../../core/demo/goals-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { GOAL_STAGES } from '../../interface/goal';
import { attachBusy } from '../../shared/ui/attach/attach';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { MygoalviewEval } from '../mygoalview/mygoalview-eval/mygoalview-eval';
import { MygoalviewHead } from '../mygoalview/mygoalview-head/mygoalview-head';
import { MygoalviewMeas } from '../mygoalview/mygoalview-meas/mygoalview-meas';
import { MygoalviewPpl } from '../mygoalview/mygoalview-ppl/mygoalview-ppl';
import { MygoalviewRates } from '../mygoalview/mygoalview-rates/mygoalview-rates';
import { MygoalviewSelf } from '../mygoalview/mygoalview-self/mygoalview-self';
import { MygoalviewState } from '../mygoalview/mygoalview.state';

/** цель по умолчанию при открытии из меню HR */
const DEFAULT_GL = 'pco1';

/**
 * «Управление персоналом → Целеполагание → Цели»: просмотр цели сотрудника.
 * Та же страница, что /mygoalview, всегда от лица руководителя — без переключателя роли,
 * в шапке карточка сотрудника. Параметры: gl — цель (по умолчанию pco1), mode=edit — на оценку.
 */
@Component({
  selector: 'app-goals',
  imports: [PageHead, MygoalviewHead, MygoalviewPpl, MygoalviewMeas, MygoalviewRates, MygoalviewSelf, MygoalviewEval],
  template: `
    <app-page-head title="Просмотр цели" [noBack]="true">
      @if (canEdit()) {
        <span class="objacts">
          <button class="btn dng" (click)="remove()">Удалить</button>
          <button class="btn raised" (click)="edit()">Редактировать</button>
        </span>
      }
    </app-page-head>
    @if (s.goal(); as g) {
      <div mygoalview-head showEmp (open)="openGoal($event)"></div>
      @let txt = s.F().kind === 'txt';
      @switch (s.mode()) {
        @case ('self') {
          <div mygoalview-meas edit></div>
          <div mygoalview-ppl collapsed count></div>
          @if (txt) {
            <div mygoalview-rates></div>
          }
          <div mygoalview-self [title]="txt ? 'Ваша оценка' : 'Оценка'"></div>
          <div class="c ipisl">
            <div class="ipff"><button class="btn pri" (click)="saveSelf()">Сохранить</button></div>
          </div>
        }
        @case ('cust') {
          <div mygoalview-meas></div>
          <div mygoalview-ppl collapsed count></div>
          @if (txt) {
            <div mygoalview-rates></div>
            @if (myForm()) {
              <div mygoalview-eval [form]="true" [list]="false"></div>
            }
          } @else {
            <div mygoalview-eval [form]="myForm()"></div>
          }
          <div class="c ipisl">
            <div class="ipff">
              @if (myForm()) {
                <button class="btn pri" (click)="saveCust()">Сохранить</button>
              } @else {
                <button class="btn raised" (click)="close()">Закрыть</button>
              }
            </div>
          </div>
        }
        @default {
          <div mygoalview-meas></div>
          <div mygoalview-ppl [collapsed]="s.mode() === 'res'"></div>
          @if (s.mode() === 'res') {
            @if (txt) {
              <div mygoalview-rates></div>
            } @else {
              <div mygoalview-eval></div>
            }
          }
        }
      }
    }
  `,
  styleUrl: '../mygoalview/mygoalview.scss',
  styles: [
    `
      .pg-goals .glemp {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 16px 0 4px;
      }
      .pg-goals .glemp img {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        object-fit: cover;
        flex: none;
      }
      .pg-goals .glemp .cnm {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .pg-goals .glemp .cnm b {
        font: var(--q-font-ui-headline-3);
      }
      .pg-goals .glemp .cnm small {
        font: var(--q-font-ui-body-2);
        color: var(--t3);
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MygoalviewState],
  host: { class: 'pg pg-goals pg-mygoalview', '[class.glgvro]': "s.mode() === 'self' || s.mode() === 'cust'" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Goals implements OnDestroy {
  protected readonly s = inject(MygoalviewState);
  private readonly nav = inject(NavService);
  private readonly dev = inject(DevPanelService);
  /** цель (параметр адреса); пусто — демо-цель pco1 */
  readonly gl = input('');
  /** edit — открыта на оценку */
  readonly mode = input('');
  protected readonly canEdit = computed(() => ['draft', 'appr'].includes(this.s.stage()));
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly evalB = viewChild(MygoalviewEval);
  protected readonly myForm = computed(() => this.s.edit() && this.s.F().kind === 'txt');
  private readonly off: (() => void)[] = [];

  constructor() {
    // HR-карточка всегда смотрит цель как руководитель
    this.s.demo.goalRole.set('mgr');
    effect(() => {
      const id = this.gl() || DEFAULT_GL,
        m = this.mode();
      untracked(() => {
        this.s.id.set(id);
        this.s.edit.set(m === 'edit');
        this.s.kind.set('');
      });
    });
    effect(() => {
      const st = this.s.stage(),
        id = this.s.id();
      untracked(() => {
        this.s.store.prepare(st);
        if (id) this.s.initSelf();
      });
    });
    this.off.push(
      this.dev.register({
        id: 'goalsHrStage',
        label: 'Статус карты целей',
        options: GOAL_STAGES.map((x) => ({ value: x.value, label: x.label })),
        value: this.s.demo.goalStatus,
      }),
    );
    effect((onCleanup) => {
      if (this.s.mode() === 'self' || this.s.mode() === 'cust') return;
      onCleanup(
        this.dev.register({
          id: 'goalsHrKind',
          label: 'Тип измерения',
          options: [
            { value: 'num', label: 'Количественная' },
            { value: 'txt', label: 'Качественная' },
            { value: 'str', label: 'Бинарная' },
          ],
          value: devValue<string>(
            () => this.s.F().kind,
            (v) => this.s.kind.set(v),
          ),
        }),
      );
    });
  }

  protected openGoal(id: string): void {
    if (this.s.store.goals().some((g) => g.id === id)) this.nav.go('goals', { gl: id });
    else this.nav.go('wip', { name: 'Цель', sub: 'Страница вышестоящей цели — в разработке' });
  }
  protected edit(): void {
    this.nav.go('mygoalnew', { edit: this.s.id() });
  }
  protected async remove(): Promise<void> {
    const g = this.s.goal()!;
    if (!(await this.confirm.ask({ title: 'Удалить цель?', text: '«' + g.t + '» будет убрана из карты. Действие нельзя отменить.', ok: 'Удалить', danger: true }))) return;
    this.s.store.remove(g.id);
    this.toast.show('Цель удалена', 'Карта обновлена.');
    this.nav.go('goals', { gl: DEFAULT_GL });
  }
  protected close(): void {
    this.nav.go('goals', { gl: this.s.id() });
  }

  protected saveSelf(): void {
    const g = this.s.goal()!,
      F = this.s.F(),
      G = this.s.self(),
      num = F.kind === 'num',
      bin = F.kind === 'str';
    if (num && G.fact == null) return this.s.selfErr.set('Укажите фактический результат числом — оценка рассчитается автоматически.');
    if (!G.o) return this.s.selfErr.set(bin ? 'Выберите «Выполнено» или «Не выполнено».' : 'Выберите оценку от A до E.');
    if (attachBusy(this.s.selfDocs())) return this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
    const self = { o: G.o, n: G.n, fact: num ? G.fact : null, cm: (G.cm || '').trim(), docs: this.s.selfDocs().filter((f) => f.st !== 'load') as never };
    this.s.store.update(g.id, num || bin ? { self, fin: { o: G.o, n: bin ? G.n : goalLetterCap(G.o) } } : { self });
    this.nav.go('goals', { gl: g.id });
    this.toast.show('Самооценка сохранена', '«' + g.t + '» — ' + G.o + ', ' + (bin ? G.n.toLowerCase() : goalLetterCap(G.o).toLowerCase()) + '.');
  }
  protected saveCust(): void {
    if (this.evalB()?.save()) this.nav.go('goals', { gl: this.s.id() });
  }

  ngOnDestroy(): void {
    this.off.forEach((f) => f());
  }
}
