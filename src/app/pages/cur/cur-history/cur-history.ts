import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { WalletStore } from '../../../core/demo/wallet.service';
import { avCls } from '../../../data/people.data';
import { COIN_SVG, fmt } from '../../../data/shop.data';
import { WALLET_ORG_ICONS, WALLET_STATUSES, WALLET_STATUS_TONE, WALLET_TYPES, walletParty } from '../../../data/wallet.data';
import { Chips } from '../../../shared/ui/chips/chips';
import { DateRangeField, inRange } from '../../../shared/ui/date-range/date-range';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { CurFilters } from '../cur.state';

/** Блок «История операций»: поиск, фильтры (статус, тип, период) и таблица операций кошелька. */
@Component({
  selector: '[cur-history]',
  imports: [FilterBar, Chips, Select, DateRangeField],
  templateUrl: './cur-history.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurHistory {
  protected readonly f = inject(CurFilters);
  private readonly wallet = inject(WalletStore);
  private readonly san = inject(DomSanitizer);
  protected readonly coin = this.san.bypassSecurityTrustHtml(COIN_SVG);
  protected readonly org = {
    bank: this.san.bypassSecurityTrustHtml(WALLET_ORG_ICONS.bank),
    shop: this.san.bypassSecurityTrustHtml(WALLET_ORG_ICONS.shop),
  };
  protected readonly types = WALLET_TYPES;
  protected readonly statuses = WALLET_STATUSES;
  protected readonly tone = WALLET_STATUS_TONE;
  protected readonly fmt = fmt;
  protected readonly abs = Math.abs;
  protected readonly av = avCls;

  protected readonly rows = computed(() => {
    const q = this.f.q().trim().toLowerCase(), t = this.f.type(), st = this.f.st(), per = this.f.per();
    return this.wallet
      .history()
      .map((h) => ({ h, p: walletParty(h) }))
      .filter(({ h, p }) => (!t || h.type === t) && (!st || h.st === st) && inRange(per, h.d) && (!q || (h.t + ' ' + h.who + ' ' + p.name + ' ' + h.n).toLowerCase().includes(q)));
  });
}
