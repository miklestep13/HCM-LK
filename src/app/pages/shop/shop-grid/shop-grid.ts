import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { COIN_SVG, PRODUCT_CATS, fmt, stockText } from '../../../data/shop.data';
import { ShopBuy } from '../shop-buy/shop-buy';
import { ShopFilters } from '../shop.state';

/** Блок «Каталог»: карточки товаров (фото, название, категория, цена, наличие, кнопка корзины). */
@Component({
  selector: '[shop-grid]',
  imports: [ShopBuy],
  template: `
    <div class="cgrid">
      @for (p of f.list(); track p.id) {
        <div class="ccard cw cmc pdc" tabindex="0" (click)="open(p.id)" (keydown.enter)="open(p.id)">
          <div class="cbody">
            <div class="cmcv pdcv"><img class="pim" [src]="p.img" alt="" /></div>
            <div class="cc2">
              <b class="cmtt" [title]="p.name">{{ p.name }}</b><small class="cmct">{{ cats[p.cat] }}</small>
              <span class="pdpr">{{ fmt(p.price) }}<span style="display: contents" [innerHTML]="coin"></span></span>
              <p class="cmd pdst" [class.out]="p.stock === 0" [class.low]="p.stock > 0 && p.stock < 10">{{ stock(p) }}</p>
            </div>
          </div>
          <div class="cact"><app-shop-buy [p]="p" /></div>
        </div>
      }
    </div>
    <div class="c bkemp" [class.hidden]="f.list().length">Товары не найдены. Измените запрос или сбросьте фильтры.</div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopGrid {
  protected readonly f = inject(ShopFilters);
  private readonly router = inject(Router);
  protected readonly cats = PRODUCT_CATS;
  protected readonly fmt = fmt;
  protected readonly stock = stockText;
  protected readonly coin = inject(DomSanitizer).bypassSecurityTrustHtml(COIN_SVG);
  protected open(id: string): void { this.router.navigateByUrl('/shop/prod/' + id); window.scrollTo(0, 0); }
}
