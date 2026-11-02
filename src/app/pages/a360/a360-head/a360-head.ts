import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { A360_CYCLE } from '../../../data/a360.data';
import { MAP_ME } from '../../../data/goals.data';
import { GROWTH_360_INFO } from '../../../data/growth.data';
import { roleWithGrade } from '../../../data/org.data';
import { ME, ME_PHOTO } from '../../../data/people.data';

/**
 * Шапка оценки 360 (как у ИПР и карты целей): карточка сотрудника (фото, ФИО, должность с грейдом, подразделение),
 * плитки — оцениваемый период, оценивающие, средний балл.
 */
@Component({
  selector: '[a360-head]',
  template: `
    <div class="cb">
      <div class="a3top">
        <div class="glemp">
          <img [src]="photo" alt="" />
          <span class="cnm"><b>{{ name }}</b><small>{{ role }}</small><small>Подразделение: {{ me.unit }}</small></span>
        </div>
      </div>
      <div class="kpis ipkpi" [class.k3]="full()" [class.k2]="!full()">
        <div class="rst"><div class="l">Оцениваемый период</div><div class="v txt">{{ cycle.period }}</div></div>
        @if (full()) {
          <div class="rst"><div class="l">Оценивающие</div><div class="v txt">{{ info.respondents }} коллег</div></div>
        }
        <div class="rst"><div class="l">Средний балл 360</div><div class="v txt">{{ info.avg }} из 5</div></div>
      </div>
    </div>
  `,
  host: { class: 'c iphead mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360Head {
  /** HR: с числом оценивающих; сотруднику эта статистика недоступна */
  readonly full = input(false);
  protected readonly cycle = A360_CYCLE;
  protected readonly me = MAP_ME;
  protected readonly name = ME[0];
  protected readonly role = roleWithGrade(MAP_ME.role, MAP_ME.grade);
  protected readonly photo = ME_PHOTO;
  protected readonly info = GROWTH_360_INFO;
}
