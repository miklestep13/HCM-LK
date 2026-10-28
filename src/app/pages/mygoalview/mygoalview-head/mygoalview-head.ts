import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { goalAncestors, goalGroup, goalLevel, goalPeriodOf, goalType, goalUnit } from '../../../core/demo/goals-store.service';
import { GOAL_GTYPES, GOAL_KINDS, GOAL_LEVELS, GOAL_LEVEL_BADGE } from '../../../data/goals.data';
import { MygoalviewState } from '../mygoalview.state';

/** Шапка цели: название и бейджи (уровень, тип, тип измерения), родительские цели крошками, описание, группа, единица, вес, период и даты */
@Component({
  selector: '[mygoalview-head]',
  template: `
    @let g = s.goal()!;
    <div class="cb">
      <div class="glvtit">
        <h2 class="glvt">{{ g.t }}</h2>
        <span class="gltags"
          ><span class="bdg gllvl" [class]="'gt-l' + lvlIdx()">{{ lvlName() }}</span><span class="bdg" [class]="'gt-t' + typeIdx()">{{ type() }}</span
          ><span class="bdg" [class]="'gt-k' + s.F().kind">{{ kinds[s.F().kind] }}</span></span
        >
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
        <div class="glvrow glvr4">
          <div class="glvkv"><span class="l">Группа</span>{{ group() }}</div>
          @if (s.F().kind === 'num') {
            <div class="glvkv"><span class="l">Единица измерения</span>{{ unit() || '—' }}</div>
          }
          <div class="glvkv"><span class="l">Вес</span>{{ g.w ? g.w + '%' : '—' }}</div>
        </div>
        <div class="glvrow glvr4">
          <div class="glvkv"><span class="l">Период</span>{{ per().n }}</div>
          <div class="glvkv"><span class="l">Дата начала</span>{{ $any(g)['beg'] || per().from }}</div>
          <div class="glvkv"><span class="l">Дата окончания</span>{{ g.due || per().to }}</div>
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
  protected readonly kinds = GOAL_KINDS;
  private readonly lvl = computed(() => goalLevel(this.s.goal()!));
  protected readonly lvlIdx = computed(() => GOAL_LEVELS.indexOf(this.lvl()));
  protected readonly lvlName = computed(() => GOAL_LEVEL_BADGE[this.lvl()]);
  protected readonly type = computed(() => goalType(this.s.goal()!));
  protected readonly typeIdx = computed(() => GOAL_GTYPES.indexOf(this.type()));
  protected readonly crumbs = computed(() => goalAncestors(this.s.goal()!, this.s.store.goals()));
  protected readonly group = computed(() => goalGroup(this.s.goal()!));
  protected readonly per = computed(() => goalPeriodOf(this.s.goal()));
  protected readonly unit = computed(() => {
    const F = this.s.F(), u = goalUnit(F.u) === F.u && F.u === 'планов' ? 'планы' : goalUnit(F.u);
    return u.charAt(0).toUpperCase() + u.slice(1);
  });
}
