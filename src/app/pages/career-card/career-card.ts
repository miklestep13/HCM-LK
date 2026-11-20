import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CareerRoleStore, HrCardMode } from '../../core/demo/career-role.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { CareerHr } from '../career/career-hr/career-hr';

/**
 * Карточка должности для HR. Открывается из «Управление персоналом → Карьерные треки».
 * Сотрудник смотрит свой трек отдельно, в «Моем кабинете».
 */
@Component({
  selector: 'app-career-card',
  imports: [PageHead, CareerHr],
  template: `
    <app-page-head [title]="pageTitle()" backTo="careers" backLabel="Профили должностей">
      @if (!role.form()) {
        <span class="objacts">
          @if (role.status() === 'Действует') {
            <button type="button" class="btn dng" (click)="removeCard()">Удалить</button>
          }
          <button type="button" class="btn pri" (click)="editCard()">Редактировать</button>
        </span>
      }
    </app-page-head>
    <app-career-hr />
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-careerhr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerCard {
  protected readonly role = inject(CareerRoleStore);
  private readonly dev = inject(DevPanelService);
  private readonly hr = viewChild(CareerHr);

  protected editCard(): void {
    this.hr()?.edit();
  }
  protected removeCard(): void {
    void this.hr()?.remove();
  }

  protected readonly pageTitle = computed(() =>
    this.role.mode() === 'create' && !this.role.kept() ? 'Добавление профиля должности' : 'Профиль должности',
  );

  constructor() {
    const apply = () => {
      const raw = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?') + 1) : location.search.slice(1);
      const q = new URLSearchParams(raw);
      const mode = q.get('mode');
      if (mode === 'create' || mode === 'active' || mode === 'inactive') this.role.setMode(mode);
    };
    apply();
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => apply());
    window.addEventListener('hashchange', apply);
    effect((onCleanup) => {
      const off = this.dev.register({
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
      });
      onCleanup(off);
    });
  }
}
