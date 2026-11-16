import { ChangeDetectionStrategy, Component, ViewEncapsulation, output } from '@angular/core';
import { CP_MOVED } from '../../../data/career-path.data';
import { Icon } from '../../../shared/ui/icon/icon';

/** Плашка после смены грейда: требования трека обновлены, кнопка «Понятно» убирает плашку */
@Component({
  selector: 'app-career-moved',
  imports: [Icon],
  template: `
    <div class="c cpmoved">
      <div class="cpmvi"><app-icon name="arrowUp" /></div>
      <div class="cpmvt">
        <b>{{ t.title }}</b>
        <small>{{ t.text }}</small>
      </div>
      <button type="button" class="btn raised" (click)="ok.emit()">{{ t.ok }}</button>
    </div>
  `,
  styleUrl: './career-moved.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-moved' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerMoved {
  readonly ok = output<void>();
  protected readonly t = CP_MOVED;
}
