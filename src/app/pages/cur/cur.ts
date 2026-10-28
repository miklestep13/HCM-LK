import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { WalletStore } from '../../core/demo/wallet.service';
import { COIN_SVG, fmt } from '../../data/shop.data';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { WalletSendService } from '../../widgets/wallet-send/wallet-send.service';
import { CurHistory } from './cur-history/cur-history';

/** Страница «Кошелек»: баланс, «Перечислить валюту» (сайдбар-виджет) и история операций с фильтрами. */
@Component({
  selector: 'app-cur',
  imports: [PageHead, CurHistory],
  template: `
    <app-page-head title="Кошелек">
      <span class="nchead">
        <span class="curbal" title="Баланс"><b>{{ fmt(wallet.balance()) }}</b><span style="display: contents" [innerHTML]="coin"></span></span>
        <button class="btn pri" (click)="send.open()">Перечислить валюту</button>
      </span>
    </app-page-head>
    <div class="curg">
      <div class="c" cur-history></div>
    </div>
  `,
  styleUrl: './cur.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-cur' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cur {
  protected readonly wallet = inject(WalletStore);
  protected readonly send = inject(WalletSendService);
  protected readonly coin = inject(DomSanitizer).bypassSecurityTrustHtml(COIN_SVG);
  protected readonly fmt = fmt;
}
