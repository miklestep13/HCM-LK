import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { learnDur, learnMin } from '../../../core/demo/learn-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { LEARN_COURSE_INFO } from '../../../data/learn-course.data';
import { LEARN_PROGRAMS } from '../../../data/learn.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { PlayerState } from '../player.state';

/** Левая колонка плеера: «К программе курса», название курса (ведет к описанию), прогресс; поиск и содержание с состоянием модулей */
@Component({
  selector: '[player-side]',
  imports: [Icon, Progress],
  template: `
    @let st = s.st();
    <div class="c">
      <div class="cb">
        @if (prog()) {
          <button class="lnk lfcrumb" [title]="progName()" (click)="nav.go('program', { prog: prog(), lt: lt() })">К программе курса</button>
        }
        <div class="pltitle lfpt" title="Открыть описание курса" (click)="nav.go('course', { crs: s.id(), lt: lt() })">{{ s.course()?.t }}</div>
        <app-progress
          class="plpr"
          label="Выполнено"
          [value]="pct() + '%'"
          [percent]="pct()"
          [tone]="pct() === 100 ? 'ok' : s.store.courses()[s.id()] === 'Просрочен' ? 'dg' : ''"
          [caption]="'Пройдено ' + st.done.length + ' из ' + s.blocks().length + ' модулей'"
        />
      </div>
    </div>
    <div class="c">
      <div class="cb plq"><input class="tsearch" placeholder="Поиск по содержанию" [value]="q()" (input)="q.set($any($event.target).value)" /></div>
      <div class="cb pltoc" style="padding-top: 0">
        @for (sec of secs(); track $index; let si = $index) {
          <div class="sect" [class.closed]="closed().has(si)" [class.hidden]="!sec.show">
            <div class="secth" (click)="flip(si)">
              <span class="secn">{{ si + 1 }}</span><b>{{ sec.t }}</b><span class="bmeta">{{ sec.dur }}</span><span class="accar"><app-icon name="chevSm" /></span>
            </div>
            @for (b of sec.rows; track b.k) {
              <div class="cblk plrow" [class.on]="b.k === s.i()" [class.hidden]="!b.show" (click)="s.i.set(b.k)">
                <div class="cbi">
                  @switch (b.state) {
                    @case ('done') {
                      <span class="pli ok" title="Просмотрено"><app-icon name="pliOk" /></span>
                    }
                    @case ('fail') {
                      <span class="pli dg" title="Неудачная попытка"><app-icon name="pliFail" /></span>
                    }
                    @case ('review') {
                      <span class="pli warn" title="На проверке"><app-icon name="clock" /></span>
                    }
                    @case ('cur') {
                      <span class="pli cur" title="В процессе"><app-icon name="pliCur" /></span>
                    }
                    @default {
                      {{ b.k + 1 }}
                    }
                  }
                </div>
                <div><b>{{ b.t }}</b></div>
                <span class="bmeta">{{ b.m }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  host: { class: 'plside' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSide {
  protected readonly s = inject(PlayerState);
  protected readonly nav = inject(NavService);
  /** программа, из которой открыт курс */
  readonly prog = input('');
  readonly lt = input('');
  protected readonly q = signal('');
  protected readonly closed = signal(new Set<number>());
  protected readonly progName = computed(() => LEARN_PROGRAMS[this.prog()]?.t || '');
  protected readonly pct = computed(() => (this.s.blocks().length ? Math.round((this.s.st().done.length / this.s.blocks().length) * 100) : 0));
  protected readonly secs = computed(() => {
    const st = this.s.st(), v = this.q().trim().toLowerCase();
    let n = 0;
    return (LEARN_COURSE_INFO[this.s.id()]?.s || []).map((sec) => {
      const rows = sec[1].map((b) => {
        const k = n++;
        const state = st.done.includes(k) ? 'done' : st.fail.includes(k) ? 'fail' : st.review.includes(k) ? 'review' : k === this.s.i() ? 'cur' : '';
        return { k, t: b[0], m: b[2], state, show: !v || (b[0] + b[2] + (k + 1)).toLowerCase().includes(v) };
      });
      return { t: sec[0], dur: learnDur(sec[1].reduce((a, b) => a + learnMin(b[2]), 0)), rows, show: !v || rows.some((r) => r.show) || sec[0].toLowerCase().includes(v) };
    });
  });
  protected flip(i: number): void {
    this.closed.update((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }
}
