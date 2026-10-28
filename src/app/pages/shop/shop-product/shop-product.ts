import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ShopStore } from '../../../core/demo/shop-store.service';
import { COIN_SVG, PRODUCT_CATS, fmt, productById, stockText } from '../../../data/shop.data';
import { PageHead } from '../../../shared/ui/page-head/page-head';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommentItem, Comments } from '../../../widgets/comments/comments';
import { ShopBuy } from '../shop-buy/shop-buy';
import { ShopHead } from '../shop-head/shop-head';

/** фон второго кадра слайдера по категории */
const CAT_BG: Record<string, string> = { health: '#FDECEF', merch: '#EFF6FF', tech: '#F1ECFB', acc: '#FDECEF' };

/** Страница «Просмотр товара»: слайдер (3 кадра), характеристики, покупка, описание и комментарии. Маршрут /shop/prod/:id */
@Component({
  selector: 'app-shop-product',
  imports: [PageHead, ShopHead, ShopBuy, Comments],
  templateUrl: './shop-product.html',
  styleUrl: '../shop.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-shop' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopProduct {
  /** id товара из адреса */
  readonly id = input.required<string>();
  private readonly shop = inject(ShopStore);
  private readonly toast = inject(ToastService);
  protected readonly coin = inject(DomSanitizer).bypassSecurityTrustHtml(COIN_SVG);
  protected readonly p = computed(() => productById(this.id()));
  protected readonly cats = PRODUCT_CATS;
  protected readonly fmt = fmt;
  protected readonly slide = signal(0);
  protected readonly bg = computed(() => CAT_BG[this.p().cat] ?? '#fff');
  protected readonly stock = computed(() => stockText(this.p()).replace('В наличии: ', ''));
  protected readonly chat = computed<CommentItem[]>(() =>
    (this.shop.chat()[this.id()] ?? []).map((m) => ({ av: m[0], author: m[1], date: m[2], text: m[3], likes: m[5] || 0, liked: !!m[6], mine: m[1] === 'Вы' })),
  );

  protected move(d: number): void { this.slide.set((this.slide() + d + 3) % 3); }
  protected send(t: string): void {
    if (!t) return this.toast.show('Пустой комментарий', 'Напишите текст комментария.');
    const d = new Date(), z = (n: number) => String(n).padStart(2, '0');
    const when = `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${d.toTimeString().slice(0, 5)}`;
    this.shop.chat.update((c) => ({ ...c, [this.id()]: [...(c[this.id()] ?? []), [0, 'Вы', when, t, 0, 0]] }));
    this.toast.show('Комментарий опубликован', 'Его увидят все сотрудники компании.');
  }
  protected like(k: number): void {
    this.shop.chat.update((c) => {
      const l = [...(c[this.id()] ?? [])], m = [...l[k]] as typeof l[0];
      m[6] = m[6] ? 0 : 1;
      m[5] = (m[5] || 0) + (m[6] ? 1 : -1);
      l[k] = m;
      return { ...c, [this.id()]: l };
    });
  }
  protected remove(k: number): void {
    this.shop.chat.update((c) => ({ ...c, [this.id()]: (c[this.id()] ?? []).filter((_, i) => i !== k) }));
    this.toast.show('Комментарий удален', 'Сообщение убрано из обсуждения.');
  }
  protected todo(t: string): void { this.toast.show('Готово', t); }
}
