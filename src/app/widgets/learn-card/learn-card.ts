import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input } from '@angular/core';
import { LEARN_TONE, LearnStore } from '../../core/demo/learn-store.service';
import { EventsStore, isLink, linkText } from '../../core/demo/events-store.service';
import { NavService } from '../../core/navigation/nav.service';
import { EVENT_STATUS_TONE } from '../../data/events.data';
import { LearnCard as LearnCardData, LearnKind } from '../../interface/learn';
import { Icon } from '../../shared/ui/icon/icon';
import { Progress } from '../../shared/ui/progress/progress';
import { LearnActionButton } from '../learn-action/learn-action';

/**
 * Карточка обучения (курс, программа, мероприятие): фото со статусом, название, срок и длительность (у мероприятия — место),
 * прогресс, кнопка действия. «Мое обучение» и страница «Мероприятия».
 *   <div learn-card [card]="c" kind="ev" lt="my"></div>
 * Внизу можно положить свои кнопки (например, «Редактировать» / «Удалить» у админа): <div learn-card …><div lcAdmin>…</div></div>
 */
@Component({
  selector: '[learn-card]',
  imports: [Icon, Progress, LearnActionButton],
  template: `
    @let c = card();
    @let st = badge();
    <div class="cbody" (click)="open()">
      <div class="vimg">
        <img [src]="c.img" alt="" />
        <span class="bdgs">
          @if (st) {
            <span class="bdg" [class]="tone()">{{ st }}</span>
          }
          @if (c.live && !evView()) {
            <span class="bdg dg live">Идет сейчас</span>
          }
        </span>
      </div>
      <div class="vb">
        <div class="vt">{{ c.title }}</div>
        <div class="vmeta row">
          @if (c.date) {
            <span [class.od]="kind() !== 'ev' && st === 'Просрочен'"><app-icon name="calendar" />{{ c.date }}</span>
          }
          <span><app-icon name="clock" />{{ c.dur }}</span>
          @if (c.count) {
            <span><app-icon name="course" />{{ c.count }}</span>
          }
        </div>
        @if (kind() === 'ev') {
          <div class="vmeta row">
            <span>
              <!-- место проведения: адрес — иконка местоположения; онлайн на странице «Мероприятия» — ссылка на встречу; серым 12px -->
              @if (meet(); as u) {
                <app-icon name="link" /><a class="evlnk" [href]="u" target="_blank" rel="noopener" (click)="$event.stopPropagation()">{{ ltext(u) }}</a>
              } @else {
                <app-icon name="pin" />{{ c.place || 'Онлайн' }}
              }
            </span>
          </div>
        }
        @if (progress(); as p) {
          <app-progress class="vpr" label="Выполнено" [value]="p.value + '%'" [percent]="p.value" [tone]="p.tone" [caption]="p.sub || ''" />
        }
      </div>
    </div>
    @if (!noAction()) {
      <div class="vact" learn-action [action]="action()" (act)="store.run(kind(), c.id, $event, lt())"></div>
    }
    <ng-content select="[lcAdmin]" />
  `,
  styleUrl: './learn-card.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'vcard' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnCard {
  protected readonly store = inject(LearnStore);
  private readonly nav = inject(NavService);
  private readonly events = inject(EventsStore);
  readonly card = input.required<LearnCardData>();
  readonly kind = input.required<LearnKind>();
  /** раздел «Обучения», куда вернет стрелка «Назад» со страницы курса */
  readonly lt = input('my');
  /** без кнопки участия (например, у админа на странице «Мероприятия») */
  readonly noAction = input(false, { transform: booleanAttribute });
  /** мероприятие открывается на странице «Мероприятие» раздела «Календарь» (eventview), а не в обучении */
  readonly evView = input(false, { transform: booleanAttribute });
  /** статус участия (для кнопки): у мероприятия — участие сотрудника, иначе статус записи («Открыта запись», «Мест нет» …) */
  protected readonly status = computed(() => (this.kind() === 'ev' ? this.store.eventStatus(this.card().id) : this.store.status(this.kind(), this.card().id, 'my')));
  /** бейдж: на странице «Мероприятия» — статус мероприятия (Запланирована / Проведена / Отменена), иначе — статус участия */
  protected readonly badge = computed(() => (this.evView() ? this.events.statusOf(this.card().id) : this.status()));
  /** ссылка онлайн-встречи (страница «Мероприятия») */
  protected readonly meet = computed(() => {
    if (!this.evView()) return '';
    const p = this.events.placeOf(this.card().id);
    return isLink(p) ? p : '';
  });
  protected readonly ltext = linkText;
  protected readonly tone = computed(() => 'bdg ' + ((this.evView() ? EVENT_STATUS_TONE : LEARN_TONE)[this.badge()] || ''));
  protected readonly progress = computed(() => {
    const k = this.kind(),
      id = this.card().id;
    return k === 'crs' ? this.store.courseProgress(id) : k === 'prog' ? this.store.programProgress(id) : null;
  });
  protected readonly action = computed(() => {
    const k = this.kind(),
      id = this.card().id,
      st = this.status();
    return k === 'ev' ? this.store.eventAction(st, id, !!this.card().live) : this.store.courseAction(st, id);
  });

  /** открыть курс / мероприятие / программу */
  protected open(): void {
    const k = this.kind(), id = this.card().id, lt = this.lt();
    if (k === 'ev' && this.evView()) return this.nav.go('eventview', { ev: id });
    if (k === 'prog') this.nav.go('program', { prog: id, lt });
    else this.nav.go('course', k === 'ev' ? { crs: id, kind: 'trn', lt } : { crs: id, lt });
  }
}
