import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { goalAvgLetter, goalLetterCap } from '../../../core/demo/goals-store.service';
import { MAP_ME } from '../../../data/goals.data';
import { GOAL_STAGES, goalStatusOf } from '../../../interface/goal';
import { roleWithGrade } from '../../../data/org.data';
import { ME, ME_PHOTO } from '../../../data/people.data';
import { MygoalsState } from '../mygoals.state';


/** Шапка карты (как у ИПР): название периода и этап, карточка сотрудника (фото, ФИО, должность с грейдом, «Подразделение: …» — только у руководителя); плитки — период, общий вес, итоговая оценка. */
@Component({
  selector: '[mygoals-head]',
  template: `
    <div class="cb">
      <div class="iptit">
        <h2 class="tkt">{{ per.title }}</h2>
        <span class="gltags iptbdg"><span class="bdg" [class]="badge()[0]">{{ badge()[1] }}</span></span>
      </div>
      @if (s.demo.goalRole() === 'mgr') {
        <div class="glemp">
          <img [src]="photo" alt="" />
          <span class="cnm"><b>{{ name }}</b><small>{{ role }}</small><small>Подразделение: {{ me.unit }}</small></span>
        </div>
      }
      <div class="kpis k3 ipkpi glhk">
        <div class="rst"><div class="l">Оцениваемый период</div><div class="v txt">{{ per.from }} – {{ per.to }}</div></div>
        <div class="rst glhw">
          <div class="l">Общий вес</div>
          <div class="v txt">
            @let ws = s.weight();
            <span class="glhwv" [class.dg]="ws > 100" [class.wn]="ws < 100">{{ ws }}%@if (ws !== 100 && s.list().length) {<small>{{ ws > 100 ? 'больше 100% на ' + (ws - 100) + '%' : 'осталось ' + (100 - ws) + '%' }}</small>}</span>
          </div>
        </div>
        <div class="rst">
          <div class="l">Итоговая оценка</div>
          <div class="v txt">
            @if (total(); as t) {
              <span class="glsv glhtot"><span class="clbg" [class]="'g' + t">{{ t }}</span>{{ cap(t) }}</span>
            } @else {
              —
            }
          </div>
        </div>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalsHead {
  protected readonly s = inject(MygoalsState);
  protected readonly per = this.s.store.period;
  protected readonly me = MAP_ME;
  protected readonly name = ME[0];
  /** «Старший кредитный специалист» */
  protected readonly role = roleWithGrade(MAP_ME.role, MAP_ME.grade);
  protected readonly photo = ME_PHOTO;
  protected readonly cap = goalLetterCap;
  /** статус карты: заведение целей, утверждено, период оценки, завершена */
  protected readonly badge = computed(() => {
    const st = GOAL_STAGES.find((x) => x.value === goalStatusOf(this.s.stage()))!;
    return [st.tone, st.label];
  });
  /** «Итог» — по итоговым оценкам (средняя с учетом весов) */
  protected readonly total = computed(() => {
    const L = this.s.list(), st = this.s.stage();
    if (!L.length) return '';
    if (st === 'fin' && L.every((g) => g.fin?.o)) return goalAvgLetter(L.map((g) => [g.fin!.o, +(g.w ?? 0) || 0]));
    return '';
  });
}
