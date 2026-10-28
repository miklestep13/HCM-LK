import { Injectable, signal } from '@angular/core';

/**
 * Открыть сайдбар «Перечислить валюту» с любой страницы: inject(WalletSendService).open('Ершов Никита Павлович').
 * Сам сайдбар (<app-wallet-send>) один на приложение — стоит в app.html.
 */
@Injectable({ providedIn: 'root' })
export class WalletSendService {
  readonly isOpen = signal(false);
  /** получатель, выбранный заранее */
  readonly to = signal('');
  open(to = ''): void {
    this.to.set(to);
    this.isOpen.set(true);
  }
  close(): void {
    this.isOpen.set(false);
  }
}
