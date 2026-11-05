import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { isLink, linkText } from '../../core/demo/events-store.service';
import { EVENT_STATUS_TONE } from '../../data/events.data';
import { LearnAction } from '../../interface/learn';
import { Clamp } from '../../shared/ui/clamp/clamp';
import { Icon } from '../../shared/ui/icon/icon';
import { LearnActionButton } from '../learn-action/learn-action';

/**
 * Шапка события — мероприятие (с обложкой) и просмотр встречи (без обложки). Как шапка курса: название, статус,
 * время с — по и длительность, место (онлайн — ссылка на встречу), описание («Показать еще»), число приглашенных, кнопка участия.
 *   <div event-head [title] [status] [when] [dur] [place] [desc] [invited] [img]="cover" [action]="a" (act)="run($event)"></div>
 * img — обложка (нет — шапка в одну колонку); action — кнопка участия (нет — без кнопки, например у админа);
 * свои действия внизу шапки — <div evhAct>…</div> (ответ на встречу).
 */
@Component({
  selector: '[event-head]',
  imports: [Icon, Clamp, LearnActionButton],
  template: `
    <div class="cb crshd" [class.nocov]="!img()">
      @if (img()) {
        <div class="crsimg"><img [src]="img()" alt="" /></div>
      }
      <div class="crsinfo">
        <h2>{{ title() }}</h2>
        @if (status()) {
          <div class="gltags crstags">
            <span class="bdg" [class]="tone()">{{ status() }}</span>
          </div>
        }
        <div class="cmeta2 crsm">
          <span><app-icon name="calendar" />{{ when() }}</span>
          @if (dur()) {
            <span><app-icon name="clock" />{{ dur() }}</span>
          }
          <i class="brk"></i>
          <span>
            @if (link()) {
              <app-icon name="link" /><a class="evlnk" [href]="place()" target="_blank" rel="noopener">{{ ltext(place()) }}</a>
            } @else {
              <app-icon name="pin" />{{ place() || 'Онлайн' }}
            }
          </span>
        </div>
        @if (desc()) {
          <div class="abt crsab" [innerHTML]="desc()" [appClamp]="desc()"></div>
        }
        <div class="crsbtn">
          @if (action()) {
            <div class="lfact" learn-action [action]="action()" (act)="act.emit($event)"></div>
          }
          <!-- свои действия внизу шапки (например, ответ на встречу «Принять / Под вопросом / Отклонить») -->
          <ng-content select="[evhAct]" />
          @if (invited() != null) {
            <div class="npf crsf">
              <span class="npb st" title="Приглашено"><app-icon name="userXs2" /><span>{{ invited() }}</span></span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './event-head.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c crsv mb w-evhead' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventHead {
  readonly title = input.required<string>();
  /** статус события: Запланирована / Проведена / Отменена */
  readonly status = input('');
  /** «30.09.2026 14:00 – 15:30» */
  readonly when = input('');
  readonly dur = input('');
  /** адрес или ссылка на онлайн-встречу */
  readonly place = input('');
  /** описание (HTML) */
  readonly desc = input('');
  /** приглашено; не задано — счетчика нет (просмотр встречи) */
  readonly invited = input<number | null>(null);
  readonly img = input('');
  readonly action = input<LearnAction | null>(null);
  readonly act = output<string>();
  protected readonly tone = computed(() => EVENT_STATUS_TONE[this.status()] || '');
  protected readonly link = computed(() => isLink(this.place()));
  protected readonly ltext = linkText;
}

/** «30.09.2026 14:00 – 15:30»: окончание в другой день — с датой; весь день — «30.09.2026 · весь день» */
export const eventWhen = (f: { date: string; time: string; endDate: string; endTime: string; allDay?: boolean }, fallback = '') => {
  if (f.allDay) return f.date + (f.endDate && f.endDate !== f.date ? ' – ' + f.endDate : '') + ' · весь день';
  if (!f.endTime) return fallback || f.date + ' ' + f.time;
  return f.date + ' ' + f.time + ' – ' + (f.endDate && f.endDate !== f.date ? f.endDate + ' ' : '') + f.endTime;
};
