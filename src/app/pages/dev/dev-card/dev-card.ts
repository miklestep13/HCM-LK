import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LEARN_TONE } from '../../../core/demo/learn-store.service';
import { LearnCard, LearnKind } from '../../../interface/learn';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { LearnActionButton } from '../../../widgets/learn-action/learn-action';
import { DevState } from '../dev.state';

/** Карточка «Моего обучения»: фото со статусом, название, срок и длительность (у мероприятия — место), прогресс, кнопка */
@Component({
  selector: '[dev-card]',
  imports: [Icon, Progress, LearnActionButton],
  template: `
    @let c = card();
    @let st = status();
    <div class="cbody" (click)="s.open(kind(), c.id)">
      <div class="vimg">
        <img [src]="c.img" alt="" />
        <span class="bdgs">
          @if (st) {
            <span class="bdg" [class]="tone()">{{ st }}</span>
          }
          @if (c.live) {
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
              @if (c.place) {
                <app-icon name="pin" />{{ c.place }}
              } @else {
                <app-icon name="video" />
                @if (st === 'Вы записаны') {
                  <a class="evlnk" href="#" (click)="link($event)">Онлайн</a>
                } @else {
                  Онлайн
                }
              }
            </span>
          </div>
        }
        @if (progress(); as p) {
          <app-progress class="vpr" label="Выполнено" [value]="p.value + '%'" [percent]="p.value" [tone]="p.tone" [caption]="p.sub || ''" />
        }
      </div>
    </div>
    <div class="vact" learn-action [action]="action()" (act)="s.act(kind(), c.id, $event)"></div>
  `,
  host: { class: 'vcard' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevCard {
  protected readonly s = inject(DevState);
  readonly card = input.required<LearnCard>();
  readonly kind = input.required<LearnKind>();
  protected readonly status = computed(() => this.s.store.status(this.kind(), this.card().id, 'my'));
  protected readonly tone = computed(() => 'bdg ' + (LEARN_TONE[this.status()] || ''));
  protected readonly progress = computed(() => {
    const k = this.kind(),
      id = this.card().id;
    return k === 'crs' ? this.s.store.courseProgress(id) : k === 'prog' ? this.s.store.programProgress(id) : null;
  });
  protected readonly action = computed(() => {
    const k = this.kind(),
      id = this.card().id,
      st = this.status();
    return k === 'ev' ? this.s.store.eventAction(st, id, !!this.card().live) : this.s.store.courseAction(st, id);
  });

  protected link(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.s.act('ev', this.card().id, 'link');
  }
}
