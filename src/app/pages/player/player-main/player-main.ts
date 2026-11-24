import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, ViewEncapsulation } from '@angular/core';
import { learnPlayKind } from '../../../core/demo/learn-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { LEARN_COURSE_INFO, LEARN_PASS, LEARN_TASK_FILES, LEARN_TRY } from '../../../data/learn-course.data';
import { KB_ARTICLES, KB_TYPES } from '../../../data/kb.data';
import { PlayerPart, playerParts } from '../../../data/learn-player.data';
import { Attach } from '../../../shared/ui/attach/attach';
import { Choice } from '../../../shared/ui/choice/choice';
import { Icon } from '../../../shared/ui/icon/icon';
import { Scale } from '../../../shared/ui/scale/scale';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { PlayerState } from '../player.state';

/** подписи видов при прохождении — только четыре */
const TYPE: Record<string, string> = { text: 'Модуль', test: 'Тест', task: 'Задание', poll: 'Опрос' };

/**
 * Модуль курса: заголовок, длительность и тип, описание, содержимое по типу (видео, текст, презентация, документ, тест, задание),
 * переход к предыдущему / следующему модулю или «Завершить». После завершения — итог и отзыв о курсе.
 * Если у модуля есть LEARN_PLAYER_PARTS — рендерим стек блоков (текст, медиа, файлы, БЗ, вопросы опроса/теста).
 */
