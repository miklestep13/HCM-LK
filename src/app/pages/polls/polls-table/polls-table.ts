import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLL_STATUS_TONE } from '../../../data/polls.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { PollsState } from '../polls.state';

/**
 * Таблица опросов: название (под ним — «Анонимный»), участники — число, вопросов, даты, прогресс, статус; справа без заголовка — изменить, дублировать, в архив.
 */
@Component({
  selector: '[polls-table]',
  imports: [Icon, Progress],
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
            @let arch = p.st === 'arch';
            <tr (click)="s.stats(p)">
              <td>
                <button class="plname" (click)="$event.stopPropagation(); s.stats(p)">{{ p.n }}</button>
                @if (p.anon) {
                  <small class="svsub">Анонимный</small>
                }
              </td>
              <td class="num">{{ p.total }}</td>
              <td class="gr num">{{ s.questions(p) }}</td>
              <td class="gr">{{ p.start }}</td>
              <td class="gr">{{ p.end }}</td>
              <td><app-progress class="svprog" below [value]="s.pct(p) + '%'" [percent]="s.pct(p)" [tone]="s.pct(p) === 100 ? 'ok' : ''" [caption]="p.done + ' из ' + p.total" /></td>
              <td><span class="bdg" [class]="tone[p.sts]">{{ p.sts }}</span></td>
              <td class="tact">
                <span class="acts">
                  <button class="actb" title="Редактировать" (click)="$event.stopPropagation(); s.edit(p)"><app-icon name="edit" /></button>
                  <button class="actb" title="Дублировать" (click)="$event.stopPropagation(); s.duplicate(p)"><app-icon name="copy" /></button>
                  <button class="actb" [title]="arch ? 'Вернуть из архива' : 'Архивировать'" (click)="$event.stopPropagation(); s.archive(p)"><app-icon name="archive" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="empty sm">Опросов нет</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollsTable {
  protected readonly s = inject(PollsState);
  protected readonly tone = POLL_STATUS_TONE;
  /** суммовые колонки — по правому краю */
  protected readonly num = ['ppl', 'q'];
  protected readonly cols: [string, string, number?][] = [
    ['n', 'Наименование'], ['ppl', 'Участники', 130], ['q', 'Вопросов', 100], ['start', 'Дата начала', 125], ['end', 'Дата окончания', 145], ['prog', 'Прогресс', 160], ['st', 'Статус', 140],
  ];
}
