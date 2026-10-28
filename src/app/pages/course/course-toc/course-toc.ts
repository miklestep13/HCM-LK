import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { LEARN_MICO, learnDur, learnMin, learnType } from '../../../core/demo/learn-store.service';
import { LearnSection } from '../../../interface/learn';
import { Icon } from '../../../shared/ui/icon/icon';

/** Программа курса: разделы-аккордеоны, в них модули — тип (иконка), название, описание, длительность */
@Component({
  selector: '[course-toc]',
  imports: [Icon],
  template: `
    @for (sec of sections(); track $index; let si = $index) {
      <div class="sect" [class.closed]="closed().has(si)">
        <div class="secth" (click)="flip(si)">
          <span class="secn">{{ si + 1 }}</span><b>{{ sec[0] }}</b><span class="bmeta">{{ total(sec) }}</span><span class="accar"><app-icon name="chevSm" /></span>
        </div>
        @for (b of sec[1]; track $index) {
          @let m = mico(b);
          <div class="cblk">
            <span class="cbi cico" [title]="m[1]"><app-icon [name]="m[0]" /></span>
            <div><b>{{ b[0] }}</b><small>{{ b[1] }}</small></div>
            <span class="bmeta">{{ b[2] }}</span>
          </div>
        }
      </div>
    }
  `,
  host: { class: 'cpane' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseToc {
  readonly sections = input.required<LearnSection[]>();
  protected readonly closed = signal(new Set<number>());
  protected total(sec: LearnSection): string {
    return learnDur(sec[1].reduce((a, b) => a + learnMin(b[2]), 0));
  }
  protected mico(b: LearnSection[1][number]): [string, string] {
    return LEARN_MICO[learnType(b)] || LEARN_MICO['video'];
  }
  protected flip(i: number): void {
    this.closed.update((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }
}
