import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ORG, orgUnit } from '../../../data/org.data';
import { OrgState } from '../org.state';

/**
 * Подсказки поиска по схеме: список людей под полем поиска шапки (стрелки, Enter, Esc).
 * Подключается к полю шапки страницы: (focusin)="search.onFocus($event)" (keydown)="search.key($event)" [query]="search.q()".
 */
import { avCls } from '../../../data/people.data';
@Component({
  selector: 'app-org-search',
  template: `
    @if (sugOpen() && q().trim()) {
      <div
        class="fpop selpop ogsug"
        [style.left.px]="pos().left"
        [style.top.px]="pos().top"
        [style.width.px]="pos().width"
        (click)="$event.stopPropagation()"
      >
        @for (h of hits(); track h.id; let i = $index) {
          <button class="ogsi" [class.on]="i === cur()" (click)="pick(h.id)">
            @if (h.photo) {
              <img class="av" [src]="h.photo" alt="" />
            } @else {
              <span class="av" [class]="avCls(h.name, h.av!)"></span>
            }
            <span class="cnm"
              ><b>{{ h.name }}</b
              ><small>{{ h.role }} · {{ unit(h.id) }}</small></span
            >
          </button>
        } @empty {
          <div class="foe">Никого не нашли. Проверьте написание фамилии.</div>
        }
      </div>
    }
  `,
  styleUrl: './org-search.scss',
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:contents', '(document:click)': 'sugOpen.set(false)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgSearch {
  protected readonly avCls = avCls;
  protected readonly s = inject(OrgState);
  readonly q = signal('');
  protected readonly cur = signal(0);
  protected readonly sugOpen = signal(false);
  protected readonly pos = signal({ left: 0, top: 0, width: 0 });
  protected readonly unit = orgUnit;
  protected readonly hits = computed(() => {
    const s = this.q().trim().toLowerCase();
    return s
      ? ORG.filter((r) =>
          (r.name + ' ' + r.role + ' ' + orgUnit(r.id)).toLowerCase().includes(s),
        ).slice(0, 7)
      : [];
  });

  onFocus(e: FocusEvent): void {
    const t = e.target as HTMLElement;
    if (!t.classList.contains('tsearch')) return;
    const r = t.getBoundingClientRect();
    this.pos.set({ left: r.left, top: r.bottom + 6, width: r.width });
    this.cur.set(0);
    this.sugOpen.set(true);
  }

  key(e: KeyboardEvent): void {
    if (!(e.target as HTMLElement).classList.contains('tsearch')) return;
    this.sugOpen.set(true);
    this.cur.set(Math.min(this.cur(), Math.max(0, this.hits().length - 1)));
    const n = this.hits().length;
    if (!n) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.cur.set((this.cur() + (e.key === 'ArrowDown' ? 1 : n - 1)) % n);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.pick(this.hits()[this.cur()].id);
    }
    if (e.key === 'Escape') this.sugOpen.set(false);
  }

  protected pick(id: string): void {
    this.sugOpen.set(false);
    this.q.set('');
    this.s.find(id);
  }
}
