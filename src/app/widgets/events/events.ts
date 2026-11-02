import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { EventsStore } from '../../core/demo/events-store.service';
import { LearnStore } from '../../core/demo/learn-store.service';
import { CompanyEvent } from '../../interface/news';
import { Icon } from '../../shared/ui/icon/icon';
import { ToastService } from '../../shared/ui/toast/toast.service';

/**
 * Виджет «Мероприятия» — одна карточка для всех страниц («Компания → Обзор», «Новости», сообщество):
 * заголовок со счетчиком и переходом в календарь; список — плитка с датой, название, описание (или место), дата и время «21.06 10:00», участники.
 *   <div app-events></div>                                — мероприятия компании
 *   <div app-events [events]="list" empty="…"></div>      — свои мероприятия (например, встречи сообщества)
 *   <div app-events canAdd (add)="…"></div>               — внизу голубая кнопка «Добавить» (форма добавления мероприятия)
 * Клик по мероприятию — регистрация и напоминание в календаре. Формат («Онлайн» / «Офлайн») не показываем.
 */
@Component({
  selector: '[app-events]',
  imports: [Icon],
  template: `
    <div class="ch">
      <h3>{{ title() }}</h3>
      <span class="chip">{{ list().length }}</span>
      <button class="ib2 hubopen" title="Все мероприятия" aria-label="Все мероприятия" (click)="nav.go('events')"><app-icon name="open" /></button>
    </div>
    <div class="cb"><div class="evl">
      @for (e of list(); track e.title) {
        <div class="mem cmrow coevr" (click)="open(e)">
          <span class="cmav codt"
            ><b>{{ day(e) }}</b
            ><small>{{ month(e) }}</small></span
          >
          <div class="i">
            <div class="nm">{{ e.title }}</div>
            <div class="rl">
              {{ e.desc }}
              @if (e.live) {
                <span class="evnow"><i></i>Идет сейчас</span>
              }
            </div>
            <span class="cmmm"
              >@if (time(e); as t) {<app-icon name="clock" />{{ t }}}<span class="coevu"><app-icon name="user" />{{ e.people }}</span></span
            >
            <!-- участие: «Принять участие» / «Отменить участие» / «Подключиться» (идет сейчас) — синим текстом под мероприятием -->
            @if (act(e); as a) {
              <button class="lnk evact" (click)="$event.stopPropagation(); run(e, a.act)">{{ a.label }}</button>
            }
          </div>
        </div>
      } @empty {
        <div class="empty sm">{{ empty() }}</div>
      }
    </div>
    @if (canAdd()) {
      <button class="btn raised blk evadd" (click)="add.emit()">Добавить</button>
    }
    </div>
  `,
  styleUrl: './events.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c w-events' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Events {
  /** свои мероприятия (например, встречи сообщества); не задано — ближайшие со страницы «Мероприятия» */
  readonly events = input<CompanyEvent[] | null>(null);
  private readonly store = inject(EventsStore);
  protected readonly learn = inject(LearnStore);
  /** кнопка участия — как на карточке мероприятия (только у мероприятий со страницы «Мероприятия») */
  protected act(e: CompanyEvent): { act: string; label: string; raised?: boolean } | null {
    // встреча без страницы (сообщество) — запись в виджете
    if (!e.ev) return this.reg().has(e.title) ? { act: 'unreg', label: 'Отменить участие' } : { act: 'reg', label: 'Принять участие' };
    const a = this.learn.eventAction(this.learn.eventStatus(e.ev), e.ev, !!e.live);
    return a && a.kind === 'btn' ? a : null;
  }
  protected readonly list = computed(() => this.events() ?? this.store.upcoming());
  readonly title = input('Мероприятия');
  readonly empty = input('Мероприятий пока нет');
  readonly canAdd = input(false, { transform: booleanAttribute });
  readonly add = output<void>();
  protected readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);

  /** плитка даты: «18 сентября, 19:00» → 18 / сен */
  protected day = (e: CompanyEvent) => e.when.split(' ')[0];
  protected month = (e: CompanyEvent) => e.when.split(' ')[1].replace(',', '').slice(0, 3);
  /** только время (дата — на плитке слева): «18 сентября, 19:00» → 19:00; «2 октября, с 09:00» → 09:00 */
  protected time = (e: CompanyEvent) => /\d{1,2}:\d{2}/.exec(e.when)?.[0] ?? '';

  /** встречи без страницы, на которые записался пользователь (по названию) */
  private readonly reg = signal(new Set<string>());
  protected run(e: CompanyEvent, act: string): void {
    if (e.ev) return this.learn.run('ev', e.ev, act);
    const s = new Set(this.reg());
    act === 'reg' ? s.add(e.title) : s.delete(e.title);
    this.reg.set(s);
    this.toast.show(act === 'reg' ? 'Вы записаны' : 'Участие отменено', e.title);
  }

  /** клик по строке — карточка мероприятия; встреча без страницы (сообщество) — напоминание в календаре */
  protected open(e: CompanyEvent): void {
    if (e.ev) return this.nav.go('eventview', { ev: e.ev });
    this.toast.show('Готово', `${e.title}: регистрация и напоминание в календаре.`);
  }
}
