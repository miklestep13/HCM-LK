import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Модальное окно прототипа (modalOpen): затемнение, заголовок с крестиком, тело.
 *   <app-modal title="Выбор компетенций" panel="ipcpm" [(open)]="isOpen">…</app-modal>
 * Кнопки внизу кладутся в тело: <div class="mdlf glmf">…</div>.
 */
@Component({
  selector: 'app-modal',
  template: `
    @if (open()) {
      <div class="mdlo" (click)="$event.target === $event.currentTarget && open.set(false)">
        <div class="mdl" [class]="panel()">
          <div class="mdlh">
            <b>{{ title() }}</b>
            <button class="drwx" title="Закрыть" (click)="open.set(false)">
              <svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </button>
          </div>
          <div class="mdlb"><ng-content /></div>
        </div>
      </div>
    }
  `,
  host: { '(document:keydown.escape)': 'open() && open.set(false)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly title = input.required<string>();
  readonly open = model(false);
  /** доп. классы окна */
  readonly panel = input('');
}
