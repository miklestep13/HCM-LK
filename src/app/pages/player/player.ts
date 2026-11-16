import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { PlayerMain } from './player-main/player-main';
import { PlayerSide } from './player-side/player-side';
import { PlayerState } from './player.state';

/**
 * «Обучение → Плеер курса»: слева — название, прогресс и содержание, справа — модуль.
 * Параметры адреса: crs — курс, again=1 — пройти повторно, prog — программа (ссылка «К программе курса»), lt — раздел «Обучения».
 */
@Component({
  selector: 'app-player',
  imports: [PageHead, PlayerSide, PlayerMain],
  template: `
    <app-page-head title="Курс" />
    @if (s.course()) {
      <div class="plgrid">
        <div player-side [prog]="prog()" [lt]="lt()"></div>
        <div player-main [lt]="lt()"></div>
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  providers: [PlayerState],
  host: { class: 'pg pg-player pg-pass' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Player {
  protected readonly s = inject(PlayerState);
  readonly crs = input('');
  readonly again = input('');
  readonly prog = input('');
  readonly lt = input('');
  constructor() {
    effect(() => {
      const id = this.crs(), again = this.again() === '1';
      untracked(() => id && this.s.open(id, again));
    });
  }
}
