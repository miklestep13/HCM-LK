import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

/** Контейнер уведомлений — один на приложение (в app.html) */
@Component({
  selector: 'app-toasts',
  template: `<div class="toasts">
    @for (t of svc.items(); track t.id) {
      <div class="toast">
        <b>{{ t.title }}</b>
        @if (t.text) {
          <small>{{ t.text }}</small>
        }
      </div>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toasts {
  protected readonly svc = inject(ToastService);
}
