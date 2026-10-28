import { Injectable, signal } from '@angular/core';
import { WALLET_BALANCE, WALLET_HISTORY, WALLET_NEXT_N } from '../../data/wallet.data';
import { WalletOp } from '../../interface/wallet';

/** Кошелек в демо: баланс коинов и история операций. Покупки в магазине и переводы коллегам меняют баланс. */
@Injectable({ providedIn: 'root' })
export class WalletStore {
  readonly balance = signal(WALLET_BALANCE);
  readonly history = signal<WalletOp[]>(WALLET_HISTORY.map((x) => ({ ...x })));
  private n = WALLET_NEXT_N;

  /** записать операцию и изменить баланс (amt: + пришло, − ушло) */
  log(type: string, t: string, who: string, amt: number, st = 'Выполнено'): void {
    const d = new Date(), z = (x: number) => String(x).padStart(2, '0');
    const when = `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`;
    this.history.update((h) => [{ n: this.n++, d: when, type, t, who, amt, st }, ...h]);
    if (st !== 'Отменено') this.balance.update((b) => b + amt);
  }
}
