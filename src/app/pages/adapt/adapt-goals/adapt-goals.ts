import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { ADAPT_GOALS, AdaptGoal } from '../../../data/adapt.data';
import { Icon } from '../../../shared/ui/icon/icon';

/**
 * Испытательный срок на странице адаптации: заголовок и список целей
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
}
