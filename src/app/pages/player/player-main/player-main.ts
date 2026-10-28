import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { LEARN_COURSE_INFO, LEARN_PASS, LEARN_TASK_FILES } from '../../../data/learn-course.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { PlayerState } from '../player.state';

const TYPE: Record<string, string> = { video: 'Видео', text: 'Текст', pres: 'Презентация', pdf: 'Документ', test: 'Тест', task: 'Задание' };

/**
 * Модуль курса: заголовок, длительность и тип, описание, содержимое по типу (видео, текст, презентация, документ, тест, задание),
 * переход к предыдущему / следующему модулю или «Завершить». После завершения — итог и отзыв о курсе.
 */
@Component({
  selector: '[player-main]',
  imports: [Icon],
  template: `
    @if (s.finished()) {
      <div class="lfres ok">
        <app-icon name="pliOk" /><b>Курс завершен</b
        ><span>Пройдено {{ s.st().done.length }} из {{ s.blocks().length }} модулей. Курс отмечен как завершенный в «Моем обучении».</span>
      </div>
      <div class="plfb">
        <h3>Оставьте отзыв о курсе</h3>
        <p class="pld">Ваш комментарий увидят следующие ученики — так им проще решить, подходит ли курс.</p>
        <div class="lfstars">
          @for (k of [1, 2, 3, 4, 5]; track k) {
            <span [class.on]="k <= stars()" (click)="stars.set(k)">★</span>
          }
        </div>
        <textarea class="fta" rows="4" placeholder="Что было полезно, чего не хватило" [value]="fb()" (input)="fb.set($any($event.target).value)"></textarea>
        <div class="plnav"><button class="btn raised" (click)="later()">Позже</button><button class="btn pri" (click)="sendFb()">Отправить отзыв</button></div>
      </div>
    } @else if (s.cur(); as b) {
      <div class="plhd">
        <h2>{{ b.t }}</h2>
        <span class="bmeta"><app-icon name="clock" />{{ b.m }} · {{ type[b.k] }}</span>
      </div>
      <p class="pld">{{ b.d }}</p>
      <div class="plbody">
        @switch (b.k) {
          @case ('video') {
            <div class="plvid" [style.background-image]="img() ? 'url(' + img() + ')' : null">
              <span class="plvp"><app-icon name="playFill" /></span><span class="plvm">Видеоурок · {{ b.m }}</span>
            </div>
          }
          @case ('text') {
            <div class="pltext" [innerHTML]="b.x || '<p>' + b.d + '</p>'"></div>
          }
          @case ('pres') {
            <div class="plpres">
              <div class="plslide"><small>Слайд {{ page() }}</small><b>{{ b.t }}</b><span>{{ b.d }}</span></div>
              <div class="pltb">
                <button class="ib3" title="Назад" (click)="page.set(max(1, page() - 1))"><app-icon name="backArrow" /></button><span>{{ page() }} / 12</span
                ><button class="ib3 flip" title="Вперед" (click)="page.set(min(12, page() + 1))"><app-icon name="backArrow" /></button>
              </div>
            </div>
          }
          @case ('pdf') {
            <div class="plpdf">
              <div class="pltb top">
                <span><app-icon name="tkFile" />{{ b.t }}.pdf</span><span class="plpg">страница {{ page() }} из 8</span
                ><button class="ib3" title="Назад" (click)="page.set(max(1, page() - 1))"><app-icon name="backArrow" /></button
                ><button class="ib3 flip" title="Вперед" (click)="page.set(min(8, page() + 1))"><app-icon name="backArrow" /></button>
              </div>
              <div class="plpage"><b>{{ b.t }}</b><i></i><i></i><i class="s"></i><i></i><i></i><i></i><i class="s"></i><i></i><i></i></div>
            </div>
          }
          @case ('test') {
            @if (s.st().done.includes(s.i())) {
              <div class="lfres ok inl"><app-icon name="pliOk" /><b>Тест сдан</b><span>Порог {{ pass }}% набран, модуль засчитан.</span></div>
            } @else {
              @let failed = s.st().fail.includes(s.i());
              @let left = s.store.tries(s.id());
              @if (failed) {
                <div class="lfres dg inl">
                  <app-icon name="pliFail" /><b>Неудачная попытка</b
                  ><span>Порог {{ pass }}% не набран. {{ left ? 'Осталось попыток: ' + left + '.' : 'Попытки исчерпаны — обратитесь к администратору обучения.' }}</span>
                </div>
              }
              @if (failed && !left) {
                <div class="plnav" style="margin-top: 0">
                  <button class="btn raised" (click)="toast.show('Администратор обучения', 'Запрос на дополнительную попытку отправлен в отдел обучения.')">Связаться с администратором</button>
                </div>
              } @else {
                <p class="pld">3 вопроса, проходной порог {{ pass }}%. Осталось попыток: {{ left }}.</p>
                @for (q of quiz(); track $index; let qi = $index) {
                  <div class="plq">
                    <b>{{ qi + 1 }}. К какому разделу курса относится тема «{{ q.t }}»?</b>
                    @for (sec of sections(); track $index; let i = $index) {
                      <label class="plo"><input type="radio" [name]="'q' + qi" [checked]="answers()[qi] === i" (change)="answer(qi, i)" /><span>{{ sec }}</span></label>
                    }
                  </div>
                }
                <div class="plnav" style="margin-top: 0"><button class="btn pri" (click)="check()">Проверить</button></div>
              }
            }
          }
          @case ('task') {
            @if (s.st().done.includes(s.i())) {
              <div class="lfres ok inl"><app-icon name="pliOk" /><b>Задание засчитано</b><span>Куратор проверил работу, модуль пройден.</span></div>
            } @else if (s.st().review.includes(s.i())) {
              <div class="lfres warn inl">
                <app-icon name="clock" /><b>На проверке</b><span>Куратор проверит задание в течение трех рабочих дней, результат придет уведомлением.</span>
              </div>
            } @else {
              @if (s.st().fail.includes(s.i())) {
                <div class="lfres dg inl">
                  <app-icon name="pliFail" /><b>Задание не засчитано</b
                  ><span>Комментарий куратора: не хватает проверки лимитов по 115-ФЗ, доработайте расчет и отправьте заново.</span>
                </div>
              }
              <p class="pld">Выполните задание по материалам раздела и прикрепите файлы с результатом — куратор проверит и засчитает модуль.</p>
              <div class="pltask">
                <div class="pldrop" (click)="files.set([...files(), taskFiles[files().length % taskFiles.length]])">
                  <app-icon name="uploadBig" /><b>Перетащите файлы сюда или <u>выберите на компьютере</u></b><small>PDF, DOCX, XLSX, PNG или JPG · до 20 МБ каждый</small>
                </div>
                <div class="tkfiles">
                  @for (f of files(); track $index; let i = $index) {
                    <span class="tkfile"
                      ><span class="tkfi"><app-icon name="tkFile" /></span><span class="tkfn"><b>{{ f[0] }}</b><small>{{ f[1] }}</small></span
                      ><span class="tkfx" title="Убрать" (click)="removeFile(i)"><app-icon name="close" /></span
                    ></span>
                  }
                </div>
              </div>
              <div class="plnav" style="margin-top: 0"><button class="btn pri" [disabled]="!files().length" (click)="send()">Отправить на проверку</button></div>
            }
          }
        }
      </div>
      <div class="plnav">
        <button class="btn raised" [disabled]="!s.i()" (click)="s.i.set(s.i() - 1)">Предыдущий модуль</button>
        @if (s.i() < s.blocks().length - 1) {
          <button class="btn pri" (click)="s.seen(s.i()); s.i.set(s.i() + 1)">Следующий модуль</button>
        } @else {
          <button class="btn pri" (click)="s.seen(s.i()); s.finish()">Завершить</button>
        }
      </div>
    }
  `,
  host: { class: 'c full plmain' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerMain {
  protected readonly s = inject(PlayerState);
  protected readonly toast = inject(ToastService);
  private readonly nav = inject(NavService);
  readonly lt = input('');
  protected readonly type = TYPE;
  protected readonly pass = LEARN_PASS;
  protected readonly taskFiles = LEARN_TASK_FILES;
  protected readonly max = Math.max;
  protected readonly min = Math.min;
  protected readonly page = signal(1);
  protected readonly answers = signal<Record<number, number>>({});
  protected readonly files = signal<[string, string][]>([]);
  protected readonly stars = signal(0);
  protected readonly fb = signal('');
  protected readonly img = computed(() => this.s.store.imgOf('crs', this.s.id()));
  protected readonly sections = computed(() => (LEARN_COURSE_INFO[this.s.id()]?.s || []).map((x) => x[0]));
  /** 3 вопроса по структуре курса: первый, средний и последний модуль теории */
  protected readonly quiz = computed(() => {
    const B = this.s.blocks().filter((b) => b.k !== 'test' && b.k !== 'task');
    return B.length ? [B[0], B[Math.floor(B.length / 2)], B[B.length - 1]] : [];
  });

  constructor() {
    effect(() => {
      this.s.i();
      this.s.id();
      untracked(() => {
        this.page.set(1);
        this.answers.set({});
        this.files.set([]);
      });
    });
  }

  protected answer(qi: number, i: number): void {
    this.answers.update((a) => ({ ...a, [qi]: i }));
  }
  protected check(): void {
    const Q = this.quiz(), A = this.answers(), k = this.s.i(), id = this.s.id();
    if (Object.keys(A).length < Q.length) return this.toast.show('Тест', 'Ответьте на все вопросы.');
    const ok = Q.filter((b, qi) => A[qi] === b.si).length;
    if (Math.round((ok / Q.length) * 100) >= LEARN_PASS) {
      this.s.patch((x) => {
        x.fail.delete(k);
        x.done.add(k);
      });
      this.toast.show('Тест сдан', ok + ' из ' + Q.length + ' — модуль засчитан.');
    } else {
      this.s.patch((x) => x.fail.add(k));
      this.s.store.attempts.update((a) => ({ ...a, [id]: Math.max(0, this.s.store.tries(id) - 1) }));
      this.toast.show('Тест не сдан', ok + ' из ' + Q.length + ' — порог ' + LEARN_PASS + '% не набран.');
    }
    this.answers.set({});
  }
  protected removeFile(i: number): void {
    this.files.update((l) => l.filter((_, k) => k !== i));
  }
  protected send(): void {
    const k = this.s.i(), n = this.files().length;
    this.s.patch((x) => {
      x.fail.delete(k);
      x.review.add(k);
    });
    this.toast.show('Отправлено', n + ' файл(а) ушли куратору на проверку.');
  }
  protected later(): void {
    this.nav.go('dev', { lt: 'my' });
  }
  protected sendFb(): void {
    const v = this.stars(), txt = this.fb().trim();
    if (!v || !txt) return this.toast.show('Отзыв', 'Поставьте оценку и напишите пару слов.');
    this.s.store.comments.update((c) => [['avme', 'Иванов Павел Сергеевич', 'сегодня', v, txt], ...c]);
    this.toast.show('Спасибо', 'Отзыв появится в комментариях к курсу.');
    this.nav.go('dev', { lt: 'my' });
  }
}
