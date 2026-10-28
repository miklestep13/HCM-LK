import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ShopStore } from '../../../core/demo/shop-store.service';
import { WalletStore } from '../../../core/demo/wallet.service';
import { COIN_SVG, fmt, methodText, orderSum } from '../../../data/shop.data';
import { plural } from '../../../data/org.data';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../../shared/ui/page-head/page-head';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ShopItems } from '../shop-items/shop-items';
import { useShopAlign } from '../shop-align';

/** Страница «Просмотр заказа»: реквизиты, товары со статусами, отмена (пока заказ не выдан). Маршрут /shop/order/:k */
@Component({
  selector: 'app-shop-order',
  imports: [PageHead, ShopItems],
  templateUrl: './shop-order.html',
  styleUrl: '../shop.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-shop' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopOrder {
  constructor() {
    useShopAlign();
  }
  /** номер заказа в истории (с нуля) */
  readonly k = input.required<string>();
  private readonly shop = inject(ShopStore);
  private readonly wallet = inject(WalletStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly coin = inject(DomSanitizer).bypassSecurityTrustHtml(COIN_SVG);
  protected readonly fmt = fmt;
  protected readonly method = methodText;
  protected readonly o = computed(() => this.shop.orders()[+this.k()]);
  protected readonly sum = computed(() => orderSum(this.o()));
  protected readonly canCancel = computed(() => !['Выдан', 'Отменен'].includes(this.o().status[1]));

  protected async cancel(): Promise<void> {
    const o = this.o(), sum = this.sum(), c = `${fmt(sum)} ${plural(sum, 'коин', 'коина', 'коинов')}`;
    const ok = await this.confirm.ask({ title: 'Отменить заказ?', text: `Заказ ${o.no} будет отменен, ${c} вернутся на баланс. Действие нельзя отменить.`, ok: 'Отменить заказ', danger: true });
    if (!ok) return;
    this.shop.orders.update((l) => l.map((x) => (x === o ? { ...x, status: ['red', 'Отменен'], items: x.items.map((i) => [i[0], i[1], 'red', 'Отменен']), plan: '—' } : x)));
    this.wallet.log('Возврат', 'Отмена заказа ' + o.no, 'Корпоративный магазин', sum);
    this.toast.show('Заказ отменен', `На баланс вернулось ${c}.`);
  }
}
