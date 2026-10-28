import { DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Выравнивание по таблице товаров (shSumAlign прототипа):
 * — итог корзины (.shfoot): правый край — по колонке «Сумма», левый — по колонке «Количество» (--sumw, --sumr);
 * — реквизиты заказа (.shodi): «Статус заказа» на одной вертикали с колонкой «Статус» (--stw).
 * Пересчитывается при любом изменении размеров таблицы (картинки, шрифт, ширина окна). Вызывать в конструкторе страницы.
 */
export function useShopAlign(): void {
  const host: HTMLElement = inject(ElementRef).nativeElement;
  const ro = new ResizeObserver(() => align(host));
  const mo = new MutationObserver(() => watch());
  let t: Element | null = null;
  const watch = () => {
    const nt = host.querySelector('.shct');
    if (nt !== t) {
      if (t) ro.unobserve(t);
      t = nt;
      if (t) ro.observe(t);
    }
    align(host);
  };
  afterNextRender(() => {
    mo.observe(host, { childList: true, subtree: true });
    watch();
  });
  inject(DestroyRef).onDestroy(() => {
    ro.disconnect();
    mo.disconnect();
  });
}

function align(box: HTMLElement): void {
  const od = box.querySelector<HTMLElement>('.shodi'),
    sth = box.querySelector('.shct thead th:last-child');
  if (od && sth && sth.textContent?.trim() === 'Статус') {
    const x = sth.getBoundingClientRect().left + parseFloat(getComputedStyle(sth).paddingLeft),
      r = od.getBoundingClientRect().right;
    od.style.setProperty('--stw', Math.max(80, Math.round(r - x)) + 'px');
    const it = od.querySelector('.shost');
    if (it) {
      const d = it.getBoundingClientRect().left - x;
      if (Math.abs(d) > 0.5) od.style.setProperty('--stw', Math.max(80, Math.round(r - x + d)) + 'px');
    }
  }
  const t = box.querySelector('.shct'),
    f = box.querySelector<HTMLElement>('.shfoot'),
    v = t?.querySelector('tbody .shsum'),
    q = t?.querySelector('thead th.shq');
  if (!f) return;
  if (!t || !v || !q) {
    f.style.removeProperty('--sumw');
    f.style.removeProperty('--sumr');
    return;
  }
  const tr = t.getBoundingClientRect().right,
    vr = v.getBoundingClientRect().right,
    ql = q.getBoundingClientRect().left + parseFloat(getComputedStyle(q).paddingLeft);
  const r = Math.max(0, Math.round(tr - vr));
  f.style.setProperty('--sumr', r + 'px');
  f.style.setProperty('--sumw', Math.max(240, Math.round(vr - ql)) + r + 'px');
}
