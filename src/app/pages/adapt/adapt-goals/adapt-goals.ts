import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { ADAPT_FROM, ADAPT_GOALS, AdaptGoal, PROBATION_TO } from '../../../data/adapt.data';
import { Icon } from '../../../shared/ui/icon/icon';

/**
 * Испытательный срок на странице адаптации: шапка карты целей и список целей
 * на одном белом фоне. empty — без целей (empty state), для демо формы шаблона.
 */
@Component({
  selector: '[adapt-goals]',
  imports: [Icon],
  template: `
    <div class="ad-ghead">
      <div class="ad-title">
        <h2>Цели на испытательный срок</h2>
        <span class="q-badge q-badge--info">Утверждено</span>
      </div>
      <div class="q-kpis" style="--n: 3">
        <div class="q-kpi">
          <div class="q-kpi__head"><span class="q-kpi__title">Оцениваемый период</span></div>
          <div class="q-kpi__value">{{ from }} – {{ to }}</div>
        </div>
        <div class="q-kpi">
          <div class="q-kpi__head"><span class="q-kpi__title">Общий вес</span></div>
          <div class="q-kpi__value">{{ weight() }}%</div>
        </div>
        <div class="q-kpi">
          <div class="q-kpi__head"><span class="q-kpi__title">Итоговая оценка</span></div>
          <div class="q-kpi__value">—</div>
        </div>
      </div>
    </div>
    <div class="ad-glist">
      <div class="ad-sub"><h3>Цели</h3><span class="chip">{{ goals().length }}</span></div>
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
          <small>Добавьте цели на испытательный срок или выберите заполненное демо.</small>
        </div>
      }
    </div>
  `,
  host: { class: 'c mt ad-goals' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptGoals {
  /** без целей — empty state (форма шаблона, демо empty) */
  readonly empty = input(false, { transform: booleanAttribute });
  protected readonly goals = computed<AdaptGoal[]>(() => (this.empty() ? [] : ADAPT_GOALS));
  protected readonly from = ADAPT_FROM;
  protected readonly to = PROBATION_TO;
  protected readonly weight = computed(() => this.goals().reduce((s, g) => s + g.w, 0));
}
