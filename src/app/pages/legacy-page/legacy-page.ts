import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LegacyService } from '../../core/legacy/legacy.service';

/**
 * Маршрут /legacy/:page — страница, которая еще не перенесена в Angular.
 * Сам компонент пустой: показывает общий iframe старого прототипа и открывает в нем нужную страницу.
 */
@Component({
  selector: 'app-legacy-page',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegacyPage implements OnDestroy {
  private readonly legacy = inject(LegacyService);
  private readonly router = inject(Router);

  constructor() {
    const route = inject(ActivatedRoute);
    route.paramMap.subscribe((p) => {
      const page = p.get('page') ?? 'home';
      const q = route.snapshot.queryParams;
      const fromLegacy = !!this.router.getCurrentNavigation()?.extras.state?.['fromLegacy'];
      this.legacy.open(page, Object.keys(q).length ? { ...q } : undefined, fromLegacy);
    });
  }

  ngOnDestroy(): void {
    this.legacy.hide();
  }
}
