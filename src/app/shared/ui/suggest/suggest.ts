import { DestroyRef, Directive, ElementRef, inject, input, output } from '@angular/core';

/**
 * Подсказки к полю ввода (sbox прототипа): при фокусе и вводе под полем — список вариантов, отфильтрованный по тексту.
 *   <input class="fin" [appSuggest]="places" (suggestPick)="place.set($event)" />
 * suggestAll — при фокусе показать весь список (например, время с шагом 15 минут).
 */
@Directive({
  selector: 'input[appSuggest]',
  host: { '(focus)': 'show(true)', '(input)': 'show(false)', '(keydown.escape)': 'close()', '(click)': 'reopen($event)' },
})
export class Suggest {
  readonly appSuggest = input.required<string[]>();
  readonly suggestAll = input(false);
  readonly suggestPick = output<string>();
  private readonly el: HTMLInputElement = inject(ElementRef).nativeElement;
  private pop: HTMLDivElement | null = null;
  /** клик вне поля закрывает список; клик по рамке поля, подписи или стрелке (они ставят фокус в поле) — нет */
  private readonly off = (e: Event) => {
    const box = this.el.closest('app-field, .fld') ?? this.el;
    if (!box.contains(e.target as Node)) this.close();
  };

  constructor() {
    document.addEventListener('click', this.off);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('click', this.off);
      this.close();
    });
  }

  protected show(focus: boolean): void {
    this.close();
    const s = focus && this.suggestAll() ? '' : this.el.value.toLowerCase();
    const hits = this.appSuggest().filter((o) => o.toLowerCase().includes(s));
    const p = document.createElement('div');
    p.className = 'fpop selpop';
    const list = document.createElement('div');
    list.className = 'folist';
    if (!hits.length) list.innerHTML = '<div class="foe">Ничего не найдено</div>';
    hits.forEach((o) => {
      const d = document.createElement('div');
      d.className = 'foi' + (o === this.el.value ? ' on' : '');
      d.textContent = o;
      d.onclick = (e) => {
        e.stopPropagation();
        this.el.value = o;
        this.close();
        this.suggestPick.emit(o);
        this.el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      list.appendChild(d);
    });
    p.appendChild(list);
    p.onclick = (e) => e.stopPropagation();
    document.body.appendChild(p);
    p.style.minWidth = this.el.offsetWidth + 'px';
    const r = this.el.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
    let left = r.left, top = r.bottom + 6;
    if (left + w > innerWidth - 12) left = r.right - w;
    if (top + h > innerHeight - 12) top = r.top - h - 6;
    p.style.left = Math.max(12, left) + 'px';
    p.style.top = Math.max(12, top) + 'px';
    this.pop = p;
    if (focus && this.suggestAll()) {
      const on = list.querySelector('.on') as HTMLElement | null;
      if (on) list.scrollTop = on.offsetTop - 40;
      this.el.select();
    }
  }
  /** повторный клик по полю в фокусе (список уже закрыт) — открыть снова */
  protected reopen(e: Event): void {
    e.stopPropagation();
    if (!this.pop) this.show(true);
  }
  close(): void {
    this.pop?.remove();
    this.pop = null;
  }
}
