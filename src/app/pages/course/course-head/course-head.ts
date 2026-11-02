import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LEARN_TONE, LEARN_WORK, LearnStore } from '../../../core/demo/learn-store.service';
import { LEARN_COURSE_INFO, LEARN_EVENT_INFO } from '../../../data/learn-course.data';
import { LEARN_COURSES, LEARN_EVENTS } from '../../../data/learn.data';
import { Clamp } from '../../../shared/ui/clamp/clamp';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { LearnActionButton } from '../../../widgets/learn-action/learn-action';

/** Шапка курса / мероприятия: картинка, название и статус, срок и длительность (место), описание, прогресс, кнопка по статусу и реакции */
@Component({
  selector: '[course-head]',
  imports: [Icon, Progress, Clamp, LearnActionButton],
  template: `
    <div class="cb crshd">
      <div class="crsimg"><img [src]="img()" alt="" /></div>
      <div class="crsinfo">
        <h2>{{ title() }}</h2>
        @if (stShow() || live()) {
          <div class="gltags crstags">
            @if (stShow()) {
              <span class="bdg" [class]="tone()">{{ st() }}</span>
            }
            @if (live()) {
              <span class="bdg dg live">Идет сейчас</span>
            }
          </div>
        }
        <div class="cmeta2 crsm">
          @if (ev()) {
            <span><app-icon name="calendar" />{{ evDate() }}</span><span><app-icon name="clock" />{{ dur() }}</span><i class="brk"></i>
            <span>
              <!-- место проведения: адрес или «Онлайн» — иконка местоположения, серым 12px -->
              <app-icon name="pin" />{{ place() || 'Онлайн' }}
            </span>
          } @else {
            @if (crs().d !== '—') {
              <span [class.od]="st() === 'Просрочен'"><app-icon name="calendar" />{{ past() ? 'пройден ' : 'до ' }}{{ crs().d }}</span>
            }
            <span><app-icon name="clock" />{{ dur() }}</span>
          }
        </div>
        <div class="abt crsab" [innerHTML]="info().ab" [appClamp]="info().ab"></div>
        @if (progress(); as p) {
          <app-progress class="prgbar crspr" label="Выполнено" [value]="p.value + '%'" [percent]="p.value" [tone]="p.tone" [caption]="p.sub" />
        }
        <div class="crsbtn">
          <div class="lfact" learn-action [action]="action()" (act)="store.run(ev() ? 'ev' : 'crs', id(), $event, lt())"></div>
          <div class="npf crsf">
            <button class="npb" title="Нравится" (click)="toast.show('Готово', 'Отзыв учтен.')"><app-icon name="thumbUp" /><span>{{ info().l }}</span></button>
            <button class="npb" title="Не нравится" (click)="toast.show('Готово', 'Отзыв учтен.')"><app-icon name="thumbDown" /><span>{{ info().dis }}</span></button>
            <span class="npb st" title="Прошли курс"><app-icon name="userXs2" /><span>{{ info().ps ?? info().l * 6 + 40 }}</span></span>
            @if (showFav) {
              <button class="npb" title="В избранное" (click)="toast.show('Готово', 'Курс добавлен в избранное.')"><app-icon name="bookmark" /></button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'c crsv mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseHead {
  protected readonly store = inject(LearnStore);
  protected readonly toast = inject(ToastService);
  /** «В избранное» (закладка) — пока скрыта */
  protected readonly showFav = false;
  readonly id = input.required<string>();
  /** мероприятие */
  readonly ev = input(false);
  readonly lt = input('');
  protected readonly crs = computed(() => LEARN_COURSES[this.id()] || { t: '', d: '—', dur: '', st: '' });
  protected readonly info = computed(() => (this.ev() ? LEARN_EVENT_INFO : LEARN_COURSE_INFO)[this.id()] || { l: 0, dis: 0, ab: '', s: [] });
  protected readonly title = computed(() => (this.ev() ? LEARN_EVENTS[this.id()]?.t : this.crs().t) || '');
  protected readonly img = computed(() => this.store.imgOf(this.ev() ? 'ev' : 'crs', this.id()));
  protected readonly st = computed(() => (this.ev() ? this.store.eventStatus(this.id()) : this.store.status('crs', this.id(), 'my')));
  protected readonly live = computed(() => this.ev() && this.store.isLive(this.id()));
  protected readonly stShow = computed(() => LEARN_WORK.test(this.st()) && this.st() !== 'Идет сейчас');
  protected readonly tone = computed(() => LEARN_TONE[this.st()] || '');
  protected readonly past = computed(() => /Завершен|Пройден/i.test(this.st()));
  protected readonly dur = computed(() => (this.ev() ? LEARN_EVENTS[this.id()]?.dur : this.crs().dur) || '');
  protected readonly evDate = computed(() => (LEARN_EVENTS[this.id()]?.d || '').split('–')[0]);
  protected readonly place = computed(() => LEARN_EVENTS[this.id()]?.pl || '');
  protected readonly progress = computed(() => {
    if (this.ev() || !LEARN_WORK.test(this.st())) return null;
    const p = this.store.courseProgress(this.id(), true);
    if (!p) return null;
    const st = this.st(), n = this.store.blocksCount(this.id()), d = /Завершен/.test(st) ? n : /Назначен/.test(st) ? 0 : this.store.done()[this.id()] || 0;
    return { ...p, sub: 'Пройдено ' + d + ' из ' + n + ' модулей' };
  });
  protected readonly action = computed(() => (this.ev() ? this.store.eventAction(this.st(), this.id(), this.live()) : this.store.courseAction(this.st(), this.id())));
}
