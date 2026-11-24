import { ChangeDetectionStrategy, Component, booleanAttribute, effect, inject, input, signal } from '@angular/core';
import { ADAPT_GOALS, AdaptGoal } from '../../../data/adapt.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/**
 * Испытательный срок на странице адаптации: заголовок со счётчиком, «Цели» с кнопками
 * «Распределить поровну» / «Добавить», список карточек. empty — без целей (демо шаблона).
 */
@Component({
  selector: '[adapt-goals]',
  imports: [Icon],
  template: `
    <div class="ad-ghead">
      <div class="ad-title">
        <h2>Цели на испытательный срок</h2>
        <span class="chip">{{ goals().length }}</span>
      </div>
    </div>
    <div class="ad-glist">
      <div class="ad-sub">
        <h3>Цели</h3>
        <span class="ad-gacts">
          @if (goals().length) {
            <button class="btn raised" type="button" (click)="spread()">Распределить поровну</button>
          }
          <button class="btn pri" type="button" (click)="add()">Добавить</button>
        </span>
      </div>
      @if (goals().length) {
        @for (g of goals(); track g.t) {
          <article class="ad-gcard">
            <div class="ad-gt">
              <h4>{{ g.t }}</h4>
              <span class="bdg" [class.warn]="g.tone === 'warn'" [class.ok]="g.tone === 'ok'" [class.info]="g.tone === 'info'" [class.dg]="g.tone === 'dg'">{{ g.st }}</span>
            </div>
            <p>{{ g.d }}</p>
            <div class="ad-gnums">
              <span><small>Вес</small><b>{{ g.w }}%</b></span>
              <span><small>План. результат</small><b>{{ g.plan }}</b></span>
              <span><small>Факт. результат</small><b>{{ g.fact }}</b></span>
            </div>
            <div class="ad-gmeta">
              <span>{{ g.type }}</span>
              <span>{{ g.level }}</span>
              <span>{{ g.kind }}</span>
              <span><app-icon name="calendar" />до {{ g.due }}</span>
              <span><app-icon name="userXs" />{{ g.who }}</span>
            </div>
          </article>
        }
      } @else {
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTasks" /></div>
          <b>Целей пока нет</b>
          <small>Добавьте первую цель на испытательный срок или выберите заполненное демо.</small>
        </div>
      }
    </div>
  `,
  host: { class: 'c mt ad-goals' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptGoals {
  private readonly toast = inject(ToastService);
  /** без целей — empty state (форма шаблона, демо empty) */
  readonly empty = input(false, { transform: booleanAttribute });
  protected readonly goals = signal<AdaptGoal[]>([]);

  constructor() {
    effect(() => {
      this.goals.set(this.empty() ? [] : structuredClone(ADAPT_GOALS));
    });
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
}
