import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { IPR_GROWTH_LABEL, IPR_LEARNING_MAIL, IPR_ME, IPR_REC_COURSES } from '../../../data/ipr.data';
import { LEARN_COURSES } from '../../../data/learn.data';
import { shortFio } from '../../../data/org.data';
import { Icon } from '../../../shared/ui/icon/icon';

/** «Нет ИПР»: приглашение создать план, зоны роста, рекомендованные курсы и контакты */
@Component({
  selector: 'app-ipr-empty',
  imports: [Icon],
  template: `
    <div class="c mb">
      <div class="cb ipempty">
        <div class="ipemi"><app-icon name="course" /></div>
        <h2>У вас пока нет плана развития</h2>
        <p>
          ИПР — это задания на оценочный период, которые ведут к целевой должности и грейду или закрывают зоны роста по итогам оценки. В задание можно вложить курс из каталога, статью из базы
          знаний или внешний материал. План согласует руководитель; после утверждения вы отмечаете прогресс.
        </p>
        <div class="hbtns">
          <button class="btn raised" (click)="ask.emit()">Запросить у руководителя</button><button class="btn pri" (click)="s.startNew()">Создать ИПР</button>
        </div>
      </div>
    </div>
    <div class="row3">
      <div class="c">
        <div class="ch"><h3>Зоны роста</h3><span class="chip">{{ growthLabel }}</span></div>
        <div class="cb" style="padding-top: 0">
          @for (c of zones; track c.name) {
            <div class="kv"><span class="k">{{ c.name }}</span><span class="v">{{ c.cur }} → {{ c.target }}</span></div>
          }
        </div>
      </div>
      <div class="c">
        <div class="ch"><h3>Рекомендованные курсы</h3><button class="lnk" (click)="nav.go('dev', { lt: 'cat' })">Каталог</button></div>
        <div class="cb" style="padding-top: 0">
          @for (c of courses; track c.id) {
            <div class="item" (click)="nav.go('course', { crs: c.id, lt: 'cat' })">
              <div class="ibd">
                <div class="it">{{ c.t }}</div>
                <div class="im"><span><app-icon name="clock" />{{ c.dur }}</span></div>
              </div>
            </div>
          }
        </div>
      </div>
      <div class="c">
        <div class="ch"><h3>Контакты</h3></div>
        <div class="cb" style="padding-top: 0">
          <div class="kv"><span class="k"><app-icon name="userXs" /> Руководитель</span><span class="v tkppl">{{ mgr() }}</span></div>
          <div class="kv"><span class="k">Отдел обучения</span><span class="v"><a>{{ mail }}</a></span></div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprEmpty {
  protected readonly s = inject(IprStore);
  protected readonly nav = inject(NavService);
  readonly ask = output<void>();
  protected readonly growthLabel = IPR_GROWTH_LABEL;
  protected readonly mail = IPR_LEARNING_MAIL;
  protected readonly zones = IPR_ME.comps.filter((c) => c.cur !== c.target).slice(0, 4);
  protected readonly courses = IPR_REC_COURSES.map((id) => ({ id, ...LEARN_COURSES[id] }));
  protected readonly mgr = computed(() => shortFio(this.s.plan().mgr[0]));
}
