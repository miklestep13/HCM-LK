import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LEARN_TONE, LearnStore, iprPlural, learnDur, learnMin } from '../program.utils';
import { LEARN_PROG_CARDS, LEARN_PROG_MODULES, LEARN_PROG_TESTS } from '../../../data/learn-course.data';
import { LEARN_COURSES, LEARN_PROGRAMS } from '../../../data/learn.data';
import { NavService } from '../../../core/navigation/nav.service';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { LearnActionButton } from '../../../widgets/learn-action/learn-action';

/**
 * Состав программы: модули-аккордеоны, в них курсы и тесты — строками (название, срок, длительность; у теста — вопросы, попытки, балл; статус)
 * или карточками (завершенная программа).
 */
@Component({
  selector: '[program-modules]',
  imports: [Icon, Progress, LearnActionButton],
  template: `
    <div class="ch"><h3>Программа</h3></div>
    <div class="cb prgst">
      @for (m of mods(); track $index; let i = $index) {
        <div class="sect prgmod" [class.closed]="closed().has(i)">
          <div class="secth" (click)="flip(i)">
            <span class="secn">{{ i + 1 }}</span><b>{{ m[0] }}</b><span class="bmeta">{{ meta(m[1]) }}</span><span class="accar"><app-icon name="chevSm" /></span>
          </div>
          @if (cards()) {
            <div class="vgrid prgcards">
              @for (x of m[1]; track x) {
                @if (test(x); as T) {
                  <div class="vcard vtest">
                    <div class="cbody" (click)="testToast(x)">
                      <div class="vimg">
                        <div class="vtph"><app-icon name="mQuiz" /></div>
                        <span class="bdgs"><span class="bdg" [class]="tone(T.st)">{{ T.st }}</span><span class="bdg bdga">Тест</span></span>
                      </div>
                      <div class="vb">
                        <div class="vt">{{ T.t }}</div>
                        <div class="vmeta row">
                          <span><app-icon name="clock" />{{ T.dur }}</span><span><app-icon name="mQuiz" />{{ pl(T.q, ['вопрос', 'вопроса', 'вопросов']) }}</span
                          ><span><app-icon name="refresh" />{{ pl(T.a, ['попытка', 'попытки', 'попыток']) }}</span><span><app-icon name="cup" />более {{ T.p }}%</span>
                        </div>
                        <app-progress class="vpr" label="Лучший результат" [value]="T.r + '%'" [percent]="T.r" [tone]="done(T.st) ? 'ok' : ''" />
                      </div>
                    </div>
                    <div class="vact"><button class="btn pri" (click)="testToast(x)">{{ done(T.st) ? 'Пройти повторно' : 'Начать тест' }}</button></div>
                  </div>
                } @else {
                  @let st = stOf(x);
                  <div class="vcard">
                    <div class="cbody" (click)="open(x)">
                      <div class="vimg">
                        <img [src]="store.imgOf('crs', x)" alt="" /><span class="bdgs"><span class="bdg" [class]="tone(st)">{{ st }}</span></span>
                      </div>
                      <div class="vb">
                        <div class="vt">{{ course(x).t }}</div>
                        <div class="vmeta row">
                          @if (store.dateOf(x)) {
                            <span [class.od]="st === 'Просрочен'"><app-icon name="calendar" />{{ store.dateOf(x) }}</span>
                          }
                          <span><app-icon name="clock" />{{ course(x).dur }}</span>
                        </div>
                        @if (prog(x, st); as p) {
                          <app-progress class="vpr" label="Выполнено" [value]="p.value + '%'" [percent]="p.value" [tone]="p.tone" />
                        }
                      </div>
                    </div>
                    <div class="vact" learn-action [action]="store.courseAction(st, x)" (act)="store.run('crs', x, $event, lt())"></div>
                  </div>
                }
              }
            </div>
          } @else {
            @for (x of m[1]; track x) {
              @if (test(x); as T) {
                <div class="cblk prow">
                  <span class="cbi cico"><app-icon name="mQuiz" /></span>
                  <div>
                    <b class="prlnk" (click)="testToast(x)">{{ T.t }}</b>
                    <div class="prm">
                      <span><app-icon name="clock" />{{ T.dur }}</span><span><app-icon name="mQuiz" />{{ pl(T.q, ['вопрос', 'вопроса', 'вопросов']) }}</span
                      ><span><app-icon name="refresh" />{{ pl(T.a, ['попытка', 'попытки', 'попыток']) }}</span><span><app-icon name="cup" />более {{ T.p }}%</span>
                    </div>
                  </div>
                  <span class="bdg" [class]="tone(T.st)">{{ T.st }}</span>
                </div>
              } @else {
                @let st = stOf(x);
                <div class="cblk prow">
                  <span class="cbi cico"><app-icon name="course" /></span>
                  <div>
                    <b class="prlnk" (click)="open(x)">{{ course(x).t }}</b>
                    <div class="prm">
                      @if (store.dateOf(x)) {
                        <span [class.od]="st === 'Просрочен'"><app-icon name="calendar" />{{ store.dateOf(x) }}</span>
                      }
                      <span><app-icon name="clock" />{{ course(x).dur }}</span>
                    </div>
                  </div>
                  <span class="bdg" [class]="tone(st)">{{ st }}</span>
                </div>
              }
            }
          }
        </div>
      }
    </div>
  `,
  host: { class: 'c prgp' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramModules {
  protected readonly store = inject(LearnStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  readonly id = input.required<string>();
  readonly lt = input('');
  protected readonly pl = iprPlural;
  protected readonly closed = signal(new Set<number>());
  private readonly p = computed(() => this.store.programs()[this.id()] || LEARN_PROGRAMS[this.id()]);
  protected readonly mods = computed<[string, string[]][]>(() => LEARN_PROG_MODULES[this.id()] || [['Курсы программы', this.p().s.map((x) => x[0])]]);
  protected readonly cards = computed(() => !!LEARN_PROG_CARDS[this.id()]);

  protected test(x: string) {
    return LEARN_PROG_TESTS[x] || null;
  }
  protected course(x: string) {
    return LEARN_COURSES[x] || { t: x, dur: '', d: '', st: '' };
  }
  protected stOf(x: string): string {
    return (this.p().s.find((s) => s[0] === x) || [x, this.store.courses()[x] || ''])[1];
  }
  protected tone(st: string): string {
    return LEARN_TONE[st] || '';
  }
  protected done(st: string): boolean {
    return /Завершен/.test(st);
  }
  /** прогресс карточки курса: начатый или завершенный */
  protected prog(x: string, st: string) {
    const n = this.store.blocksCount(x), d = /Завершен/.test(st) ? n : /Назначен/.test(st) ? 0 : this.store.done()[x] || 0, v = n ? Math.round((d / n) * 100) : 0;
    return v || /В процессе|Просрочен/.test(st) ? { value: v, tone: (st === 'Просрочен' ? 'dg' : v === 100 ? 'ok' : '') as '' | 'ok' | 'dg' } : null;
  }
  protected meta(items: string[]): string {
    const min = items.reduce((s, x) => s + learnMin(this.test(x)?.dur || this.course(x).dur || ''), 0), nc = items.filter((x) => !this.test(x)).length, nt = items.length - nc;
    return [this.pl(nc, ['курс', 'курса', 'курсов']), nt ? this.pl(nt, ['тест', 'теста', 'тестов']) : '', learnDur(min)].filter(Boolean).join(' · ');
  }
  protected flip(i: number): void {
    this.closed.update((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }
  protected open(x: string): void {
    this.nav.go('course', { crs: x, ...(this.lt() ? { lt: this.lt() } : {}) });
  }
  protected testToast(x: string): void {
    const T = this.test(x)!;
    this.toast.show(T.t, 'Откроется тест: ' + this.pl(T.q, ['вопрос', 'вопроса', 'вопросов']) + ', ' + this.pl(T.a, ['попытка', 'попытки', 'попыток']) + ', проходной балл — более ' + T.p + '%.');
  }
}
