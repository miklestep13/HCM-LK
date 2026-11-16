import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, output, signal } from '@angular/core';
import { shortFio } from '../../../data/org.data';
import { TASK_QUICK, TASK_STATUS_TONE } from '../../../data/tasks.data';
import { MyTask } from '../../../interface/task';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MytasksState } from '../mytasks.state';

/** Таблица заданий: у небольших заданий рядом с названием — «Открыть справа» (разделенный экран); справа — «⋯» с быстрыми действиями (закреплена при горизонтальной прокрутке); сортировка по столбцам, просроченный срок — красным. Клик по строке открывает задание. */
@Component({
  selector: '[mytasks-table]',
  imports: [Float, Icon, Tooltip],
  template: `
    <div class="tw">
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
          <th class="tact"></th>
        </tr>
      </thead>
      <tbody>
        @for (t of s.pg.view(); track t.id) {
          <tr [class.mtcur]="s.quick() === t.id" (click)="open.emit(t)">
            <td>
              <span class="mttl"
                ><b>{{ t.title }}</b>
                @if (quick[t.id]) {
                  <!-- небольшое задание: обработать в панели справа, не уходя со списка -->
                  <button class="actb mtqo" [class.on]="s.quick() === t.id" appTip="Открыть справа" aria-label="Открыть справа" (click)="$event.stopPropagation(); s.toggleQuick(t.id)"><app-icon name="splitView" /></button>
                }</span
              >
            </td>
            <td>{{ short(t.author) }}</td>
            <td class="gr">{{ t.created }}</td>
            <td [class]="s.over(t.due) ? 'dgt' : 'gr'">{{ t.due }}</td>
            <td>Иванов П. С.</td>
            <td><span class="bdg" [class]="tone[t.status]">{{ t.status }}</span></td>
            <td class="tact">
              <button class="actb dots" title="Действия" aria-label="Действия" [class.on]="menu()?.t === t" (click)="toggle(t, $event)"><app-icon name="dots" /></button>
            </td>
          </tr>
        } @empty {
          <tr><td colspan="7" class="empty sm">По этим условиям заданий нет</td></tr>
        }
      </tbody>
    </table>
    </div>
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m.a" (click)="$event.stopPropagation()">
        <button class="ami" (click)="act('done')"><app-icon name="check" />Выполнить</button>
        <button class="ami" (click)="act('hold')"><app-icon name="clock" />Отложить</button>
        <button class="ami" (click)="act('deleg')"><app-icon name="user" />Делегировать</button>
        <button class="ami" (click)="act('link')"><app-icon name="copy" />Скопировать ссылку</button>
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { id: 'mtList', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MytasksTable {
  protected readonly s = inject(MytasksState);
  readonly open = output<MyTask>();
  protected readonly short = shortFio;
  protected readonly tone = TASK_STATUS_TONE;
  protected readonly quick = TASK_QUICK;
  protected readonly cols: [string, string, number?][] = [
    ['th', 'Название'], ['au', 'Инициатор', 170], ['cr', 'Создано', 120], ['due', 'Срок выполнения', 160], ['ex', 'Исполнитель', 150], ['st', 'Статус', 150],
  ];
  private readonly toast = inject(ToastService);
  protected readonly menu = signal<{ t: MyTask; a: HTMLElement } | null>(null);

  protected toggle(t: MyTask, e: MouseEvent): void {
    e.stopPropagation();
    this.menu.set(this.menu()?.t === t ? null : { t, a: e.currentTarget as HTMLElement });
  }
  /** быстрые действия: открыть, выполнить, отложить, делегировать, скопировать ссылку */
  protected act(a: 'done' | 'hold' | 'deleg' | 'link'): void {
    const t = this.menu()!.t;
    this.menu.set(null);
    if (a === 'done') {
      this.s.setStatus(t.id, 'Выполнено');
      return this.toast.show('Задание выполнено', '«' + t.title + '» перенесено в завершенные.');
    }
    if (a === 'hold') {
      this.s.setStatus(t.id, 'Отложено');
      return this.toast.show('Задание отложено', '«' + t.title + '» — статус «Отложено».');
    }
    if (a === 'deleg') {
      this.s.setStatus(t.id, 'Делегирование');
      return this.toast.show('Задание делегировано', 'Выберите коллегу в карточке задания — пока статус «Делегирование».');
    }
    this.toast.show('Ссылка скопирована', 'Ссылку на задание можно отправить коллеге.');
  }
  protected sortBy(k: string): void {
    const c = this.s.sort();
    this.s.sort.set({ k, dir: c.k === k ? -c.dir : 1 });
  }
}
