import { Injectable, computed, signal } from '@angular/core';
import { ORDERS, PRODUCT_CHAT, productById, stockLimit } from '../../data/shop.data';
import { Order, ProductComment } from '../../interface/shop';

/** Магазин в демо: корзина, выбор в корзине, способ получения, история заказов и комментарии к товарам. */
@Injectable({ providedIn: 'root' })
export class ShopStore {
  /** товар → количество */
  readonly cart = signal<Record<string, number>>({});
  /** товары корзины, с которых снят выбор (новые попадают выбранными) */
  readonly unsel = signal(new Set<string>());
  readonly method = signal<'pick' | 'dlv'>('pick');
  readonly address = signal('');
  readonly comment = signal('');
  readonly orders = signal<Order[]>(ORDERS.map((o) => ({ ...o, items: o.items.map((i) => [...i] as Order['items'][0]) })));
  readonly chat = signal<Record<string, ProductComment[]>>(structuredClone(PRODUCT_CHAT));
  readonly tab = signal<'cat' | 'ord'>('cat');

  readonly count = computed(() => Object.values(this.cart()).reduce((a, b) => a + b, 0));
  readonly selected = computed(() => Object.keys(this.cart()).filter((id) => !this.unsel().has(id)));
  readonly selSum = computed(() => this.selected().reduce((a, id) => a + productById(id).price * this.cart()[id], 0));
  readonly selCount = computed(() => this.selected().reduce((a, id) => a + this.cart()[id], 0));

  /** положить n штук (0 — убрать) */
  set(id: string, n: number): void {
    const p = productById(id);
    n = Math.min(stockLimit(p), Math.max(0, n));
    const c = { ...this.cart() };
    if (n) c[id] = n;
    else delete c[id];
    this.cart.set(c);
    if (!n) this.unsel.update((s) => { const x = new Set(s); x.delete(id); return x; });
  }
  add(id: string, d: number): void { this.set(id, (this.cart()[id] || 0) + d); }
}
