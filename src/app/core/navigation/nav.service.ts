import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ME_MENU, NAV_TABS, NavItem } from './nav.config';
import { ANGULAR_PAGES } from './pages';

/**
 * Переходы между страницами по ключу прототипа (data-go).
 * Перенесенные страницы открываются роутером Angular, остальные — в старом прототипе (/legacy/:page).
 * История для стрелки «Назад» (как NAVH в прототипе): переход из меню ее сбрасывает, остальные — пополняют.
 */
@Injectable({ providedIn: 'root' })
export class NavService {
  private readonly router = inject(Router);
  /** ключ текущей страницы — для подсветки пункта меню */
  readonly page = signal<string>('');
  /** параметры адреса текущей страницы (для подсветки пункта меню с attrs) */
  readonly params = signal<Record<string, string>>({});
  /** страницы, с которых пришли (для «Назад») */
  readonly history = signal<string[]>([]);
  /** подсказка стрелки «Назад»: «Назад: Обзор» */
  readonly backTitle = computed(() => {
    const p = this.history().at(-1);
    return p ? 'Назад' + (menuTitle(p) ? ': ' + menuTitle(p) : '') : '';
  });
  private mode: 'menu' | 'back' | null = null;

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const next = this.keyOf(this.router.url),
        prev = this.page();
      if (next !== prev && prev) {
        if (this.mode === 'menu') this.history.set([]);
        else if (this.mode !== 'back') this.history.update((h) => [...h, prev]);
      }
      this.mode = null;
      this.page.set(next);
      this.params.set({ ...this.router.parseUrl(this.router.url).queryParams });
    });
  }

  go(page: string, attrs?: Record<string, string>): void {
    const route = ANGULAR_PAGES[page];
    if (route) {
      // параметры меню (например, раздел обучения lt=cat) — в адрес страницы
      this.router.navigateByUrl(this.router.createUrlTree([route], { queryParams: attrs && Object.keys(attrs).length ? attrs : undefined }));
      window.scrollTo(0, 0);
      return;
    }
    this.router.navigate(['/legacy', page], {
      queryParams: attrs && Object.keys(attrs).length ? attrs : undefined,
    });
  }

  /** переход из меню шапки: история «Назад» начинается заново */
  goMenu(page: string, attrs?: Record<string, string>): void {
    this.mode = 'menu';
    this.go(page, attrs);
  }

  /** «Назад» — на предыдущую страницу истории */
  back(): void {
    const h = this.history();
    if (!h.length) return;
    this.history.set(h.slice(0, -1));
    this.mode = 'back';
    this.go(h[h.length - 1]);
  }

  /** пункт меню открыт сейчас: та же страница и те же параметры (у «Обучения» — раздел lt; без параметра — первый пункт) */
  isOn(page: string | undefined, attrs?: Record<string, string>): boolean {
    if (!page || page !== this.page()) return false;
    if (!attrs) return true;
    const p = this.params();
    return Object.entries(attrs).every(([k, v]) => (p[k] ?? MENU_DEFAULTS[page]?.[k]) === v);
  }

  isAngular(page: string): boolean {
    return !!ANGULAR_PAGES[page];
  }

  private keyOf(url: string): string {
    const path = url.split('?')[0];
    const m = path.match(/^\/legacy\/([^/]+)/);
    if (m) return decodeURIComponent(m[1]);
    const exact = Object.keys(ANGULAR_PAGES).find((k) => ANGULAR_PAGES[k] === path);
    if (exact) return exact;
    // вложенные страницы раздела (/shop/cart → shop)
    const pre = Object.keys(ANGULAR_PAGES).filter((k) => path.startsWith(ANGULAR_PAGES[k] + '/')).sort((a, b) => ANGULAR_PAGES[b].length - ANGULAR_PAGES[a].length)[0];
    return pre ?? 'home';
  }
}

/** значения параметров по умолчанию, когда их нет в адресе */
const MENU_DEFAULTS: Record<string, Record<string, string>> = { dev: { lt: 'my' }, recruit: { rt: 'plan' }, learn: { et: 'cat' }, polls: { kind: 'poll' } };

/** название пункта меню по ключу страницы */
function menuTitle(page: string): string {
  const walk = (items: NavItem[] | undefined): string | undefined => {
    for (const i of items ?? []) {
      if (i.page === page && i.title) return i.title;
      const r = walk(i.children);
      if (r) return r;
    }
    return undefined;
  };
  for (const t of NAV_TABS) {
    const r = walk(t.items);
    if (r) return r;
  }
  return walk(ME_MENU) ?? '';
}
