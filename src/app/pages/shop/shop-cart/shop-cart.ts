import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ShopStore } from '../../../core/demo/shop-store.service';
import { WalletStore } from '../../../core/demo/wallet.service';
import { COIN_SVG, DEL_SVG, SHOP_OFFICE, fmt } from '../../../data/shop.data';
import { plural } from '../../../data/org.data';
import { OrderItem } from '../../../interface/shop';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Field } from '../../../shared/ui/field/field';
import { PageHead } from '../../../shared/ui/page-head/page-head';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ShopHead } from '../shop-head/shop-head';
import { ShopItems } from '../shop-items/shop-items';
import { useShopAlign } from '../shop-align';

const coins = (n: number) => fmt(n) + ' ' + plural(n, 'коин', 'коина', 'коинов');

/**
 * Страница «Корзина»: выбор товаров, количество, получение (самовывоз / доставка), комментарий, итог и оформление.
 * После оформления — экран «Заказ оформлен». Маршрут /shop/cart
 */
@Component({
  selector: 'app-shop-cart',
  imports: [PageHead, ShopHead, ShopItems, Field, Select],
  templateUrl: './shop-cart.html',
  styleUrl: '../shop.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-shop' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopCart {
  constructor() {
    useShopAlign();
  }
  protected readonly shop = inject(ShopStore);
  protected readonly wallet = inject(WalletStore);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly san = inject(DomSanitizer);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly coin = this.san.bypassSecurityTrustHtml(COIN_SVG);
  protected readonly del = this.san.bypassSecurityTrustHtml(DEL_SVG);
  protected readonly fmt = fmt;
  protected readonly coins = coins;
  protected readonly office = SHOP_OFFICE;
  protected readonly addrErr = signal(false);
  /** оформленный заказ (экран «Заказ оформлен») */
  protected readonly done = signal<{ k: number; no: string; sum: number; plan: string } | null>(null);

  protected readonly items = computed<OrderItem[]>(() => Object.keys(this.shop.cart()).map((id) => [id, this.shop.cart()[id], '', '']));
  protected readonly lack = computed(() => this.shop.selSum() - this.wallet.balance());

  protected toCatalog(): void { this.router.navigateByUrl('/shop'); }
  protected setMethod(v: string): void { this.shop.method.set(v === 'Доставка' ? 'dlv' : 'pick'); }
  protected clearSel(): void { this.shop.unsel.set(new Set(Object.keys(this.shop.cart()))); }
  protected async delSel(): Promise<void> {
    const sel = this.shop.selected(), n = sel.length;
    const ok = await this.confirm.ask({
      title: 'Удалить выбранные товары?',
      text: `${n} ${plural(n, 'товар будет убран', 'товара будут убраны', 'товаров будут убраны')} из корзины.`,
      ok: 'Удалить',
    });
    if (ok) sel.forEach((id) => this.shop.set(id, 0));
  }
  protected async order(): Promise<void> {
    const sum = this.shop.selSum(), sel = this.shop.selected();
    if (sum > this.wallet.balance() || !sel.length) return;
    if (this.shop.method() === 'dlv' && !this.shop.address().trim()) {
      this.addrErr.set(true);
      this.el.querySelector<HTMLInputElement>('.shdlv .fin')?.focus();
      return this.toast.show('Укажите адрес доставки', 'Без адреса заказ не получится доставить.');
    }
    const ok = await this.confirm.ask({ title: 'Оформить заказ?', text: `С баланса спишется ${coins(sum)}. Отменить заказ можно, пока он не собран.`, ok: 'Оформить' });
    if (!ok) return;
    const d = new Date(), pl = new Date(d.getTime() + 10 * 864e5), z = (n: number) => String(n).padStart(2, '0');
    const day = (x: Date) => `${z(x.getDate())}.${z(x.getMonth() + 1)}.${x.getFullYear()}`;
    const no = 'ORD-2026-0' + (185 + this.shop.orders().length - 6);
    const cart = this.shop.cart();
    this.shop.orders.update((o) => [
      { no, created: day(d) + ' ' + d.toTimeString().slice(0, 5), status: ['org', 'Собирается'], items: sel.map((id) => [id, cart[id], 'org', 'Комплектуется']),
        plan: day(pl), comment: this.shop.comment().trim(), method: this.shop.method(), address: this.shop.method() === 'pick' ? SHOP_OFFICE : this.shop.address().trim() },
      ...o,
    ]);
    this.wallet.log('Покупка', 'Заказ в корпоративном магазине', 'Корпоративный магазин', -sum, 'В обработке');
    sel.forEach((id) => this.shop.set(id, 0));
    this.shop.comment.set('');
    this.shop.method.set('pick');
    this.shop.address.set('');
    this.done.set({ k: 0, no, sum, plan: day(pl) });
    window.scrollTo(0, 0);
  }
  protected openOrder(k: number): void { this.router.navigateByUrl('/shop/order/' + k); }
}
