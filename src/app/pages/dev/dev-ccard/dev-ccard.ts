import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LEARN_TONE, LEARN_WORK } from '../../../core/demo/learn-store.service';
import { LEARN_COURSES, LEARN_MY, LEARN_NO_REPEAT } from '../../../data/learn.data';
import { LearnCard, LearnKind } from '../../../interface/learn';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { LearnActionButton } from '../../../widgets/learn-action/learn-action';
import { DevState } from '../dev.state';

/**
 * Карточка каталога: фото, название, длительность (у курса, с которым сотрудник уже работает, — срок как в «Моем обучении»),
 * статус — только если сотрудник уже проходит курс / программу, прогресс, кнопка (записаться / подать заявку / продолжить).
 */
@Component({
  selector: '[dev-ccard]',
  imports: [Icon, Progress, LearnActionButton],
  template: `
    @let c = card();
    @let st = status();
    <div class="cbody" (click)="s.open(kind(), c.id)">
      <img [src]="c.img" alt="" />
      <div class="cc2">
        <b>{{ c.title }}</b>
        @switch (kind()) {
          @case ('crs') {
            <div class="cmeta">
              @if (date(); as d) {
                <span class="cdt" [class.od]="st === 'Просрочен'"><app-icon name="calendar" />{{ d }}</span>
              }
              <app-icon name="clock" /><span>{{ c.dur }}</span>
            </div>
            @if (passed(); as d) {
              <div class="cmeta lfdone"><app-icon name="calendar" /><span>пройден {{ d }}</span></div>
            }
          }
          @case ('prog') {
            <div class="cmeta"><app-icon name="clock" /><span>{{ c.line }}</span></div>
          }
          @case ('ev') {
            <div class="cmeta"><app-icon name="calendar" /><span>{{ c.line }}</span></div>
            <div class="cmeta"><app-icon [name]="c.place ? 'pin' : 'video'" /><span>{{ c.place || 'Онлайн' }}</span></div>
          }
        }
        <span class="cbdg2">
          @if (badge()) {
            <span [class]="'bdg ' + tone()">{{ badge() }}</span>
          }
        </span>
        @if (progress(); as p) {
          <app-progress class="vpr" label="Выполнено" [value]="p.value + '%'" [percent]="p.value" [tone]="p.tone" [caption]="p.sub || ''" />
        }
      </div>
    </div>
    <div class="cact" learn-action [action]="action()" (act)="s.act(kind(), c.id, $event)"></div>
  `,
  host: { class: 'ccard cw' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevCcard {
  protected readonly s = inject(DevState);
  readonly card = input.required<LearnCard>();
  readonly kind = input.required<LearnKind>();
  protected readonly status = computed(() => this.s.store.status(this.kind(), this.card().id, 'cat'));
  /** статус на фото — только у курса / программы, с которыми сотрудник уже работает */
  protected readonly badge = computed(() => (this.kind() !== 'ev' && LEARN_WORK.test(this.status()) ? this.status() : ''));
  protected readonly tone = computed(() => LEARN_TONE[this.badge()] || '');
  /** срок — как в «Моем обучении» */
  protected readonly date = computed(() => {
    if (this.kind() !== 'crs' || !LEARN_WORK.test(this.status())) return '';
    const id = this.card().id;
    return this.s.store.myIds().crs.includes(id) ? LEARN_MY.crs.find((c) => c.id === id)?.date || '' : '';
  });
  /** курс, который нельзя пройти повторно, — дата прохождения */
  protected readonly passed = computed(() => {
    const id = this.card().id;
    return this.kind() === 'crs' && LEARN_NO_REPEAT[id] === false && !this.date() ? LEARN_COURSES[id].d : '';
  });
  protected readonly progress = computed(() => {
    const k = this.kind(),
      id = this.card().id;
    if (k === 'ev' || !LEARN_WORK.test(this.status())) return null;
    return k === 'crs' ? this.s.store.courseProgress(id) : this.s.store.programProgress(id);
  });
  protected readonly action = computed(() => {
    const k = this.kind(),
      id = this.card().id,
      st = this.status();
    return k === 'ev' ? this.s.store.eventAction(st, id, false) : this.s.store.courseAction(st, id);
  });
}
