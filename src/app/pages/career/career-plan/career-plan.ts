import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { IPR_STATUS_TONE } from '../../../data/ipr.data';
import { CT_GRADES, ctPlural } from '../../../data/career-track.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { PlanSummary } from '../../../widgets/plan-summary/plan-summary';

/**
 * «План развития» в правой колонке: сводка ИПР (виджет plan-summary из данных IprStore), связь с целевым грейдом
 * и переход на страницу ИПР. Если плана нет — предложение создать его под требования трека.
 */
@Component({
  selector: '[career-plan]',
  imports: [Icon, PlanSummary],
  template: `
    <div class="ch"><h3>План развития</h3></div>
    @if (ipr.none()) {
      <div class="cb">
        <div class="cpempty">
          <b>ИПР еще не создан</b>
          <small>План развития закроет компетенции, которых не хватает до грейда «{{ s.nextGrade() || s.myGrade() }}».</small>
        </div>
        <button type="button" class="btn raised cpfull" (click)="nav.go('ipr')">Создать ИПР</button>
      </div>
    } @else {
      <app-plan-summary
        inset
        [title]="ipr.plan().name"
        [status]="ipr.st()"
        [statusTone]="tone()"
        [date]="'до ' + ipr.plan().due"
        [progress]="ipr.progress()"
        [progressTone]="ipr.progress() === 100 ? 'ok' : ''"
        [caption]="ipr.doneN() + ' из ' + ipr.plan().tasks.length + ' ' + plural(ipr.plan().tasks.length, 'задачи', 'задач', 'задач')"
      />
      <div class="cb cplink">
        <div class="cpgoal">
          <app-icon name="arrowUp" />
          <span>{{ goalText() }}</span>
        </div>
        <button type="button" class="btn raised cpfull" (click)="nav.go('ipr')">Открыть ИПР</button>
      </div>
    }
  `,
  styleUrl: './career-plan.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-plan' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerPlan {
  protected readonly s = inject(CareerStore);
  protected readonly ipr = inject(IprStore);
  protected readonly nav = inject(NavService);
  protected readonly plural = ctPlural;
  protected readonly tone = computed(() => IPR_STATUS_TONE[this.ipr.st()] || '');
  /** связь плана с треком: цель плана и что он развивает; если целевой грейд уже присвоен — предложить обновить план */
  protected readonly goalText = computed(() => {
    const target = this.ipr.plan().tGrade || this.s.nextGrade();
    const my = this.s.myGrade();
    if (target && CT_GRADES.indexOf(target) <= CT_GRADES.indexOf(my)) {
      const next = this.s.nextGrade();
      return 'Цель плана достигнута: грейд «' + target + '».' + (next ? ' Обновите план под требования грейда «' + next + '».' : '');
    }
    const n = this.s.lackN();
    const lack = n ? n + ' ' + ctPlural(n, 'компетенцию', 'компетенции', 'компетенций') + ', ' + (n === 1 ? 'которой' : 'которых') + ' не хватает' : 'компетенции роли';
    return 'Цель плана — грейд «' + target + '». Задачи плана развивают ' + lack + '.';
  });
}
