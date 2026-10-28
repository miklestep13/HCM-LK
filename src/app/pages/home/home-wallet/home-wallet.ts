import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { Icon } from '../../../shared/ui/icon/icon';
import { NavService } from '../../../core/navigation/nav.service';
import { WalletStore } from '../../../core/demo/wallet.service';
import { fmt } from '../../../data/shop.data';
import { TODAY } from '../../../shared/ui/date-range/date-range';
import { WalletSendService } from '../../../widgets/wallet-send/wallet-send.service';

/** Блок «Кошелек»: баланс, изменение за месяц, перевод коллеге */
@Component({
  selector: 'app-home-wallet',
  imports: [Card, Icon],
  template: ` <app-card title="Кошелек" open="cur" openTitle="Кошелек" cls="hmwal">
    <div class="cb">
      <div class="hmwtop">
        <span class="hmwpic"><app-icon name="wallet" /></span>
        <div>
          <small>Баланс</small
          ><b
            ><span class="walv">{{ bal() }}</span
            ><app-icon name="coin" /></b
          >@if (got()) {<span class="hmwd">+{{ fmt(got()) }} за месяц</span>} @else {<span class="hmwd z">Без начислений в этом месяце</span>}
        </div>
      </div>
      <button class="btn raised blk" (click)="send.open()">Перечислить</button>
    </div>
  </app-card>`,
  styleUrl: './home-wallet.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-wallet' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeWallet {
  protected readonly nav = inject(NavService);
  protected readonly send = inject(WalletSendService);
  private readonly wallet = inject(WalletStore);
  protected readonly fmt = fmt;
  protected readonly bal = computed(() => fmt(this.wallet.balance()));
  /** начислено за текущий месяц демо (без отмененных) */
  protected readonly got = computed(() => {
    const m = String(TODAY.getMonth() + 1).padStart(2, '0') + '.' + TODAY.getFullYear();
    return this.wallet.history().filter((x) => x.d.slice(3, 10) === m && x.st !== 'Отменено' && x.amt > 0).reduce((s, x) => s + x.amt, 0);
  });
}
