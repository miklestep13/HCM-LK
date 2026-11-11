import { Progress } from '../../../shared/ui/progress/progress';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { SURVEY_STATUS_TONE } from '../../../data/surveys.data';
import { SurveysState } from '../surveys.state';

/**
 * Таблица опросов: название (под ним — «Анонимный»), вопросов, «Пройти до» (просроченный срок — красным), прогресс, статус;
 * сортировка по столбцам. Колонки действий нет — строка открывается кликом.
 */
@Component({
  selector: '[surveys-table]',
  imports: [Progress, ],
  template: `
    <div class="tw">
      <table class="tbl rtbl mttbl">
        <thead>
          <tr>
            @for (c of cols(); track c[0]) {
              <th [style.width.px]="c[2] || null">
                <span class="thh"
                  >{{ c[1]
                  }}<button class="sortb mts" [class.on]="s.sort().k === c[0]" title="Сортировать" [style.transform]="s.sort().k === c[0] && s.sort().dir < 0 ? 'scaleY(-1)' : null" (click)="s.sortBy(c[0])">
                    <svg viewBox="0 0 12 12" fill="none"><path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /><path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg></button
                ></span>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (x of s.pg.view(); track x.id) {
            @let d = s.endText(x);
            @let p = s.progress(x);
            <tr (click)="s.open(x)">
              <td>
                <b class="mttl">{{ x.title }}</b>
                @if (x.anon) {
                  <small class="svsub">Анонимный</small>
                }
              </td>
              <td class="gr">{{ x.questions }}</td>
              <td [class]="d.over ? 'dgt' : 'gr'">{{ x.end || 'Без срока' }}</td>
              @if (done()) {
                <td class="gr">{{ x.doneAt || '—' }}</td>
              }
              <td>
                @if (p) {
                  <app-progress class="svprog" below [value]="p.value" [percent]="p.pct" [tone]="p.tone" [caption]="p.caption" />
                } @else {
                  <span class="gr">—</span>
                }
              </td>
              <td><span class="bdg" [class]="tone[x.status]">{{ x.status }}</span></td>
            </tr>
          } @empty {
            <tr><td [attr.colspan]="cols().length" class="empty sm">По этим условиям опросов нет</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveysTable {
  protected readonly s = inject(SurveysState);
  protected readonly tone = SURVEY_STATUS_TONE;
  /** вкладка «Пройденные» — с колонкой «Дата прохождения» */
  protected readonly done = computed(() => this.s.tab() === 'done');
  protected readonly cols = computed((): [string, string, number?][] => [
    ['title', 'Название'],
    ['q', 'Вопросов', 110],
    ['end', 'Пройти до', 150],
    ...(this.done() ? [['done', 'Дата прохождения', 170] as [string, string, number]] : []),
    ['prog', 'Прогресс', 190],
    ['status', 'Статус', 140],
  ]);
}
