import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output, signal } from '@angular/core';
import { PollQuestion } from '../../../interface/poll';
import { Attach } from '../../../shared/ui/attach/attach';
import { Icon } from '../../../shared/ui/icon/icon';
import { AttachFile } from '../../../interface/attach';
import { Choice } from '../../../shared/ui/choice/choice';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Matrix } from '../../../shared/ui/matrix/matrix';
import { Rank } from '../../../shared/ui/rank/rank';
import { Rating } from '../../../shared/ui/rating/rating';
import { Scale } from '../../../shared/ui/scale/scale';
import { Select } from '../../../shared/ui/select/select';
import { Slider } from '../../../shared/ui/slider/slider';

/**
 * Вопрос «как увидит сотрудник» (конструктор, предпросмотр, форма опроса): как на странице прохождения (pages/survey) — «Вопрос N», заголовок с *,
 * описание и поле ответа из тех же компонентов (choice, scale, rating, matrix, rank, slider, select, date-field, attach).
 * В превью можно ответить — ответ живет только здесь и ни на что не влияет.
 */
@Component({
  selector: '[bld-qview]',
  imports: [Choice, Scale, Rating, Matrix, Rank, Slider, Select, DateField, Attach, Icon],
  template: `
    @let Q = q();
    @let k = key();
    <span class="sqn">Вопрос {{ num() }}</span>
    @if (edit()) {
      <!-- конструктор: текст и описание правятся прямо в вопросе (рамка при наведении, как название модуля) -->
      <div class="sqt sqtw">
        <textarea class="bldin sqti" rows="1" placeholder="Текст вопроса" [value]="Q.n" (input)="Q.n = $any($event.target).value; edited.emit()"></textarea>
        @if (Q.req) {<span class="sqreq">*</span>}
      </div>
      <textarea class="bldin sqdi" rows="1" placeholder="Описание — необязательно" [value]="Q.d" (input)="Q.d = $any($event.target).value; edited.emit()"></textarea>
    } @else {
      <div class="sqt">{{ Q.n || 'Текст вопроса' }}@if (Q.req) {<span class="sqreq">*</span>}</div>
      @if (Q.d) {
        <div class="sqd">{{ Q.d }}</div>
      }
    }
    @if (Q.t === 'multi' && (Q.mn || Q.mx)) {
      <div class="sqd">Выберите {{ Q.mn ? 'от ' + Q.mn + ' ' : '' }}{{ Q.mx ? 'до ' + Q.mx : '' }}</div>
    }
    <div class="sqa" [class.sqfit]="edit() && edgeLabels.includes(Q.t)">
      @if (edit() && inline.includes(Q.t)) {
        @if (Q.t === 'matrix') {
          <!-- матрица: столбцы шкалы и утверждения правятся на месте -->
          <div class="sqem tw">
            <table class="mtx sqemx">
              <thead>
                <tr>
                  <th></th>
                  @for (c of Q.opts; track $index; let j = $index) {
                    <th>
                      <span class="sqecw"><textarea class="bldin sqec" rows="1" [placeholder]="'Столбец ' + (j + 1)" [value]="c" (input)="Q.opts[j] = $any($event.target).value; edited.emit()"></textarea>
                      <button class="sqex" title="Удалить столбец" [disabled]="Q.opts.length < 3" (click)="del(Q.opts, j)"><app-icon name="closeSm" /></button></span>
                    </th>
                  }
                  <th class="sqeac"><button class="sqeplus" title="Добавить столбец" (click)="add(Q.opts)"><app-icon name="plus" /></button></th>
                </tr>
              </thead>
              <tbody>
                @for (r of Q.rows; track $index; let i = $index) {
                  <tr>
                    <td class="sqer">
                      <span class="sqecw"><textarea class="bldin sqec l" rows="1" [placeholder]="'Утверждение ' + (i + 1)" [value]="r" (input)="Q.rows[i] = $any($event.target).value; edited.emit()"></textarea>
                      <button class="sqex" title="Удалить утверждение" [disabled]="Q.rows.length < 2" (click)="del(Q.rows, i, true)"><app-icon name="closeSm" /></button></span>
                    </td>
                    @for (c of Q.opts; track $index) {
                      <td><span class="sqemk"></span></td>
                    }
                    <td></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <button class="lnk sqeadd" (click)="add(Q.rows)">+ Добавить утверждение</button>
        } @else {
          <!-- варианты ответа правятся на месте и перетаскиваются за ручку; в тесте кружок / квадрат слева отмечает верный ответ -->
          @if (Q.t === 'rank') {
            <div class="sqeh rk">{{ graded() ? 'Расставьте варианты в правильном порядке — сотрудник увидит их перемешанными и должен будет восстановить порядок.' : 'Сотрудник расставит варианты по порядку перетаскиванием: наверху — самое важное. Здесь — порядок, в котором он их увидит.' }}</div>
          }
          <div class="sqe" [class]="'sqe sqe-' + Q.t">
            @for (o of Q.opts; track $index; let i = $index) {
              <div class="sqeo" [class.ok]="Q.ok?.includes(i)" [class.drag]="dragI() === i" (dragover)="dragOver($event, i)" (drop)="$event.preventDefault(); dragI.set(-1)">
                @if (Q.t !== 'yesno') {
                  <span class="sqeg" title="Перетащите вариант" draggable="true" (dragstart)="dragStart($event, i)" (dragend)="dragI.set(-1)"><app-icon name="grip" /></span>
                }
                @if (Q.t === 'rank') {
                  <span class="sqern">{{ i + 1 }}</span>
                } @else if (Q.t === 'drop') {
                  <span class="sqen">{{ i + 1 }}</span>
                } @else {
                  <button class="sqemk" [class.multi]="Q.t === 'multi'" [class.ok]="correct() && Q.ok?.includes(i)" [disabled]="!correct()"
                    [title]="correct() ? (Q.ok?.includes(i) ? 'Верный ответ' : 'Отметить как верный') : ''" (click)="toggleOk(i)"><app-icon name="checkSm" /></button>
                }
                <input class="bldin sqeoi" [placeholder]="'Вариант ' + (i + 1)" [value]="o" (input)="Q.opts[i] = $any($event.target).value; edited.emit()" />
                @if (Q.t !== 'yesno') {
                  <button class="sqex" title="Удалить вариант" [disabled]="Q.opts.length < 3" (click)="del(Q.opts, i)"><app-icon name="trashSm" /></button>
                }
              </div>
            }
            @if (Q.other && (Q.t === 'single' || Q.t === 'multi')) {
              <div class="sqeo oth"><span class="sqemk" [class.multi]="Q.t === 'multi'"></span><span>Другое — сотрудник впишет свой ответ</span></div>
            }
          </div>
          @if (Q.t !== 'yesno') {
            <button class="lnk sqeadd" (click)="add(Q.opts)">+ Добавить вариант</button>
          }
          @if (correct() && !Q.ok?.length) {
            <small class="sqeh">Отметьте {{ Q.t === 'multi' ? 'верные варианты' : 'верный вариант' }} кружком слева</small>
          }
        }
      } @else {
      @switch (Q.t) {
        @case ('single') {
          <app-choice [options]="Q.opts" [other]="Q.other" [value]="$any(v()[k])" (valueChange)="set(k, $event)" />
        }
        @case ('multi') {
          <app-choice multi [max]="+Q.mx || 0" [other]="Q.other" [options]="Q.opts" [value]="$any(v()[k]) ?? []" (valueChange)="set(k, $event)" />
        }
        @case ('drop') {
          <app-select class="sqsel" [options]="Q.opts" [search]="Q.srch" placeholder="Выберите вариант" [value]="$any(v()[k]) || ''" (valueChange)="set(k, $event)" />
        }
        @case ('yesno') {
          <app-scale [items]="Q.opts" [value]="$any(v()[k]) ?? null" (valueChange)="set(k, $event)" />
        }
        @case ('rating') {
          @if (Q.view === 'star' && Q.scale !== 11) {
            <app-rating [max]="Q.scale" [value]="$any(v()[k]) ?? null" (valueChange)="set(k, $event)" />
            @if ((Q.lo || Q.hi) && !edit()) {
              <div class="sclh pvstl"><span>1 — {{ Q.lo }}</span><span>{{ Q.scale }} — {{ Q.hi }}</span></div>
            }
          } @else {
            <app-scale [from]="Q.scale === 11 ? 0 : 1" [to]="Q.scale === 11 ? 10 : Q.scale" [minLabel]="edit() ? '' : Q.lo" [maxLabel]="edit() ? '' : Q.hi" [value]="$any(v()[k]) ?? null" (valueChange)="set(k, $event)" />
          }
        }
        @case ('enps') {
          <app-scale nps [from]="0" [to]="10" [minLabel]="edit() ? '' : Q.lo" [maxLabel]="edit() ? '' : Q.hi" [value]="$any(v()[k]) ?? null" (valueChange)="set(k, $event)" />
        }
        @case ('matrix') {
          <app-matrix [rows]="Q.rows" [cols]="Q.opts" [value]="$any(v()[k]) ?? {}" (valueChange)="set(k, $event)" />
        }
        @case ('rank') {
          <app-rank [options]="Q.opts" [value]="$any(v()[k]) ?? []" (valueChange)="set(k, $event)" />
        }
        @case ('slider') {
          <app-slider [min]="+Q.mn || 0" [max]="+Q.mx || 100" [step]="step()" [unit]="Q.unit" [minLabel]="edit() ? '' : Q.lo" [maxLabel]="edit() ? '' : Q.hi" [value]="$any(v()[k]) ?? null" (valueChange)="set(k, $event)" />
        }
        @case ('short') {
          @if (edit()) {
            <!-- конструктор: подсказка правится прямо в поле (серым — как ее увидит сотрудник) -->
            <input class="fin sqin sqph" title="Подсказка в поле" [placeholder]="'Подсказка в поле, например: ' + (shortPh[Q.fmt] || 'Ваш ответ')" [value]="Q.ph" (input)="Q.ph = $any($event.target).value; edited.emit()" />
          } @else {
            <input class="fin sqin" [placeholder]="Q.ph || shortPh[Q.fmt] || 'Ваш ответ'" [attr.maxlength]="Q.max || null" />
          }
        }
        @case ('long') {
          @let t = $any(v()[k]) || '';
          @if (edit()) {
            <textarea class="fta sqta sqph" rows="4" title="Подсказка в поле" placeholder="Подсказка в поле, например: Ваш ответ" [value]="Q.ph" (input)="Q.ph = $any($event.target).value; edited.emit()"></textarea>
          } @else {
            <textarea class="fta sqta" rows="4" [placeholder]="Q.ph || 'Ваш ответ'" [attr.maxlength]="Q.max || null" [value]="t" (input)="set(k, $any($event.target).value)"></textarea>
          }
          @if (Q.max) {
            <small class="sqcnt">{{ t.length }} / {{ Q.max }}</small>
          }
        }
        @case ('date') {
          <app-date-field class="sqdt" [value]="$any(v()[k]) || ''" (valueChange)="set(k, $event)" />
        }
        @case ('file') {
          <app-attach edit [files]="$any(v()[k]) ?? []" (filesChange)="set(k, $event)" />
          @if (Q.ph || Q.max) {
            <small class="sqcnt pvfh">{{ Q.ph }}{{ Q.max ? ' · до ' + Q.max + ' МБ' : '' }}</small>
          }
        }
      }
      @if (edit() && edgeLabels.includes(Q.t)) {
        <!-- подписи краев шкалы — на месте -->
        <div class="sqel">
          <input class="bldin" placeholder="Подпись минимума" [value]="Q.lo" (input)="Q.lo = $any($event.target).value; edited.emit()" />
          <input class="bldin r" placeholder="Подпись максимума" [value]="Q.hi" (input)="Q.hi = $any($event.target).value; edited.emit()" />
        </div>
      }
      }
    </div>
    @if (Q.cmt) {
      <!-- поле «Комментарий» под ответом (настройка вопроса) -->
      <textarea class="fta sqcm" rows="2" placeholder="Комментарий" [readOnly]="edit()" [value]="$any(v()[k + '~c']) || ''" (input)="set(k + '~c', $any($event.target).value)"></textarea>
    }
  `,
  styleUrl: './builder-qview.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'sq sqv' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldQview {
  readonly q = input.required<PollQuestion>();
  /** номер вопроса «1.2» или сквозной */
  readonly num = input<string | number>('');
  /** номер версии формы — чтобы перерисовать после правки изменяемого вопроса */
  readonly ver = input<unknown>(null);
  /** конструктор: текст и описание вопроса — поля прямо в вопросе */
  readonly edit = input(false, { transform: booleanAttribute });
  /** тест / курс: у вопроса есть правильный ответ (ранжирование — правильный порядок) */
  readonly graded = input(false, { transform: booleanAttribute });
  /** перетаскиваемый вариант */
  protected readonly dragI = signal(-1);
  /** тест / курс: у вариантов отмечается верный ответ */
  readonly correct = input(false, { transform: booleanAttribute });
  /** правка текста, описания или вариантов */
  readonly edited = output<void>();
  /** типы, у которых ответы правятся на месте списком (или матрицей) */
  protected readonly inline = ['single', 'multi', 'drop', 'rank', 'yesno', 'matrix'];
  /** типы с подписями краев шкалы */
  protected readonly edgeLabels = ['rating', 'enps', 'slider'];
  /** ответы в превью: ключ — тип и настройки вопроса (смена типа сбрасывает ответ) */
  protected readonly v = signal<Record<string, unknown>>({});
  protected readonly key = computed(() => {
    this.ver();
    const q = this.q();
    return [q.t, q.scale, q.view, q.opts.join('|'), q.rows.join('|')].join('~');
  });
  protected readonly shortPh: Record<string, string> = { Число: '0', Email: 'name@company.ru', Телефон: '+7 (___) ___-__-__', Дата: 'дд.мм.гггг' };
  protected readonly step = computed(() => {
    const span = (+this.q().mx || 100) - (+this.q().mn || 0);
    return span > 20 ? 5 : 1;
  });
  protected add(arr: string[]): void {
    arr.push('');
    this.edited.emit();
    // фокус в новое поле
    setTimeout(() => {
      const l = document.activeElement?.closest('.sqv')?.querySelectorAll<HTMLElement>(arr === this.q().rows ? '.sqer .bldin' : '.sqeoi, thead .bldin');
      l?.[l.length - 1]?.focus();
    });
  }
  /** удалить вариант (верные ответы сдвигаются) или строку матрицы */
  protected del(arr: string[], i: number, row = false): void {
    arr.splice(i, 1);
    const q = this.q();
    if (!row && q.ok) q.ok = q.ok.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x));
    this.edited.emit();
  }
  protected dragStart(e: DragEvent, i: number): void {
    e.dataTransfer?.setData('text/plain', '');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    const row = (e.target as HTMLElement).closest('.sqeo');
    if (row && e.dataTransfer) e.dataTransfer.setDragImage(row, 16, 16);
    this.dragI.set(i);
  }
  /** при наведении — сразу переставляем; верные ответы переезжают вместе с вариантами */
  protected dragOver(e: DragEvent, to: number): void {
    const from = this.dragI();
    if (from < 0) return;
    e.preventDefault();
    if (from === to) return;
    const q = this.q();
    const [x] = q.opts.splice(from, 1);
    q.opts.splice(to, 0, x);
    if (q.ok?.length) {
      const map = (k: number) => (k === from ? to : from < to && k > from && k <= to ? k - 1 : from > to && k >= to && k < from ? k + 1 : k);
      q.ok = q.ok.map(map).sort();
    }
    this.dragI.set(to);
    this.edited.emit();
  }
  protected toggleOk(i: number): void {
    const q = this.q(), ok = q.ok ?? [];
    q.ok = q.t === 'multi' ? (ok.includes(i) ? ok.filter((x) => x !== i) : [...ok, i].sort()) : [i];
    this.edited.emit();
  }
  protected set(k: string, x: unknown): void {
    this.v.set({ ...this.v(), [k]: x as string | AttachFile[] });
  }
}
