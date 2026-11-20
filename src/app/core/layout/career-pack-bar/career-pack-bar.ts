import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { CareerStore } from '../../demo/career-store.service';
import { CareerRoleStore } from '../../demo/career-role.service';
import { NavService } from '../../navigation/nav.service';
import { CP_SCENARIOS } from '../../../data/career-path.data';
import { CpScenario } from '../../../interface/career-path';

/**
 * Полоска выгрузки для коллег: роль и сценарии карьерного трека.
 * Видна только в файле с export=career, в обычном прототипе ее нет.
 */
@Component({
  selector: 'app-career-pack-bar',
  template: `
    <div class="cxrow">
      <b>Карьерный трек</b>
      <span class="seg">
        <button type="button" [class.on]="role() === 'emp'" (click)="emp(scenario())">Сотрудник</button>
        <button type="button" [class.on]="role() === 'hr'" (click)="list()">HR</button>
      </span>
    </div>
    @if (role() === 'emp') {
      <div class="cxrow">
        <span class="cxl">Сценарий</span>
        <span class="seg cxsc">
          @for (s of scenarios; track s.value) {
            <button type="button" [class.on]="scenario() === s.value && onTrack()" (click)="emp(s.value)">{{ s.label }}</button>
          }
        </span>
      </div>
    } @else {
      <div class="cxrow">
        <span class="cxl">Сценарий</span>
        <span class="seg cxsc">
          <button type="button" [class.on]="page() === 'careers'" (click)="list()">Список профилей</button>
          <button type="button" [class.on]="onCard() && mode() === 'create'" (click)="card('create')">Создание</button>
          <button type="button" [class.on]="onCard() && mode() === 'active'" (click)="card('active')">Действует</button>
          <button type="button" [class.on]="onCard() && mode() === 'inactive'" (click)="card('inactive')">Не действует</button>
        </span>
      </div>
    }
  `,
  styleUrl: './career-pack-bar.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'cxport' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerPackBar {
  private readonly nav = inject(NavService);
  private readonly career = inject(CareerStore);
  private readonly roleStore = inject(CareerRoleStore);

  protected readonly scenarios = CP_SCENARIOS;
  protected readonly page = this.nav.page;
  protected readonly scenario = this.career.scenario;
  protected readonly mode = this.roleStore.mode;

  /** HR — список профилей и карточка; остальное, включая уход в курс, остается сценарием сотрудника */
  protected readonly role = computed(() => (this.page() === 'careers' || this.page() === 'careerhr' || (this.page() === 'career' && this.career.viewer() === 'hr') ? 'hr' : 'emp'));
  protected readonly onTrack = computed(() => this.page() === 'career' && this.career.viewer() === 'emp');
  protected readonly onCard = computed(() => this.page() === 'careerhr' || (this.page() === 'career' && this.career.viewer() === 'hr'));

  protected emp(scenario: CpScenario): void {
    this.nav.go('career', { viewer: 'emp', scenario });
  }
  protected list(): void {
    this.nav.go('careers');
  }
  protected card(mode: 'create' | 'active' | 'inactive'): void {
    this.nav.go('careerhr', { mode });
  }
}
