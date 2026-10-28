import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { NavService } from '../../navigation/nav.service';
import { ME_MENU, NAV_TABS, NavItem, NavTab } from '../../navigation/nav.config';
import { ME } from '../../../data/home.data';

/** Шапка портала: вкладки «Компания / Мой кабинет / Управление сотрудниками / Управление персоналом» с меню */
@Component({
  selector: 'app-header',
  imports: [Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly nav = inject(NavService);
  protected readonly tabs = NAV_TABS;
  protected readonly meMenu = ME_MENU;
  protected readonly me = ME;

  /** активная вкладка — та, в меню которой есть текущая страница */
  protected readonly activeTab = computed(() => {
    const p = this.nav.page();
    const has = (items: NavItem[]): boolean =>
      items.some((i) => i.page === p || (i.children ? has(i.children) : false));
    return this.tabs.find((t) => t.page === p || has(t.items))?.title ?? '';
  });

  /** меню, которое закрываем после выбора пункта (до ухода курсора) */
  protected readonly closed = signal('');

  protected open(item: NavItem | NavTab, e?: Event, menu?: string): void {
    e?.stopPropagation();
    if (menu) this.closed.set(menu);
    const page = (item as NavItem).page ?? (item as NavTab).page;
    if (page) this.nav.goMenu(page, (item as NavItem).attrs);
  }
}
