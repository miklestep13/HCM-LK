import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { LEARN_MICO, learnDur, learnMin, learnPlayKind, learnTitle, learnType } from '../../../core/demo/learn-store.service';
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
            <!-- шапка раздела как в конструкторе: номер · название · шеврон -->
            <div class="secth" data-acc (click)="flip(si)">
              <span class="secn">{{ si + 1 }}</span><b>{{ sec.t }}</b><span class="accar"><app-icon name="chevSm" /></span>
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
                      {{ b.num }}
                    }
                  }
                </div>
                <span class="cico" [title]="b.kind[1]"><app-icon [name]="b.kind[0]" /></span>
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
  /** свернутые разделы: открыт только тот, где текущий модуль */
  protected readonly closed = signal(new Set<number>());
  protected readonly progName = computed(() => LEARN_PROGRAMS[this.prog()]?.t || '');
  protected readonly pct = computed(() => (this.s.blocks().length ? Math.round((this.s.st().done.length / this.s.blocks().length) * 100) : 0));
  protected readonly secs = computed(() => {
    const st = this.s.st(), v = this.q().trim().toLowerCase();
    let n = 0;
    return (LEARN_COURSE_INFO[this.s.id()]?.s || []).map((sec, si) => {
      const rows = sec[1].map((b, bi) => {
        const k = n++;
        const typ = learnPlayKind(learnType(b));
        const state = st.done.includes(k) ? 'done' : st.fail.includes(k) ? 'fail' : st.review.includes(k) ? 'review' : k === this.s.i() ? 'cur' : '';
        const title = learnTitle(b);
        const num = si + 1 + '.' + (bi + 1);
        return { k, t: title, m: b[2], state, kind: LEARN_MICO[typ] || LEARN_MICO['text'], num, show: !v || (title + b[0] + b[2] + num).toLowerCase().includes(v) };
      });
      return { t: sec[0], dur: learnDur(sec[1].reduce((a, x) => a + learnMin(x[2]), 0)), rows, show: !v || rows.some((r) => r.show) || sec[0].toLowerCase().includes(v) };
    });
  });

  constructor() {
    // при смене модуля / курса — открыта только группа текущего модуля
    effect(() => {
      const n = (LEARN_COURSE_INFO[this.s.id()]?.s || []).length;
      const cur = this.s.cur()?.si ?? 0;
      untracked(() => {
        const set = new Set<number>();
        for (let k = 0; k < n; k++) if (k !== cur) set.add(k);
        this.closed.set(set);
      });
    });
  }

  /** вручную: открыть только этот раздел или свернуть его */
  protected flip(i: number): void {
    const n = (LEARN_COURSE_INFO[this.s.id()]?.s || []).length;
    this.closed.update((s) => {
      const next = new Set<number>();
      for (let k = 0; k < n; k++) next.add(k);
      if (s.has(i)) next.delete(i);
      return next;
    });
  }
}
