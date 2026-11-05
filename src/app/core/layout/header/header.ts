import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { NavService } from '../../navigation/nav.service';
import { ME_MENU, NAV_TABS, NavItem, NavTab } from '../../navigation/nav.config';
import { ME } from '../../../data/home.data';

/**
 * Шапка портала: вкладки «Компания / Мой кабинет / Управление сотрудниками / Управление персоналом» с меню.
 * Если вкладки не помещаются в ширину шапки — вместо них гамбургер слева от логотипа: панель с разделами и пунктами меню.
 */
@Component({
  selector: 'app-header',
  imports: [Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { '(document:click)': 'burger.set(false)', '(document:keydown.escape)': 'burger.set(false)' },
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

  /** вкладки не помещаются — показываем гамбургер; burger — открыта ли панель */
  protected readonly compact = signal(false);
  protected readonly burger = signal(false);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly tabsEl = viewChild<ElementRef<HTMLElement>>('tabsEl');
  /** ширина вкладок в развернутом виде (замеряется, пока они видны) */
  private tabsW = 0;

  constructor() {
    afterNextRender(() => {
      const inner = this.host.querySelector('.hd-in') as HTMLElement;
      const fit = () => {
        const tabs = this.tabsEl()?.nativeElement;
        if (tabs && !this.compact()) this.tabsW = tabs.scrollWidth;
        const logo = (this.host.querySelector('.logo') as HTMLElement).offsetWidth,
          right = (this.host.querySelector('.hd-r') as HTMLElement).scrollWidth,
          pad = parseFloat(getComputedStyle(inner).paddingLeft) * 2,
          need = logo + 16 + this.tabsW + 24 + right;
        const c = inner.clientWidth - pad < need;
        if (c !== this.compact()) {
          this.compact.set(c);
          if (!c) this.burger.set(false);
        }
      };
      const ro = new ResizeObserver(fit);
      ro.observe(inner);
      fit();
      this.destroy.onDestroy(() => ro.disconnect());
    });
  }
  private readonly destroy = inject(DestroyRef);

  protected toggleBurger(e: Event): void {
    e.stopPropagation();
    this.burger.set(!this.burger());
  }
  protected openBurger(item: NavItem | NavTab): void {
    this.burger.set(false);
    this.open(item);
  }

  /** меню, которое закрываем после выбора пункта (до ухода курсора) */
  protected readonly closed = signal('');

  protected open(item: NavItem | NavTab, e?: Event, menu?: string): void {
    e?.stopPropagation();
    if (menu) this.closed.set(menu);
    const page = (item as NavItem).page ?? (item as NavTab).page;
    if (page) this.nav.goMenu(page, (item as NavItem).attrs);
  }
}
