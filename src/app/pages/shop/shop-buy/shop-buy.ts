import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ShopStore } from '../../../core/demo/shop-store.service';
import { stockLimit } from '../../../data/shop.data';
import { Product } from '../../../interface/shop';

/** Кнопка покупки: «В корзину» (второстепенная, голубая — основная на странице «Корзина») → «Добавлено · N шт.» с минусом и плюсом; «Нет в наличии» — неактивна. */
@Component({
  selector: 'app-shop-buy',
  template: `
    @let n = count();
    @if (p().stock === 0) {
      <button class="btn raised" [class.blk]="block()" disabled>Нет в наличии</button>
    } @else if (!n) {
      <button class="btn raised" [class.blk]="block()" (click)="$event.stopPropagation(); shop.add(p().id, 1)">В корзину</button>
    } @else {
      <div class="pqb" (click)="$event.stopPropagation()">
        <button [title]="n === 1 ? 'Убрать из корзины' : 'Убрать одну штуку'" (click)="shop.add(p().id, -1)">
          <svg viewBox="0 0 16 16" fill="none"><path d="M3.6 8h8.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
        </button>
        <span>Добавлено · {{ n }} шт.</span>
        <button title="Добавить еще" [disabled]="n >= limit()" (click)="shop.add(p().id, 1)">
          <svg viewBox="0 0 16 16" fill="none"><path d="M8 3.6v8.8M3.6 8h8.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
        </button>
      </div>
    }
  `,
  host: { style: 'display:contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopBuy {
  readonly p = input.required<Product>();
  readonly block = input(true);
  protected readonly shop = inject(ShopStore);
  protected readonly count = computed(() => this.shop.cart()[this.p().id] || 0);
  protected readonly limit = computed(() => stockLimit(this.p()));
}
