import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { goalAncestors, goalGroup, goalLevel, goalPeriodOf, goalState, goalType } from '../../../core/demo/goals-store.service';
import { GOAL_LEVEL_BADGE } from '../../../data/goals.data';
import { MygoalviewState } from '../mygoalview.state';

/** Шапка цели (как основные поля формы, только просмотр): название и статус, родительские цели крошками; описание; тип, уровень, группа; период, даты, вес */
@Component({
  selector: '[mygoalview-head]',
  template: `
    @let g = s.goal()!;
    <div class="cb">
      <div class="glvtit">
        <h2 class="glvt">{{ g.t }}</h2>
        <span class="gltags"><span class="bdg" [class]="state()[0]">{{ state()[1] }}</span></span>
      </div>
      @if (crumbs().length) {
        <nav class="glbc" aria-label="Родительские цели">
          @for (c of crumbs(); track c.id; let last = $last) {
            <button class="glbcl" (click)="open.emit(c.id)">{{ c.t }}</button>
            @if (!last) {
              <span class="glbcs">/</span>
            }
          }
        </nav>
      }
      <div class="glvw">
        <div class="glvkv"><span class="l">Описание</span>{{ g.d || g.krs[0]?.t || '—' }}</div>
        <!-- та же сетка в 4 колонки, что у строки периода: тип над периодом, уровень над датой начала, группа над датой окончания -->
        <div class="glvrow glvr4">
          <div class="glvkv"><span class="l">Тип</span>{{ type() }}</div>
          <div class="glvkv"><span class="l">Уровень</span>{{ lvlName() }}</div>
          <div class="glvkv"><span class="l">Группа</span>{{ group() || '—' }}</div>
        </div>
        <div class="glvrow glvr4">
          <div class="glvkv"><span class="l">Период</span>{{ per().n }}</div>
          <div class="glvkv"><span class="l">Дата начала</span>{{ $any(g)['beg'] || per().from }}</div>
          <div class="glvkv"><span class="l">Дата окончания</span>{{ g.due || per().to }}</div>
          <div class="glvkv"><span class="l">Вес</span>{{ (g.w || 0) + '%' }}</div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'c mb glvhd' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewHead {
  protected readonly s = inject(MygoalviewState);
  readonly open = output<string>();
  private readonly lvl = computed(() => goalLevel(this.s.goal()!));
  protected readonly lvlName = computed(() => GOAL_LEVEL_BADGE[this.lvl()]);
  protected readonly type = computed(() => goalType(this.s.goal()!));
  protected readonly state = computed(() => goalState(this.s.goal()!, this.s.stage()));
  protected readonly crumbs = computed(() => goalAncestors(this.s.goal()!, this.s.store.goals()));
  protected readonly group = computed(() => goalGroup(this.s.goal()!));
  protected readonly per = computed(() => goalPeriodOf(this.s.goal()));
}
