import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { goalAvgLetter, goalLetterCap } from '../../../core/demo/goals-store.service';
import { MAP_ME } from '../../../data/goals.data';
import { shortFio } from '../../../data/org.data';
import { MygoalsState } from '../mygoals.state';

const BADGE: Record<string, [string, string]> = {
  idle: ['', 'Ожидание'], draft: ['', 'Черновик'], appr: ['warn', 'На согласовании'], plan: ['ok', 'Утверждена'],
  self: ['warn', 'Самооценка'], wait: ['', 'Отправлено'], cust: ['warn', 'Оценка заказчиков'], fin: ['ok', 'Итог'],
};

/** Шапка карты (как у ИПР): название периода, этап, должность и руководитель; плитки — период, постановка целей, общий вес, итоговая оценка. */
@Component({
  selector: '[mygoals-head]',
  template: `
    <div class="cb">
      <div class="iptit">
        <h2 class="tkt">{{ per.title }}</h2>
        <span class="gltags iptbdg"><span class="bdg" [class]="badge()[0]">{{ badge()[1] }}</span></span>
      </div>
      <div class="ipsub">
        <span>Текущая должность: {{ me.role }} ({{ me.grade }})&nbsp;&nbsp;Подразделение: {{ me.unit }}</span><span>Руководитель: {{ mgr }}</span>
      </div>
      <div class="kpis k4 ipkpi glhk">
        <div class="rst"><div class="l">Период оценки</div><div class="v txt">{{ per.from }} – {{ per.to }}</div></div>
        <div class="rst"><div class="l">Постановка целей</div><div class="v txt">до {{ per.set }}</div></div>
        <div class="rst glhw">
          <div class="l">Общий вес</div>
          <div class="v txt">
            @let ws = s.weight();
            <span class="glhwv" [class.dg]="ws > 100" [class.wn]="ws < 100">{{ ws }}%@if (ws !== 100 && s.list().length) {<small>{{ ws > 100 ? 'больше 100% на ' + (ws - 100) + '%' : 'осталось ' + (100 - ws) + '%' }}</small>}</span>
          </div>
        </div>
        <div class="rst">
          <div class="l">{{ s.stage() === 'wait' ? 'Итоговая оценка по самооценке' : 'Итоговая оценка' }}</div>
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
  protected readonly mgr = shortFio(MAP_ME.mgr);
  protected readonly cap = goalLetterCap;
  protected readonly badge = computed(() => BADGE[this.s.stage()]);
  /** «Отправлено» — итог по самооценке; «Итог» — по итоговым оценкам (средняя с учетом весов) */
  protected readonly total = computed(() => {
    const L = this.s.list(), st = this.s.stage();
    if (!L.length) return '';
    if (st === 'wait' && L.every((g) => g.self)) return goalAvgLetter(L.map((g) => [g.self!.o, +(g.w ?? 0) || 0]));
    if (st === 'fin' && L.every((g) => g.fin?.o)) return goalAvgLetter(L.map((g) => [g.fin!.o, +(g.w ?? 0) || 0]));
    return '';
  });
}
