import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

/** Модальное окно подтверждения (разметка modalOpen прототипа). Подключено один раз в app.html. */
@Component({
  selector: 'app-confirm',
  template: `
    @if (c.current(); as o) {
      <div class="mdlo" (click)="$event.target === $event.currentTarget ? c.close(false) : null">
        <div class="mdl">
          <div class="mdlh">
            <b>{{ o.title }}</b>
            <button class="drwx" title="Закрыть" (click)="c.close(false)">
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <div class="mdlb">
            <p class="mdlp">
              @for (part of parts(); track $index; let odd = $odd) {
                @if (odd) {
                  <b>{{ part }}</b>
                } @else {
                  {{ part }}
                }
              }
            </p>
            <div class="mdlf glmf">
              <button class="btn raised" (click)="c.close(false)">
                {{ o.cancel || 'Отменить' }}
              </button>
              <button
                class="btn"
                [class.dng]="o.danger"
                [class.pri]="!o.danger"
                (click)="c.close(true)"
              >
                {{ o.ok || 'Подтвердить' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  host: { '(document:keydown.escape)': 'c.close(false)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Confirm {
  protected readonly c = inject(ConfirmService);
  protected readonly parts = computed(() => (this.c.current()?.text ?? '').split('**'));
}
