import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LEARN_TONE, LearnStore, iprPlural } from '../program.utils';
import { LEARN_PROG_INFO, LEARN_PROG_MODULES, LEARN_PROG_TESTS } from '../../../data/learn-course.data';
import { LEARN_PROGRAMS } from '../../../data/learn.data';
import { Clamp } from '../../../shared/ui/clamp/clamp';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';

/** Шапка программы: картинка, название и статус, срок, длительность, число курсов и тестов, описание, прогресс и кнопка */
@Component({
  selector: '[program-head]',
  imports: [Icon, Progress, Clamp],
  template: `
    @let p = prog();
    <div class="cb crshd">
      <div class="crsimg"><img [src]="img()" alt="" /></div>
      <div class="crsinfo">
        <h2>{{ p.t }}</h2>
        <div class="gltags crstags"><span class="bdg" [class]="tone()">{{ p.st }}</span></div>
        <div class="cmeta2 crsm prgm">
          <span><app-icon name="calendar" />{{ p.st === 'Завершена' ? 'пройдена ' : 'до ' }}{{ info().d }}</span><span><app-icon name="clock" />{{ info().dur }}</span
          ><span><app-icon name="course" />{{ p.s.length }} {{ p.s.length < 5 ? 'курса' : 'курсов' }}</span>
          @if (tests()) {
            <span><app-icon name="mQuiz" />{{ pl(tests(), ['тест', 'теста', 'тестов']) }}</span>
          }
        </div>
        <div class="abt crsab" [appClamp]="info().ab">
          @if (info().ab) {
            <p>{{ info().ab }}</p>
          }
        </div>
        <app-progress
          class="prgbar"
          label="Выполнено"
          [value]="pct() + '%'"
          [percent]="pct()"
          [tone]="done() === p.s.length ? 'ok' : ''"
          [caption]="'Пройдено ' + done() + ' из ' + p.s.length + ' курсов'"
        />
        <div class="crsbtn lfact prgact">
          <button class="btn pri" (click)="store.run('prog', id(), 'play', lt())">{{ btn() }}</button>
        </div>
      </div>
    </div>
  `,
  host: { class: 'c crsv prgv mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramHead {
  protected readonly store = inject(LearnStore);
  readonly id = input.required<string>();
  readonly lt = input('');
  protected readonly pl = iprPlural;
  protected readonly prog = computed(() => this.store.programs()[this.id()] || LEARN_PROGRAMS[this.id()]);
  protected readonly info = computed(() => LEARN_PROG_INFO[this.id()] || { d: '', dur: '', ab: '' });
  protected readonly img = computed(() => this.store.imgOf('prog', this.id()));
  protected readonly tone = computed(() => LEARN_TONE[this.prog().st] || '');
  protected readonly done = computed(() => this.prog().s.filter((x) => /Завершен/.test(x[1])).length);
  protected readonly pct = computed(() => Math.round((this.done() / this.prog().s.length) * 100));
  protected readonly tests = computed(() => (LEARN_PROG_MODULES[this.id()] || []).reduce((s, m) => s + m[1].filter((x) => LEARN_PROG_TESTS[x]).length, 0));
  protected readonly btn = computed(() => {
    const p = this.prog(), nx = p.s.find((x) => !/Завершен/.test(x[1]));
    return p.st === 'Завершена' || !nx ? 'Пройти повторно' : /В процессе/.test(p.st) ? 'Продолжить обучение' : 'Начать';
  });
}
