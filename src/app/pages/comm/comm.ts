import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { CommFilters } from './comm-filters/comm-filters';
import { CommGrid } from './comm-grid/comm-grid';
import { CommState } from './comm.state';

/**
 * Страница «Сообщества» (ключ прототипа: comm): поиск и фильтры, сетка сообществ.
 * Страница сообщества — pages/commone; форма «Предложить сообщество» (кнопка в шапке) — pages/commnew.
 * Демо-роль — в dev-панели.
 */
@Component({
  selector: 'app-comm',
  imports: [PageHead, CommFilters, CommGrid],
  providers: [CommState],
  template: `
    <app-page-head title="Сообщества" backTo="company">
      <button class="btn pri cmadd" (click)="nav.go('commnew', { role: demo.commRole() })">Предложить сообщество</button>
    </app-page-head>
    <div class="c cmbar" comm-filters></div>
    <div class="cgrid" comm-grid></div>
  `,
  styleUrl: './comm.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-comm' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Comm implements OnDestroy {
  protected readonly demo = inject(DemoState);
  protected readonly nav = inject(NavService);
  private readonly off = inject(DevPanelService).register({
    id: 'commRole',
    label: 'Роль в сообществах',
    options: [
      { value: 'emp', label: 'Сотрудник' },
      { value: 'cadm', label: 'Админ сообщества' },
      { value: 'adm', label: 'Админ' },
    ],
    value: this.demo.commRole,
  });
  ngOnDestroy(): void { this.off(); }
}
