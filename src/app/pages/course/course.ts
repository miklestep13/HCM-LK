import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { LearnStore } from '../../core/demo/learn-store.service';
import { LEARN_COURSE_INFO } from '../../data/learn-course.data';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { CourseComments } from './course-comments/course-comments';
import { CourseHead } from './course-head/course-head';
import { CourseToc } from './course-toc/course-toc';

/**
 * «Обучение → Курс / Мероприятие»: шапка (картинка, статус, срок, описание, кнопка по статусу, реакции),
 * у курса — вкладки «Программа» и «Комментарии». Параметры адреса: crs — курс или мероприятие, kind=trn — мероприятие, lt — раздел «Обучения».
 */
@Component({
  selector: 'app-course',
  imports: [PageHead, CourseHead, CourseToc, CourseComments],
  template: `
    <app-page-head [title]="ev() ? 'Мероприятие' : 'Курс'" backTo="dev" backLabel="К обучению" [backAttrs]="lt() ? { lt: lt() } : undefined" />
    @if (crs()) {
      <div course-head [id]="crs()" [ev]="ev()" [lt]="lt()"></div>
      @if (!ev()) {
        <div class="c crsv crsp">
          <div class="ctabs">
            <span [class.on]="tab() === 'toc'" (click)="tab.set('toc')">Программа</span
            ><span [class.on]="tab() === 'cm'" (click)="tab.set('cm')">Комментарии <span class="chip">{{ store.comments().length }}</span></span>
          </div>
          @if (tab() === 'toc') {
            <div course-toc [sections]="sections()"></div>
          } @else {
            <div course-comments></div>
          }
        </div>
      }
    }
  `,
  styleUrl: './course.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-course' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Course {
  protected readonly store = inject(LearnStore);
  /** курс / мероприятие (параметр адреса) */
  readonly crs = input('');
  /** trn — мероприятие */
  readonly kind = input('');
  readonly lt = input('');
  protected readonly ev = computed(() => this.kind() === 'trn');
  protected readonly tab = signal<'toc' | 'cm'>('toc');
  protected readonly sections = computed(() => LEARN_COURSE_INFO[this.crs()]?.s || []);
  constructor() {
    effect(() => {
      this.crs();
      untracked(() => this.tab.set('toc'));
    });
  }
}
