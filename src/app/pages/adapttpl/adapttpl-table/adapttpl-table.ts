import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdapttplState } from '../adapttpl.state';

/**
 * Таблица шаблонов: наименование, ответственный, даты создания и изменения.
 */
@Component({
  selector: '[adapttpl-table]',
  template: `
    <div class="tw">
      <table class="tbl rtbl mttbl">
        <thead>
          <tr>
            @for (c of cols; track c[0]) {
              <th [style.width.px]="c[2] || null">
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
            <tr>
              <td>
                <b class="tplname">{{ p.name }}</b>
              </td>
              <td>
                <span class="adpp">
                  <span class="av" [class]="'av av' + p.ownerAv"></span>
                  <span class="cnm"><b>{{ p.ownerName }}</b><small>{{ p.ownerPos }}</small></span>
                </span>
              </td>
              <td class="gr nw">{{ p.created }}</td>
              <td class="gr nw">{{ p.updated }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdapttplTable {
  protected readonly s = inject(AdapttplState);
  protected readonly cols: [string, string, number?][] = [
    ['name', 'Наименование'],
    ['owner', 'Ответственный', 280],
    ['created', 'Дата создания', 140],
    ['updated', 'Дата изменения', 140],
  ];
}
