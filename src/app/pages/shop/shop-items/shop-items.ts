import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ShopStore } from '../../../core/demo/shop-store.service';
import { COIN_SVG, DEL_SVG, fmt, productById, stockLimit, stockText } from '../../../data/shop.data';
import { OrderItem } from '../../../interface/shop';

/**
 * Таблица товаров корзины и заказа: товар · цена за ед. · количество · сумма.
 * В корзине (readonly=false) — выбор чекбоксами, количество и удаление; в заказе — статус каждой позиции.
 */
@Component({
  selector: '[shop-items]',
  templateUrl: './shop-items.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopItems {
  readonly items = input.required<OrderItem[]>();
  readonly readonly = input(false);
  protected readonly shop = inject(ShopStore);
  private readonly router = inject(Router);
  private readonly san = inject(DomSanitizer);
  protected readonly coin = this.san.bypassSecurityTrustHtml(COIN_SVG);
  protected readonly del = this.san.bypassSecurityTrustHtml(DEL_SVG);
  protected readonly fmt = fmt;
  protected readonly p = productById;
  protected readonly stock = stockText;
  protected readonly allOn = computed(() => this.shop.selected().length > 0 && this.shop.selected().length === this.items().length);
  protected readonly some = computed(() => this.shop.selected().length > 0 && this.shop.selected().length < this.items().length);

  protected open(id: string): void { this.router.navigateByUrl('/shop/prod/' + id); window.scrollTo(0, 0); }
  protected pick(id: string, on: boolean): void {
    this.shop.unsel.update((s) => { const x = new Set(s); on ? x.delete(id) : x.add(id); return x; });
  }
  protected all(on: boolean): void { this.shop.unsel.set(on ? new Set() : new Set(this.items().map((i) => i[0]))); }
  protected qty(id: string, d: number): void {
    const n = this.shop.cart()[id];
    this.shop.set(id, Math.min(stockLimit(productById(id)), Math.max(1, n + d)));
  }
  protected qtyInput(id: string, v: string): void { this.shop.set(id, Math.min(stockLimit(productById(id)), Math.max(1, parseInt(v, 10) || 1))); }
}
