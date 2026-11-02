import { Select } from '../../shared/ui/select/select';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { ShopStore } from '../../core/demo/shop-store.service';
import { ORDER_STATUSES, PRODUCTS, PRODUCT_CATS, SHOP_SORTS } from '../../data/shop.data';
import { Chips } from '../../shared/ui/chips/chips';
import { DateField } from '../../shared/ui/date-field/date-field';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { FilterInput } from '../../shared/ui/filter-input/filter-input';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { SortButton } from '../../shared/ui/sort-button/sort-button';
import { ShopGrid } from './shop-grid/shop-grid';
import { ShopHead } from './shop-head/shop-head';
import { ORDER_COLS, ShopOrders } from './shop-orders/shop-orders';
import { ShopFilters } from './shop.state';

/**
 * Страница «Корпоративный магазин» (ключ прототипа: shop): вкладки «Каталог» и «История заказов».
 * Товар, корзина и заказ — свои страницы раздела (/shop/prod/:id, /shop/cart, /shop/order/:n).
 */
@Component({
  selector: 'app-shop',
  imports: [PageHead, ShopHead, FilterBar, SortButton, Chips, FilterInput, DateField, Select, ShopGrid, ShopOrders],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-shop' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shop {
  protected readonly shop = inject(ShopStore);
  protected readonly f = inject(ShopFilters);
  protected readonly nProducts = PRODUCTS.length;
  protected readonly cats = Object.values(PRODUCT_CATS);
  protected readonly sorts = SHOP_SORTS;
  protected readonly statuses = ORDER_STATUSES;
  protected readonly methods = ['Самовывоз', 'Доставка'];
  protected readonly orderCols = ORDER_COLS.map((c) => c[0]);
  protected setOd(v: string): void {
    const t = v.trim();
    if (!t || /^\d{2}\.\d{2}\.\d{4}$/.test(t)) this.f.od.set(t);
  }
}
