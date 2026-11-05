import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DevPanelService } from './dev-panel.service';
import { Seg } from '../../../shared/ui/seg/seg';

/**
 * Dev-панель (кнопка «Демо» внизу справа): переключатели демо-состояний текущей страницы —
 * этапы процесса, роли, сценарии. Не часть продукта, только для показа прототипа. Параметр адреса noDemo скрывает кнопку (для скриншотов).
 */
@Component({
  selector: 'app-dev-panel',
  imports: [Seg],
  template: ` @if (svc.controls().length && !hide) {
    <div class="devp" [class.open]="open()">
      @if (open()) {
        <div class="devp-body">
          <div class="devp-h">
            <b>Демо-состояния</b
            ><button class="devp-x" (click)="open.set(false)" aria-label="Свернуть">×</button>
          </div>
          @for (c of svc.controls(); track c.id) {
            <div class="devp-row">
              <span class="devp-l">{{ c.label }}</span>
              <app-seg
                [options]="c.options"
                [value]="c.value()"
                (valueChange)="c.value.set($event)"
                wide
              />
            </div>
          }
        </div>
      }
      <button class="devp-btn" (click)="open.set(!open())">Демо</button>
    </div>
  }`,
  styleUrl: './dev-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevPanel {
  protected readonly svc = inject(DevPanelService);
  protected readonly open = signal(false);
  /** для скриншотов: в адресе есть noDemo (например, #/absences?noDemo=1) — кнопку «Демо» не показываем */
  protected readonly hide = /[?&]noDemo\b/.test(location.href);
}
