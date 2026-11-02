import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GROWTH_360_SOURCES } from '../../../data/growth.data';
import { A360Radar } from '../a360-radar/a360-radar';

/**
 * «Сравнение оценок»: над радаром — кнопки-переключатели источников (самооценка, руководитель, коллеги, подчиненные),
 * радар по компетенциям. Итоги — отдельный блок (a360-conc).
 */
@Component({
  selector: '[a360-360]',
  imports: [A360Radar],
  template: `
    <div class="ch">
      <h3>Сравнение оценок</h3>
    </div>
    <div class="cb">
      <div class="gr360">
        <div class="gr360r">
          <div class="grleg">
            @for (s of sources; track s[0]; let k = $index) {
              <button class="grl" [class.on]="on().has(k)" (click)="toggle(k)"><i [style.background]="s[1]"></i>{{ s[0] }}</button>
            }
          </div>
          <div a360-radar class="grwrap" [on]="on()"></div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360Block {
  protected readonly sources = GROWTH_360_SOURCES;
  /** включенные источники (хотя бы один) */
  protected readonly on = signal(new Set([0, 1, 2, 3]));
  protected toggle(k: number): void {
    const s = new Set(this.on());
    if (s.has(k)) {
      if (s.size === 1) return;
      s.delete(k);
    } else s.add(k);
    this.on.set(s);
  }
}