@Component({
  selector: '[player-main]',
  imports: [Icon, Attach, Choice, Scale],
  styleUrl: './player-main.scss',
  template: `
    @if (s.finished()) {
      <div class="plscroll">
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
        </div>
      </div>
      <div class="plnav"><button class="btn raised" (click)="later()">Позже</button><button class="btn pri" (click)="sendFb()">Отправить отзыв</button></div>
    } @else if (s.cur(); as b) {
      <div class="plscroll">
      <div class="plhd">
        <h2>{{ b.t }}</h2>
        <span class="bmeta">
          @if (playKind(b.k) === 'test') {
            <app-icon name="cup" />{{ pass }}% · <app-icon name="refresh" />{{ tryLabel }} ·
          }
          <app-icon name="clock" />{{ b.m }} · {{ type[playKind(b.k)] }}
        </span>
      </div>
      <p class="pld">{{ b.d }}</p>
      <div class="plbody">
        @if (parts().length) {
          <div class="plparts">
            @for (p of parts(); track $index) {
              @switch (p.k) {
                @case ('text') {
                  <div class="bltext" [class.note]="p.note" [innerHTML]="p.html"></div>
                }
                @case ('image') {
                  <figure class="blimg">
                    <img [src]="p.src" alt="" />
                    @if (p.title) {
                      <figcaption>{{ p.title }}</figcaption>
                    }
                  </figure>
                }
                @case ('video') {
                  <div class="plvid" [style.background-image]="p.cover ? 'url(' + p.cover + ')' : null">
                    <span class="plvp"><app-icon name="playFill" /></span><span class="plvm">{{ p.title }}{{ p.dur ? ' · ' + p.dur : '' }}</span>
                  </div>
                }
                @case ('pdf') {
                  <div class="plpdf">
                    <div class="pltb top">
                      <span><app-icon name="tkFile" />{{ p.name }}</span><span class="plpg">страница 1 из 8</span>
                    </div>
                    <div class="plpage"><b>{{ p.title }}</b><i></i><i></i><i class="s"></i><i></i><i></i><i></i><i class="s"></i><i></i></div>
                  </div>
                }
                @case ('files') {
                  <div class="plfiles">
                    @if (p.title) {
                      <div class="blttl">{{ p.title }}</div>
                    }
                    <app-attach [files]="p.files" />
                  </div>
                }
                @case ('heading') {
                  <div class="blttl plsec">{{ p.title }}</div>
                }
                @case ('kb') {
                  @let a = article(p.art);
                  @if (a) {
                    <div class="blkb">
                      @if (a.cover) {
                        <span class="blkbi" [style.background-image]="'url(' + a.cover + ')'"></span>
                      }
                      <div>
                        <small><app-icon name="mKb" />База знаний · {{ kbType[a.type] }}</small>
                        <b>{{ a.title }}</b>
                        <p>{{ a.excerpt }}</p>
                        <span class="lnk">Читать статью</span>
                      </div>
                    </div>
                  }
                }
                @case ('q') {
                  <div class="sq" [class.done]="filled(p.id)">
                    <span class="sqn">Вопрос {{ qNum(p.id) }}</span>
                    <div class="sqt">{{ p.n }}@if (p.req) {<span class="sqreq" title="Обязательный вопрос">*</span>}</div>
                    @if (p.d) {
                      <div class="sqd">{{ p.d }}</div>
                    }
                    <div class="sqa">
                      @switch (p.t) {
                        @case ('one') {
                          <app-choice [options]="p.opts!" [value]="$any(ans()[p.id])" (valueChange)="setAns(p.id, $event)" />
                        }
                        @case ('many') {
                          <app-choice multi [options]="p.opts!" [value]="$any(ans()[p.id]) ?? []" (valueChange)="setAns(p.id, $event)" />
                        }
                        @case ('yesno') {
                          <app-scale class="sqyn" [items]="p.opts || ['Да', 'Нет']" [value]="$any(ans()[p.id]) ?? null" (valueChange)="setAns(p.id, $event)" />
                        }
                        @case ('scale') {
                          <app-scale [from]="1" [to]="5" [value]="$any(ans()[p.id]) ?? null" (valueChange)="setAns(p.id, $event)" />
                        }
                        @case ('nps') {
                          <app-scale nps [from]="0" [to]="10" [value]="$any(ans()[p.id]) ?? null" (valueChange)="setAns(p.id, $event)" />
                        }
                        @case ('long') {
                          <textarea class="fta sqta" rows="4" placeholder="Ваш ответ" [value]="$any(ans()[p.id]) || ''" (input)="setAns(p.id, $any($event.target).value)"></textarea>
                        }
                      }
                    </div>
                    @if (p.cm) {
                      <textarea class="fta sqcm" rows="2" placeholder="Комментарий к оценке (необязательно)" [value]="cm()[p.id] || ''" (input)="setCm(p.id, $any($event.target).value)"></textarea>
                    }
                  </div>
                }
              }
            }
          </div>
          @if (b.k === 'test' && !s.st().done.includes(s.i()) && s.st().fail.includes(s.i())) {
            <div class="lfres dg inl" style="margin-top: 16px">
              <app-icon name="pliFail" /><b>Неудачная попытка</b
              ><span
                >Порог {{ pass }}% не набран. {{ s.store.tries(s.id()) ? 'Осталось попыток: ' + s.store.tries(s.id()) + '.' : 'Попытки исчерпаны — обратитесь к администратору обучения.' }}</span
              >
            </div>
            @if (!s.store.tries(s.id())) {
              <div class="plnav" style="margin-top: 12px">
                <button class="btn raised" (click)="toast.show('Администратор обучения', 'Запрос на дополнительную попытку отправлен в отдел обучения.')">Связаться с администратором</button>
              </div>
            }
          }
          @if ((b.k === 'poll' || b.k === 'test') && s.st().done.includes(s.i())) {
            <div class="lfres ok inl" style="margin-top: 16px">
              <app-icon name="pliOk" /><b>{{ b.k === 'test' ? 'Тест сдан' : 'Ответы отправлены' }}</b
              ><span>{{ b.k === 'test' ? 'Порог ' + pass + '% набран, модуль засчитан.' : 'Спасибо — обратная связь поможет улучшить курс.' }}</span>
            </div>
          }
        } @else {
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
            @case ('poll') {
              @if (s.st().done.includes(s.i())) {
                <div class="lfres ok inl"><app-icon name="pliOk" /><b>Ответы отправлены</b><span>Спасибо — обратная связь поможет улучшить курс.</span></div>
              } @else {
                <p class="pld">Короткий опрос по модулю. Ответы анонимные и используются только для улучшения курса.</p>
                <div class="plq">
                  <b>Насколько понятен материал?</b>
                  <div class="lfstars">
                    @for (k of [1, 2, 3, 4, 5]; track k) {
                      <span [class.on]="k <= stars()" (click)="stars.set(k)">★</span>
                    }
                  </div>
                </div>
                <textarea class="fta" rows="3" placeholder="Что было самым полезным?" [value]="fb()" (input)="fb.set($any($event.target).value)"></textarea>
              }
            }
          }
        }
      </div>
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
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerMain {
  protected readonly s = inject(PlayerState);
  protected readonly toast = inject(ToastService);
  private readonly nav = inject(NavService);
  readonly lt = input('');
  protected readonly type = TYPE;
  protected readonly playKind = learnPlayKind;
  protected readonly pass = LEARN_PASS;
  /** «N попытка/попытки/попыток» — настройки тестирования */
  protected readonly tryLabel = (() => {
    const n = LEARN_TRY;
    const m = n % 10, t = n % 100;
    const w = m === 1 && t !== 11 ? 'попытка' : m >= 2 && m <= 4 && (t < 10 || t > 20) ? 'попытки' : 'попыток';
    return n + ' ' + w;
  })();
  protected readonly taskFiles = LEARN_TASK_FILES;
  protected readonly kbType = KB_TYPES;
  protected readonly max = Math.max;
  protected readonly min = Math.min;
  protected readonly page = signal(1);
  protected readonly answers = signal<Record<number, number>>({});
  protected readonly ans = signal<Record<string, unknown>>({});
  protected readonly cm = signal<Record<string, string>>({});
  protected readonly files = signal<[string, string][]>([]);
  protected readonly stars = signal(0);
  protected readonly fb = signal('');
  protected readonly img = computed(() => this.s.store.imgOf('crs', this.s.id()));
  protected readonly sections = computed(() => (LEARN_COURSE_INFO[this.s.id()]?.s || []).map((x) => x[0]));
  protected readonly parts = computed(() => playerParts(this.s.id(), this.s.i()));
  protected readonly qIds = computed(() => this.parts().filter((p): p is Extract<PlayerPart, { k: 'q' }> => p.k === 'q').map((p) => p.id));
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
        this.ans.set({});
        this.cm.set({});
        this.files.set([]);
        this.stars.set(0);
        this.fb.set('');
      });
    });
  }

  protected article(id: string) {
    return KB_ARTICLES.find((x) => x.id === id) ?? null;
  }
  protected qNum(id: string): number {
    return this.qIds().indexOf(id) + 1;
  }
  protected filled(id: string): boolean {
    const v = this.ans()[id];
    return v != null && v !== '' && !(Array.isArray(v) && !v.length);
  }
  protected setAns(id: string, v: unknown): void {
    this.ans.update((a) => ({ ...a, [id]: v }));
  }
  protected setCm(id: string, v: string): void {
    this.cm.update((a) => ({ ...a, [id]: v }));
  }
  protected answer(qi: number, i: number): void {
    this.answers.update((a) => ({ ...a, [qi]: i }));
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
