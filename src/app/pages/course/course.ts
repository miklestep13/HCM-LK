import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { LEARN_COURSE_INFO } from '../../data/learn-course.data';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { CourseHead } from './course-head/course-head';
import { CourseToc } from './course-toc/course-toc';

/**
 * «Обучение → Курс / Мероприятие»: шапка (картинка, статус, срок, описание, кнопка по статусу, реакции),
 * у курса — блок «Программа» (без вкладок). Параметры адреса: crs — курс или мероприятие, kind=trn — мероприятие, lt — раздел «Обучения».
 */
@Component({
  selector: 'app-course',
  imports: [PageHead, CourseHead, CourseToc],
  template: `
    <app-page-head [title]="ev() ? 'Мероприятие' : 'Курс'" backTo="dev" backLabel="К обучению" [backAttrs]="lt() ? { lt: lt() } : undefined" />
    @if (crs()) {
      <div course-head [id]="crs()" [ev]="ev()" [lt]="lt()"></div>
      @if (!ev()) {
        <div class="c crsv crsp">
          <div class="ch"><h3>Программа</h3></div>
          <div course-toc [sections]="sections()"></div>
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
  /** курс / мероприятие (параметр адреса) */
  readonly crs = input('');
  /** trn — мероприятие */
  readonly kind = input('');
  readonly lt = input('');
  protected readonly ev = computed(() => this.kind() === 'trn');
  protected readonly sections = computed(() => LEARN_COURSE_INFO[this.crs()]?.s || []);
}
