import { ChangeDetectionStrategy, Component, booleanAttribute, effect, inject, input, signal } from '@angular/core';
import { ADAPT_GOALS, AdaptGoal } from '../../../data/adapt.data';
import { GOAL_COLORS } from '../../../data/goals.data';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';

/**
 * Блок «Цели» плана / шаблона адаптации: шапка как на карте целей (шеврон, счётчик,
 * «Распределить поровну» / «Добавить»), карточки как в «Заведении целей».
 * empty — без целей (демо шаблона).
 */
@Component({
  selector: '[adapt-goals]',
  imports: [Icon, Tooltip],
  template: `
    <div class="ch">
      <button class="actb ipcol" type="button" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())">
        <app-icon name="chevSm" />
      </button>
      <h3>Цели</h3>
      <span class="chip">{{ goals().length }}</span>
      <span class="glsecb">
        @if (goals().length) {
          <button class="btn raised" type="button" (click)="spread()">Распределить поровну</button>
        }
        <button class="btn pri" type="button" (click)="add()">Добавить</button>
      </span>
    </div>
    <div class="cb iptcb">
      @for (g of goals(); track g.id; let i = $index) {
        <div class="iprt glgoal gllite glac">
          <div class="iprb">
            <div class="glach">
              <div class="iprn glnw">
                <button class="glnl" type="button" title="Открыть карточку цели" (click)="open(i)">{{ g.t }}</button>
                <span class="bdg">Черновик</span>
              </div>
            </div>
            <div class="iprd gldsc ed">{{ g.d || '—' }}</div>
            <div class="glacg glacw">
              <div class="iprd glwf">
                <span class="l">Вес</span>
                <div class="numin glcw">
                  <i class="glpkdot" [style.background]="color(i)"></i>
                  <input
                    class="fin"
                    inputmode="numeric"
                    aria-label="Вес цели, %"
                    placeholder="0"
                    [value]="g.w || ''"
                    (input)="setWeight(i, $event)"
                  />
                  <span class="nusf">%</span>
                  <span class="nustep">
                    <button class="nub" type="button" aria-label="Больше" (click)="step(i, 1)">
                      <svg viewBox="0 0 12 12" fill="none"><path d="M3.2 7.4 6 4.6l2.8 2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                    <button class="nub" type="button" aria-label="Меньше" (click)="step(i, -1)">
                      <svg viewBox="0 0 12 12" fill="none"><path d="M3.2 4.6 6 7.4l2.8-2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                  </span>
                </div>
              </div>
              @if (g.kind === 'Число') {
                <div class="iprd glpln">
                  <span class="l">План. результат</span>
                  <span class="glwv">{{ g.plan || '—' }}</span>
                </div>
              }
            </div>
            <div class="glmeta">
              <span class="glmi" appTip="Тип"
                ><svg viewBox="0 0 16 16" fill="none"><path d="M2.4 8.6V3.4a1 1 0 0 1 1-1h5.2l5 5a1.4 1.4 0 0 1 0 2L9.6 13.4a1.4 1.4 0 0 1-2 0l-5.2-4.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><circle cx="5.6" cy="5.6" r="1.1" fill="currentColor" /></svg
                ><b>{{ g.type }}</b></span
              >
              <span class="glmi" appTip="Уровень"
                ><svg viewBox="0 0 16 16" fill="none"><path d="M8 2.2 14 5.4 8 8.6 2 5.4 8 2.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><path d="m2 8.4 6 3.2 6-3.2M2 11.2l6 3.2 6-3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg
                ><b>{{ g.level }}</b></span
              >
              <span class="glmi" appTip="Тип измерения"
                ><svg viewBox="0 0 16 16" fill="none"><path d="M2.6 11.4a5.6 5.6 0 1 1 10.8 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M8 10.2 10.6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="8" cy="10.4" r="1.2" fill="currentColor" /></svg
                ><b>{{ g.kind }}</b></span
              >
              <span class="glmi" appTip="Срок сдачи"><app-icon name="calSm" /><b>до {{ g.due }}</b></span>
              <span class="glmi" appTip="Заказчик"><app-icon name="user" /><b>{{ g.who }}</b></span>
            </div>
          </div>
          <span class="glgr">
            <button class="actb" type="button" title="Редактировать" (click)="edit(i)">
              <svg viewBox="0 0 16 16" fill="none"><path d="M11.2 2.6a1.7 1.7 0 0 1 2.4 2.4l-7.5 7.5-3.2.8.8-3.2 7.5-7.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
            </button>
            <button class="actb dg" type="button" title="Удалить" (click)="remove(i)">
              <svg viewBox="0 0 16 16" fill="none"><path d="M2.8 4.4h10.4M6.4 4.4V3.2a1 1 0 0 1 1-1h1.2a1 1 0 0 1 1 1v1.2M4.2 4.4l.6 8.2a1.2 1.2 0 0 0 1.2 1.1h4a1.2 1.2 0 0 0 1.2-1.1l.6-8.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </span>
        </div>
      } @empty {
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTasks" /></div>
          <b>Целей пока нет</b>
          <small>Добавьте первую цель на испытательный срок или выберите заполненное демо.</small>
        </div>
      }
    </div>
  `,
  host: { class: 'c mt ipsect', '[class.ipcold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptGoals {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  /** без целей — empty state (форма шаблона, демо empty) */
  readonly empty = input(false, { transform: booleanAttribute });
  protected readonly goals = signal<AdaptGoal[]>([]);
  protected readonly cold = signal(false);

  constructor() {
    effect(() => {
      this.goals.set(this.empty() ? [] : structuredClone(ADAPT_GOALS));
    });
  }

  protected color(i: number): string {
    return GOAL_COLORS[i % GOAL_COLORS.length];
  }

  protected spread(): void {
    const L = this.goals();
    if (!L.length) return;
    const n = L.length;
    const base = Math.floor(100 / n);
    const rem = 100 - base * n;
    this.goals.set(L.map((g, i) => ({ ...g, w: base + (i < rem ? 1 : 0) })));
    this.toast.show('Веса распределены', 'По ' + (rem ? base + '–' + (base + 1) : base) + '% на цель, сумма — 100%.');
  }

  protected add(): void {
    this.toast.show('Скоро', 'Добавление цели на испытательный срок — в разработке.');
  }

  protected open(_i: number): void {
    this.toast.show('Скоро', 'Карточка цели на испытательный срок — в разработке.');
  }

  protected edit(_i: number): void {
    this.toast.show('Скоро', 'Редактирование цели — в разработке.');
  }

  protected async remove(i: number): Promise<void> {
    const g = this.goals()[i];
    if (!g) return;
    if (await this.confirm.ask({ title: 'Удалить цель?', text: '«' + g.t + '» будет убрана из плана. Действие нельзя отменить.', ok: 'Удалить', danger: true })) {
      this.goals.update((L) => L.filter((_, j) => j !== i));
      this.toast.show('Цель удалена', 'Список обновлен.');
    }
  }

  protected setWeight(i: number, e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/[^\d]/g, '').slice(0, 3);
    if (+el.value > 100) el.value = '100';
    const w = el.value === '' ? 0 : +el.value;
    this.goals.update((L) => L.map((g, j) => (j === i ? { ...g, w } : g)));
  }

  protected step(i: number, d: number): void {
    this.goals.update((L) =>
      L.map((g, j) => (j === i ? { ...g, w: Math.min(100, Math.max(0, (g.w || 0) + d)) } : g)),
    );
  }
}
