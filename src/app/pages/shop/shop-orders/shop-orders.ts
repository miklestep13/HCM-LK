import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ShopStore } from '../../../core/demo/shop-store.service';
import { COIN_SVG, fmt, methodText, orderQty, orderSum } from '../../../data/shop.data';
import { Order } from '../../../interface/shop';
import { hiddenCols } from '../../../shared/ui/table-settings/table-settings';
import { ShopFilters } from '../shop.state';

/** столбцы истории заказов: заголовок и ключ сортировки */
export const ORDER_COLS: [string, (o: Order) => string | number][] = [
  ['Номер заказа', (o) => o.no],
  ['Дата и время создания', (o) => o.created.slice(0, 10).split('.').reverse().join('') + o.created.slice(11)],
  ['Количество', (o) => orderQty(o)],
  ['Сумма', (o) => orderSum(o)],
  ['Способ получения', (o) => methodText(o.method)],
  ['Адрес', (o) => o.address || ''],
  ['Статус заказа', (o) => o.status[1]],
];

/** Блок «История заказов»: таблица с сортировкой по любому столбцу; строка открывает заказ. */
@Component({
  selector: '[shop-orders]',
  templateUrl: './shop-orders.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopOrders {
  protected readonly f = inject(ShopFilters);
  private readonly shop = inject(ShopStore);
  private readonly router = inject(Router);
  protected readonly cols = ORDER_COLS;
  protected readonly fmt = fmt;
  protected readonly qty = orderQty;
  protected readonly sum = orderSum;
  protected readonly method = methodText;
  protected readonly hc = hiddenCols;
  protected readonly coin = inject(DomSanitizer).bypassSecurityTrustHtml(COIN_SVG);
  protected readonly rows = computed(() => {
    const q = this.f.oq().trim().toLowerCase(), s = this.f.osort();
    return this.shop
      .orders()
      .map((o, k) => ({ o, k }))
      .filter(({ o }) => (!q || o.no.toLowerCase().includes(q)) && (!this.f.od() || o.created.slice(0, 10) === this.f.od()) &&
        (!this.f.on() || orderQty(o) === +this.f.on()) && (!this.f.os() || String(orderSum(o)).includes(this.f.os())) && (!this.f.ost() || o.status[1] === this.f.ost()))
      .sort((x, y) => { const g = ORDER_COLS[s.k][1], a = g(x.o), b = g(y.o); return (a < b ? -1 : a > b ? 1 : 0) * s.d; });
  });
  protected sortBy(k: number, e: Event): void {
    e.stopPropagation();
    const s = this.f.osort();
    this.f.osort.set({ k, d: s.k === k ? -s.d : 1 });
  }
  protected open(k: number): void { this.router.navigateByUrl('/shop/order/' + k); window.scrollTo(0, 0); }
}
