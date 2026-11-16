import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, output } from '@angular/core';
import { shortFio } from '../../../data/org.data';
import { TASK_AUTHOR_PHOTO, TASK_QUICK, TASK_STATUS_TONE } from '../../../data/tasks.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { MyTask } from '../../../interface/task';
import { MytasksState } from '../mytasks.state';

/** Карточки заданий (сетка, как в «Моем обучении»): статус и просрочка, название, срок, инициатор. Порядок — как в таблице. */
@Component({
  selector: '[mytasks-cards]',
  imports: [Icon, Tooltip],
  template: `
    @for (t of s.pg.view(); track t.id) {
      @let d = s.dueText(t.due);
      <div class="vcard mtvc" [class.mtcur]="s.quick() === t.id" tabindex="0" role="link" [attr.aria-label]="t.title" (click)="open.emit(t)" (keydown.enter)="open.emit(t)">
        <div class="cbody">
          <div class="vb">
            <div class="mtbd">
              <span class="bdg" [class]="tone[t.status]">{{ t.status }}</span>
              @if (d.over) {
                <span class="bdg dg">Просрочено</span>
              }
            </div>
            <div class="vt mttl" [title]="t.title">
              {{ t.title }}
              @if (quick[t.id]) {
                <button class="actb mtqo" [class.on]="s.quick() === t.id" appTip="Открыть справа" aria-label="Открыть справа" (click)="$event.stopPropagation(); s.toggleQuick(t.id)"><app-icon name="splitView" /></button>
              }
            </div>
            <div class="vmeta row">
              <span [class.od]="d.over"
                ><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3.4" width="12" height="10.4" rx="2" stroke="currentColor" stroke-width="1.4" /><path d="M5.2 1.8v2.6M10.8 1.8v2.6M2 6.6h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>{{ d.t }}</span
              >
            </div>
          </div>
        </div>
        <div class="mtvf">
          <img class="av" [src]="photo[t.author]" alt="" /><span
            ><b>{{ short(t.author) }}</b><small>Создал{{ fem(t.author) ? 'а' : '' }} {{ t.created }}</small></span
          >
        </div>
      </div>
    } @empty {
      <div class="c mtcempty"><div class="empty"><b>По этим условиям заданий нет</b><small>Измените поиск или условия фильтров</small></div></div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MytasksCards {
  protected readonly s = inject(MytasksState);
  readonly open = output<MyTask>();
  protected readonly short = shortFio;
  protected readonly tone = TASK_STATUS_TONE;
  protected readonly quick = TASK_QUICK;
  protected readonly photo = TASK_AUTHOR_PHOTO;
  protected fem = (n: string) => /(вна|чна)\s*$/.test(n);
}
