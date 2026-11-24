import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { PollsState } from '../polls.state';

/**
 * Таблица опросов: название (под ним — «Анонимный»), время прохождения, даты, статус; справа — изменить, по образцу, удалить.
 */
@Component({
  selector: '[polls-table]',
  imports: [Icon, Tooltip],
  template: `
    <div class="tw">
      <table class="tbl rtbl mttbl">
        <thead>
          <tr>
            @for (c of cols; track c[0]) {
              <th [style.width.px]="c[2] || null" [class.num]="num.includes(c[0])">
                <span class="thh"
                  >{{ c[1]
                  }}<button class="sortb mts" [class.on]="s.sort().k === c[0]" title="Сортировать" [style.transform]="s.sort().k === c[0] && s.sort().dir < 0 ? 'scaleY(-1)' : null" (click)="s.sortBy(c[0])">
                    <svg viewBox="0 0 12 12" fill="none"><path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /><path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg></button
                ></span>
              </th>
            }
            <th class="tact"></th>
          </tr>
        </thead>
        <tbody>
          @for (p of s.pg.view(); track p) {
            @let live = s.live(p);
            <tr (click)="s.stats(p)">
              <td>
                <button class="plname" (click)="$event.stopPropagation(); s.stats(p)">{{ p.n }}</button>
                @if (p.anon) {
                  <small class="svsub">Анонимный</small>
                }
              </td>
              <td class="gr num">{{ s.durLabel(p) }}</td>
              <td class="gr">{{ p.start }}</td>
              <td class="gr">{{ p.end }}</td>
              <td><span class="bdg" [class.ok]="live === 'Действует'">{{ live }}</span></td>
              <td class="tact">
                <span class="acts">
                  <button type="button" class="actb" appTip="Редактировать" aria-label="Редактировать" (click)="$event.stopPropagation(); s.edit(p)"><app-icon name="edit" /></button>
                  <button type="button" class="actb" appTip="Создать по образцу" aria-label="Создать по образцу" (click)="$event.stopPropagation(); s.duplicate(p)"><app-icon name="copy" /></button>
                  <button type="button" class="actb dg" appTip="Удалить" aria-label="Удалить" (click)="$event.stopPropagation(); s.remove(p)"><app-icon name="trashSm" /></button>
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollsTable {
  protected readonly s = inject(PollsState);
  protected readonly num = ['dur'];
  protected readonly cols: [string, string, number?][] = [
    ['n', 'Наименование'],
    ['dur', 'Время прохождения', 160],
    ['start', 'Дата начала', 125],
    ['end', 'Дата окончания', 145],
    ['st', 'Статус', 140],
  ];
}
