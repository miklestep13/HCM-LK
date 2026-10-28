import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LearnStore } from '../../../core/demo/learn-store.service';
import { avCls } from '../../../data/people.data';

/** Комментарии к курсу: автор, дата, оценка звездами, текст */
@Component({
  selector: '[course-comments]',
  template: `
    <div class="crscm">
      @for (x of store.comments(); track $index) {
        <div class="cmi">
          <span class="av" [class]="av(x)"></span>
          <div class="i">
            <div class="h"><b>{{ x[1] }}</b><time>{{ x[2] }}</time></div>
            <div class="stars">{{ stars(x[3]) }}</div>
            <p>{{ x[4] }}</p>
          </div>
        </div>
      }
    </div>
  `,
  host: { class: 'cpane' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseComments {
  protected readonly store = inject(LearnStore);
  protected av(x: [string, string, string, number, string]): string {
    return x[0] === 'avme' ? avCls(x[1], 1) : avCls(x[1], +x[0].replace('av', '') || 1);
  }
  protected stars(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
}
