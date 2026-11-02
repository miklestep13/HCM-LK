import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ShopStore } from '../../../core/demo/shop-store.service';
import { WalletStore } from '../../../core/demo/wallet.service';
import { NavService } from '../../../core/navigation/nav.service';
import { COIN_SVG, fmt } from '../../../data/shop.data';

/** Правая часть заголовка магазина: баланс (переход в кошелек) и кнопка «Корзина» со счетчиком. */
@Component({
  selector: 'app-shop-head',
  template: `
    <button class="balance balb" [class.shbal2]="!list()" title="Кошелек: баланс и история операций" (click)="nav.go('cur')">
      <b>{{ bal() }}</b><span style="display: contents" [innerHTML]="coin"></span>
    </button>
    @if (cart()) {
      <button class="btn pri cartb" (click)="router.navigateByUrl('/shop/cart')">
        <svg viewBox="0 0 20 20" fill="none"><path d="M3 4h2.2l1.8 9.2a1.6 1.6 0 0 0 1.6 1.3h6.2a1.6 1.6 0 0 0 1.6-1.3L17.6 7H6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /><circle cx="9" cy="17" r="1.2" fill="currentColor" /><circle cx="15" cy="17" r="1.2" fill="currentColor" /></svg>Корзина<span class="cartn" [class.hidden]="!shop.count()">{{ shop.count() }}</span>
      </button>
    }
  `,
  host: { '[class.shhr]': 'cart()', '[style.display]': "cart() ? null : 'contents'" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopHead {
  /** показывать кнопку корзины */
  readonly cart = input(true);
  /** вид каталога (в остальных разделах — баланс в другом стиле) */
  readonly list = input(false);
  protected readonly nav = inject(NavService);
  protected readonly router = inject(Router);
  protected readonly shop = inject(ShopStore);
  private readonly wallet = inject(WalletStore);
  protected readonly coin = inject(DomSanitizer).bypassSecurityTrustHtml(COIN_SVG);
  protected readonly bal = computed(() => fmt(this.wallet.balance()));
}
