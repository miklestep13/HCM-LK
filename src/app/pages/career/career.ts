import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { CareerStore } from '../../core/demo/career-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { CP_SCENARIOS } from '../../data/career-path.data';
import { CT_TPL_ROLE } from '../../data/career-track.data';
import { CpScenario } from '../../interface/career-path';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { CareerEmpty } from './career-empty/career-empty';
import { CareerExperts } from './career-experts/career-experts';
import { CareerFaq } from './career-faq/career-faq';
import { CareerReq } from './career-req/career-req';
import { CareerRoad } from './career-road/career-road';

/**
 * «Мой кабинет → Карьерный трек»: дорожная карта, требования грейда, эксперты роли и вопросы.
 * Освоенный грейд зеленый. Синий шаг — только заявленный переход; без ИПР и плана соединитель серый.
 */
@Component({
  selector: 'app-career',
  imports: [PageHead, CareerRoad, CareerReq, CareerExperts, CareerFaq, CareerEmpty],
  template: `
    <app-page-head [title]="title" [noBack]="true">
      @if (s.hasTrack()) {
        <button type="button" class="btn raised" (click)="nav.go('ctrole', { id: roleId })">Профиль роли</button>
      }
    </app-page-head>

    @if (!s.hasTrack()) {
      <app-career-empty [kind]="$any(s.scenario())" />
    } @else {
      <div class="c" career-road></div>
      <div class="cols cpcols">
        <div class="cM">
          <div class="c" career-req></div>
        </div>
        <div class="cR">
          <div class="c" career-experts></div>
          <div class="c" career-faq></div>
        </div>
      </div>
    }
  `,
  styleUrl: './career.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-career' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Career {
  protected readonly s = inject(CareerStore);
  protected readonly nav = inject(NavService);
  private readonly dev = inject(DevPanelService);

  protected readonly roleId = CT_TPL_ROLE;

  protected readonly title = 'Карьера';

  constructor() {
    effect((onCleanup) => {
      onCleanup(
        this.dev.register({
          id: 'careerScenario',
          label: 'Карьерный трек',
          options: CP_SCENARIOS,
          value: devValue<CpScenario>(
            () => this.s.scenario(),
            (v) => this.s.setScenario(v),
          ),
        }),
      );
    });
  }
}
