import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, output } from '@angular/core';
import { shortFio } from '../../../data/org.data';
import { TASK_STATUS_TONE } from '../../../data/tasks.data';
import { MyTask } from '../../../interface/task';
import { MytasksState } from '../mytasks.state';

/** Таблица заданий: сортировка по столбцам, просроченный срок — красным. Клик по строке открывает задание. */
@Component({
  selector: '[mytasks-table]',
  template: `
    <table class="tbl rtbl mttbl">
      <thead>
        <tr>
          @for (c of cols; track c[0]) {
            <th [style.width.px]="c[2] || null">
              <span class="thh"
                >{{ c[1]
                }}<button class="sortb mts" [class.on]="s.sort().k === c[0]" title="Сортировать" [style.transform]="s.sort().k === c[0] && s.sort().dir < 0 ? 'scaleY(-1)' : null" (click)="sortBy(c[0])">
                  <svg viewBox="0 0 12 12" fill="none"><path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /><path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg></button
              ></span>
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @for (t of s.rows(); track t.id) {
          <tr (click)="open.emit(t)">
            <td><b>{{ t.title }}</b></td>
            <td>{{ short(t.author) }}</td>
            <td class="gr">{{ t.created }}</td>
            <td [class]="s.over(t.due) ? 'dgt' : 'gr'">{{ t.due }}</td>
            <td>Иванов П. С.</td>
            <td><span class="bdg" [class]="tone[t.status]">{{ t.status }}</span></td>
          </tr>
        } @empty {
          <tr><td colspan="6" class="empty sm">По этим условиям заданий нет</td></tr>
        }
      </tbody>
    </table>
  `,
  encapsulation: ViewEncapsulation.None,
  host: { id: 'mtList' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MytasksTable {
  protected readonly s = inject(MytasksState);
  readonly open = output<MyTask>();
  protected readonly short = shortFio;
  protected readonly tone = TASK_STATUS_TONE;
  protected readonly cols: [string, string, number?][] = [
    ['th', 'Название'], ['au', 'Инициатор', 170], ['cr', 'Создано', 120], ['due', 'Срок выполнения', 160], ['ex', 'Исполнитель', 150], ['st', 'Статус', 150],
  ];
  protected sortBy(k: string): void {
    const c = this.s.sort();
    this.s.sort.set({ k, dir: c.k === k ? -c.dir : 1 });
  }
}
