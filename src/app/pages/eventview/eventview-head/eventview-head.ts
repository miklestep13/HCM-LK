import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LearnStore } from '../../../core/demo/learn-store.service';
import { isLink, linkText } from '../../../core/demo/events-store.service';
import { EVENT_STATUS_TONE } from '../../../data/events.data';
import { LEARN_EVENT_INFO } from '../../../data/learn-course.data';
import { Clamp } from '../../../shared/ui/clamp/clamp';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { LearnActionButton } from '../../../widgets/learn-action/learn-action';
import { EventviewState } from '../eventview.state';

/**
 * Шапка мероприятия — как у страницы курса: обложка, название, статус участия («Идет сейчас»), время с — по и длительность, место
 * (онлайн — ссылка на встречу), описание («Показать еще»), число приглашенных и кнопка участия (у админа ее нет).
 */
@Component({
  selector: '[eventview-head]',
  imports: [Icon, Clamp, LearnActionButton],
  template: `
    @let c = s.card()!;
    @let f = s.f()!;
    <div class="cb crshd">
      <div class="crsimg"><img [src]="c.img" alt="" /></div>
      <div class="crsinfo">
        <h2>{{ c.title }}</h2>
        @if (evst()) {
          <div class="gltags crstags">
            <span class="bdg" [class]="evTone()">{{ evst() }}</span>
          </div>
        }
        <div class="cmeta2 crsm">
          <span><app-icon name="calendar" />{{ when() }}</span><span><app-icon name="clock" />{{ c.dur }}</span><i class="brk"></i>
          <span>
            @if (link()) {
              <app-icon name="link" /><a class="evlnk" [href]="f.place" target="_blank" rel="noopener">{{ ltext(f.place) }}</a>
            } @else {
              <app-icon name="pin" />{{ f.place || 'Онлайн' }}
            }
          </span>
        </div>
        @if (f.desc) {
          <div class="abt crsab" [innerHTML]="f.desc" [appClamp]="f.desc"></div>
        }
        <div class="crsbtn">
          @if (!s.adm()) {
            <div class="lfact" learn-action [action]="action()" (act)="learn.run('ev', c.id, $event)"></div>
          }
          <div class="npf crsf">
            <span class="npb st" title="Приглашено"><app-icon name="userXs2" /><span>{{ invited() }}</span></span>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'c crsv mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventviewHead {
  protected readonly s = inject(EventviewState);
  protected readonly learn = inject(LearnStore);
  protected readonly toast = inject(ToastService);
  protected readonly info = computed(() => LEARN_EVENT_INFO[this.s.id()]);
  protected readonly st = computed(() => this.learn.eventStatus(this.s.id()));
  /** бейдж — статус мероприятия из формы (Запланирована / Проведена / Отменена); st — участие сотрудника, для кнопки */
  protected readonly evst = computed(() => this.s.f()?.status || '');
  protected readonly evTone = computed(() => EVENT_STATUS_TONE[this.evst()] || '');
  /** с — по: «30.09.2026 14:00 – 15:30», другой день окончания — с датой; весь день — «30.09.2026 · весь день» */
  protected readonly when = computed(() => {
    const f = this.s.f()!;
    if (f.allDay) return f.date + (f.endDate && f.endDate !== f.date ? ' – ' + f.endDate : '') + ' · весь день';
    if (!f.endTime) return this.s.card()?.date || f.date + ' ' + f.time;
    return f.date + ' ' + f.time + ' – ' + (f.endDate && f.endDate !== f.date ? f.endDate + ' ' : '') + f.endTime;
  });
  protected readonly ltext = linkText;
  protected readonly link = computed(() => isLink(this.s.f()?.place || ''));
  protected readonly action = computed(() => this.learn.eventAction(this.st(), this.s.id(), !!this.s.card()?.live));
  /** приглашено: группы — всеми сотрудниками; у мероприятий из обучения — как на карточке */
  protected readonly invited = computed(() => {
    const p = this.s.f()?.people || [], i = this.info();
    return i && p.length <= 2 ? i.l * 6 + 40 : p.reduce((a, m) => a + (m.cnt || 1), 0);
  });
}
