import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Progress } from '../../../shared/ui/progress/progress';
import { PollstatsState } from '../pollstats.state';

/**
 * Сравнение процедур (волн) опроса — на вкладке «Участники» при «Все процедуры», если процедур больше одной:
 * процедура, назначение, окончание, назначено, завершили и доля прохождения; клик по строке — итоги этой процедуры.
 */
@Component({
  selector: '[pollstats-waves]',
  imports: [Progress],
  template: `
    <div class="ch"><h3>Процедуры опроса</h3><span class="pntc">{{ s.waves().length }}</span></div>
    <div class="cb" style="padding-top: 4px">
      <div class="tw">
        <table class="tbl rtbl pstbl">
          <thead>
            <tr>
              <th>Процедура</th>
              <th>Назначение</th>
              <th>Окончание</th>
              <th>Назначено</th>
              <th>Завершили</th>
              <th style="width: 220px">Прохождение</th>
            </tr>
          </thead>
          <tbody>
            @for (w of s.waves(); track w.id) {
              @let pc = w.total ? Math.round((w.done / w.total) * 100) : 0;
              <tr class="clk" (click)="s.wave.set(w.id)">
                <td><b>{{ w.n }}</b></td>
                <td class="gr">{{ w.date }}{{ w.time ? ' ' + w.time : '' }}</td>
                <td class="gr">{{ w.end ? w.end + (w.endTime ? ' ' + w.endTime : '') : '—' }}</td>
                <td>{{ w.total }}</td>
                <td>{{ w.done }}</td>
                <td><app-progress below [value]="pc + '%'" [percent]="pc" [tone]="pc === 100 ? 'ok' : ''" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  host: { class: 'c pswaves' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollstatsWaves {
  protected readonly s = inject(PollstatsState);
  protected readonly Math = Math;
}
