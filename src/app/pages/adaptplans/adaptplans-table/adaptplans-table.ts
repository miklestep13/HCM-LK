import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Progress } from '../../../shared/ui/progress/progress';
import { AdaptplansState } from '../adaptplans.state';

/**
 * Таблица планов адаптации: сотрудник, тип, период, прогресс, состояние, дата создания.
 */
@Component({
  selector: '[adaptplans-table]',
  imports: [Progress],
  template: `
    <div class="tw">
      <table class="tbl rtbl mttbl">
        <thead>
          <tr>
            @for (c of cols; track c[0]) {
              <th [style.width.px]="c[2] || null" [class.num]="num.includes(c[0])">
                <span class="thh"
                  >{{ c[1]
                  }}<button
                    class="sortb mts"
                    [class.on]="s.sort().k === c[0]"
                    title="Сортировать"
                    [style.transform]="s.sort().k === c[0] && s.sort().dir < 0 ? 'scaleY(-1)' : null"
                    (click)="s.sortBy(c[0])"
                  >
                    <svg viewBox="0 0 12 12" fill="none">
                      <path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                    </svg></button
                ></span>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (p of s.pg.view(); track p.id) {
            <tr (click)="s.open(p)">
              <td>
                <span class="adpp">
                  <span class="av" [class]="'av av' + p.av"></span>
                  <span class="cnm"><b>{{ p.name }}</b><small>{{ p.pos }}</small></span>
                </span>
              </td>
              <td>{{ p.type }}</td>
              <td class="gr nw">{{ s.period(p) }}</td>
              <td>
                <app-progress
                  class="adpprog"
                  below
                  [value]="s.pct(p) + '%'"
                  [percent]="s.pct(p)"
                  [tone]="s.tone(p)"
                  [caption]="p.done + ' из ' + p.total"
                />
              </td>
              <td><span class="bdg" [class]="s.statusTone(p)">{{ s.statusLabel(p) }}</span></td>
              <td class="gr nw">{{ p.created }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptplansTable {
  protected readonly s = inject(AdaptplansState);
  protected readonly num: string[] = [];
  protected readonly cols: [string, string, number?][] = [
    ['name', 'Сотрудник'],
    ['type', 'Тип плана', 220],
    ['period', 'Период адаптации', 180],
    ['prog', 'Прогресс', 160],
    ['status', 'Состояние', 150],
    ['created', 'Дата создания', 130],
  ];
}
