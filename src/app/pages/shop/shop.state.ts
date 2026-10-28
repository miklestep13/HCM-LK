import { Injectable, computed, signal } from '@angular/core';
import { PRODUCTS, PRODUCT_CATS } from '../../data/shop.data';
import { Product } from '../../interface/shop';

const SORT: Record<string, (x: Product, y: Product) => number> = {
  'По популярности': (x, y) => y.views - x.views,
  'Сначала дешевле': (x, y) => x.price - y.price,
  'Сначала дороже': (x, y) => y.price - x.price,
  'По названию': (x, y) => x.name.localeCompare(y.name, 'ru'),
};

/** Фильтры каталога и истории заказов — живут, пока открыт раздел (между переходами к товару и обратно) */
@Injectable({ providedIn: 'root' })
export class ShopFilters {
  readonly q = signal('');
  readonly cat = signal('');
  readonly stock = signal(false);
  readonly pmin = signal('');
  readonly pmax = signal('');
  readonly sort = signal('По популярности');
  readonly catOpen = signal(false);
  // история заказов
  readonly oq = signal('');
  readonly ost = signal('');
  readonly od = signal('');
  readonly on = signal('');
  readonly os = signal('');
  readonly osort = signal({ k: 1, d: -1 });
  readonly ordOpen = signal(false);
  readonly hidden = signal<number[]>([]);

  readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(), lo = this.pmin() === '' ? 0 : +this.pmin(), hi = this.pmax() === '' ? Infinity : +this.pmax();
    return PRODUCTS.filter((p) => (!q || (p.name + ' ' + PRODUCT_CATS[p.cat]).toLowerCase().includes(q)) &&
      (!this.cat() || PRODUCT_CATS[p.cat] === this.cat()) && p.price >= lo && p.price <= hi && (!this.stock() || p.stock > 0)).sort(SORT[this.sort()]);
  });
}
