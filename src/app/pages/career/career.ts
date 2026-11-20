import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CareerStore } from '../../core/demo/career-store.service';
import { CareerRoleStore, HrCardMode } from '../../core/demo/career-role.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { CP_SCENARIOS } from '../../data/career-path.data';
import { EVM_TYPES } from '../../data/event-members.data';
import { CpScenario } from '../../interface/career-path';
import { EvCol } from '../../interface/member';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { EventMembers } from '../../widgets/event-members/event-members';
import { CareerEmpty } from './career-empty/career-empty';
import { CareerExperts } from './career-experts/career-experts';
import { CareerHr } from './career-hr/career-hr';
import { CareerReq } from './career-req/career-req';
import { CareerRoad } from './career-road/career-road';

/**
 * «Мой кабинет → Карьерный трек»: возможности развития, требования грейда, кураторы должности.
 * Освоенный грейд зеленый. Синий шаг — только заявленный переход; без ИПР и плана соединитель серый.
 */
@Component({
  selector: 'app-career',
  imports: [PageHead, CareerRoad, CareerReq, CareerExperts, CareerEmpty, CareerHr, EventMembers],
  template: `
    <app-page-head [title]="pageTitle()" [noBack]="true">
      @if (s.viewer() === 'hr' && !role.form()) {
        <span class="objacts">
          @if (role.status() === 'Действует') {
            <button type="button" class="btn dng" (click)="removeCard()">Удалить</button>
          }
          <button type="button" class="btn pri" (click)="editCard()">Редактировать</button>
        </span>
      }
    </app-page-head>

    @if (s.viewer() === 'hr') {
      <app-career-hr />
    } @else if (!s.hasTrack()) {
      <app-career-empty [kind]="$any(s.scenario())" />
    } @else {
      <div class="c" career-road></div>
      <div class="cols cpcols">
        <div class="cM">
          <div class="c" career-req></div>
          <div
            class="c"
            event-members
            title="Сотрудники с должностью"
            [rows]="staff()"
            [pool]="role.memberPool"
            [types]="memberTypes"
            [roles]="staffRoles()"
            [cols]="staffCols"
            memberLabel="Сотрудник"
            roleLabel="Грейд"
            fromLabel="Дата присвоения"
            edit="none"
            filters
            paging="pages"
            roleMode="single"
          ></div>
        </div>
        <div class="cR">
          <div class="c" career-experts></div>
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
  protected readonly role = inject(CareerRoleStore);
  private readonly dev = inject(DevPanelService);

  protected readonly memberTypes = EVM_TYPES;
  protected readonly staffCols: EvCol[] = ['member', 'role', 'from'];
  /** состав таблицы следует выбранной ступени на дорожке */
  protected readonly staff = computed(() => this.role.trackStaff().filter((h) => h.roles.includes(this.s.grade())));
  protected readonly staffRoles = computed(() => [this.s.grade()]);
  private readonly hr = viewChild(CareerHr);

  protected editCard(): void {
    this.hr()?.edit();
  }
  protected removeCard(): void {
    void this.hr()?.remove();
  }

  protected readonly pageTitle = computed(() => {
    if (this.s.viewer() !== 'hr') return 'Карьерный трек';
    return this.role.mode() === 'create' && !this.role.kept() ? 'Добавление профиля должности' : 'Профиль должности';
  });

  constructor() {
    const apply = () => {
      const raw = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?') + 1) : location.search.slice(1);
      const q = new URLSearchParams(raw);
      const viewer = q.get('viewer');
      if (viewer === 'emp' || viewer === 'hr') this.s.viewer.set(viewer);
      const scenario = q.get('scenario');
      if (scenario && CP_SCENARIOS.some((o) => o.value === scenario)) this.s.setScenario(scenario as CpScenario);
      const mode = q.get('mode');
      if (mode === 'create' || mode === 'active' || mode === 'inactive') this.role.setMode(mode);
    };
    apply();
    // роутер меняет hash через pushState и событие hashchange не шлет — сценарии полоски читаем после перехода
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => apply());
    window.addEventListener('hashchange', apply);
    effect((onCleanup) => {
      const off = [
        this.dev.register({
          id: 'careerRole',
          label: 'Роль',
          options: [
            { value: 'emp', label: 'Сотрудник' },
            { value: 'hr', label: 'HR' },
          ],
          value: devValue<'emp' | 'hr'>(
            () => this.s.viewer(),
            (v) => this.s.viewer.set(v),
          ),
        }),
      ];
      if (this.s.viewer() === 'emp') {
        off.push(
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
      } else {
        off.push(
          this.dev.register({
            id: 'careerCard',
            label: 'Карточка должности',
            options: [
              { value: 'create', label: 'Создание' },
              { value: 'active', label: 'Действует' },
              { value: 'inactive', label: 'Не действует' },
            ],
            value: devValue<HrCardMode>(
              () => this.role.mode(),
              (v) => this.role.setMode(v),
            ),
          }),
        );
      }
      onCleanup(() => off.forEach((fn) => fn()));
    });
  }
}
