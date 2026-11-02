import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, model, signal } from '@angular/core';
import { Float } from '../float/float';
import { Tooltip } from '../tooltip/tooltip';

/** Фильтр панели: название и элемент */
interface FtItem {
  name: string;
  el: HTMLElement;
}

/**
 * Шапка с фильтрами (паттерн прототипа .ftbar): строка 1 — поиск, кнопка фильтров, действия; строка 2 — панель фильтров.
 *   <app-filter-bar placeholder="Найти сотрудника" [(query)]="q">
 *     <button ftAction class="btn raised">Развернуть все</button>      — действие в строке поиска
 *     <app-select label="Подразделение" … />                           — фильтры (строка 2)
 *   </app-filter-bar>
 * Кнопка фильтров — из двух частей:
 *   воронка — список с чек-боксами всех фильтров формы: отмеченные показываются в панели (без счетчика на кнопке);
 *   стрелка — показать / скрыть панель фильтров.
 * Название фильтра — из подписи (label) или placeholder элемента; где их нет — атрибут ftName="Статус".
 * Ссылки и разделители панели (.lnk, .bkgap, [ftSkip]) фильтрами не считаются и видны всегда.
 * Стили — глобальные (src/styles/_controls.scss).
 */
@Component({
  selector: 'app-filter-bar',
  imports: [Tooltip, Float],
  template: `
    <div class="ftrow">
      <input
        class="tsearch"
        [class]="inputClass()"
        [placeholder]="placeholder()"
        autocomplete="off"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
      />
      <span class="ftbw ftsplit">
        <button class="ib3 ic ftb ftbl" aria-label="Выбрать фильтры" appTip="Выбрать фильтры" [class.on]="menu()" (click)="toggleMenu($event)">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M2.2 3.4h11.6L9.4 8.4v4.4L6.6 14V8.4L2.2 3.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="ib3 ic ftb ftbr" [attr.aria-label]="opened() ? 'Скрыть панель фильтров' : 'Показать панель фильтров'" [appTip]="opened() ? 'Скрыть фильтры' : 'Показать фильтры'" (click)="opened.set(!opened())">
          <svg class="ftchv" viewBox="0 0 16 16" fill="none">
            <path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        @if (menu(); as m) {
          <div class="fpop selpop ftmenu" [appFloat]="m" (click)="$event.stopPropagation()">
            <div class="ftmh">Фильтры</div>
            @for (f of items(); track f.name) {
              <label class="ckb ftmo"><input type="checkbox" [checked]="!off().has(f.name)" (change)="flip(f.name)" /><i></i><span>{{ f.name }}</span></label>
            } @empty {
              <div class="foe">У этой формы нет дополнительных фильтров</div>
            }
          </div>
        }
      </span>
      <ng-content select="[ftAction]" />
    </div>
    <div class="ftrow ftpanel">
      <ng-content />
    </div>
  `,
  host: { class: 'ftbar', '[class.open]': 'opened()', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  readonly placeholder = input('Поиск');
  /** доп. класс поля поиска (например, calq) */
  readonly inputClass = input('');
  readonly query = model('');
  /** открыта ли панель фильтров */
  readonly opened = model(false);

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  /** фильтры панели (находятся в разметке; при смене формы — например, карточки / таблица — список обновляется) */
  protected readonly items = signal<FtItem[]>([]);
  /** скрытые в панели фильтры (по названию) */
  protected readonly off = signal(new Set<string>());
  protected readonly menu = signal<HTMLElement | null>(null);

  constructor() {
    afterNextRender(() => {
      const panel = this.host.querySelector(':scope > .ftpanel') as HTMLElement;
      const scan = () => {
        const list: FtItem[] = [];
        [...panel.children].forEach((el, i) => {
          const e = el as HTMLElement;
          if (e.matches('.lnk, .bkgap, [ftSkip]')) return;
          const name =
            e.getAttribute('ftName') || e.getAttribute('label') || e.getAttribute('placeholder') || e.querySelector('[placeholder]')?.getAttribute('placeholder') || 'Фильтр ' + (i + 1);
          list.push({ name, el: e });
        });
        this.items.set(list);
        this.apply();
      };
      scan();
      const mo = new MutationObserver(() => scan());
      mo.observe(panel, { childList: true });
      this.destroy.onDestroy(() => mo.disconnect());
    });
  }
  private readonly destroy = inject(DestroyRef);

  protected toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.menu.set(this.menu() ? null : (e.currentTarget as HTMLElement));
  }
  /** отметить / снять фильтр; отмеченный — сразу виден в открытой панели */
  protected flip(name: string): void {
    const s = new Set(this.off());
    s.has(name) ? s.delete(name) : s.add(name);
    this.off.set(s);
    this.apply();
    if (!s.has(name)) this.opened.set(true);
  }
  private apply(): void {
    const off = this.off();
    this.items().forEach((f) => f.el.classList.toggle('ftoff', off.has(f.name)));
  }
}
