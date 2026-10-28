import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Tooltip } from '../tooltip/tooltip';

/** Вид списка */
export type ViewMode = 'cards' | 'table';

/**
 * Переключатель вида списка «Карточки / Таблица» (.vsw) — в строке поиска шапки фильтров.
 *   <app-view-switch ftAction [(value)]="view" />
 */
@Component({
  selector: 'app-view-switch',
  imports: [Tooltip],
  template: `
    @for (o of options(); track o) {
      <button type="button" [class.on]="value() === o" [attr.aria-pressed]="value() === o" [attr.aria-label]="names[o]" [appTip]="names[o]" (click)="value.set(o)">
        @if (o === 'cards') {
          <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.4" /><rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.4" /><rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.4" /><rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.4" /></svg>
        } @else {
          <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2.4" width="12" height="11.2" rx="1.6" stroke="currentColor" stroke-width="1.4" /><path d="M2 6.2h12M2 9.8h12M6 6.2v7.4" stroke="currentColor" stroke-width="1.4" /></svg>
        }
      </button>
    }
  `,
  host: { class: 'vsw', role: 'group', 'aria-label': 'Вид списка' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSwitch {
  readonly options = input<ViewMode[]>(['cards', 'table']);
  readonly value = model<ViewMode>('table');
  protected readonly names: Record<ViewMode, string> = { cards: 'Карточки', table: 'Таблица' };
}
