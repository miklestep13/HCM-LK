import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { goalLetterCap, goalScaleRows } from '../../../core/demo/goals-store.service';
import { GOAL_SCALES } from '../../../data/goals.data';
import { Attach } from '../../../shared/ui/attach/attach';
import { Field } from '../../../shared/ui/field/field';
import { MygoalviewState } from '../mygoalview.state';

/**
 * Блок «Оценка» на самооценке: количественная — оценка по фактическому результату (сразу итоговая), качественная — A–E;
 * у бинарной выбор — в «Показателе и критериях», здесь — итоговая оценка по нему. Комментарий и документы.
 */
@Component({
  selector: '[mygoalview-self]',
  imports: [Field, Attach],
  template: `
    @let S = s.self();
    <div class="ch"><h3>{{ title() }}</h3></div>
    <div class="cb">
      @if (s.F().kind === 'num') {
        <div class="glsrg glrauto">
          @if (S.o) {
            <span class="clbg" [class]="'g' + S.o">{{ S.o }}</span>{{ cap(S.o) }}
          } @else {
            <span class="gr">Оценка появится по фактическому результату</span>
          }
        </div>
      } @else if (s.F().kind === 'str') {
        <!-- бинарная: результат выбирается в «Показателе и критериях», здесь — итоговая оценка по нему -->
        <div class="glvkv glrfin">
          <span class="l">Итоговая оценка</span>
          <span class="glsrg glrauto">
            @if (S.o) {
              <span class="clbg" [class]="'g' + S.o">{{ S.o }}</span>{{ cap(S.o) }}
            } @else {
              <span class="gr">Оценка появится после выбора результата</span>
            }
          </span>
        </div>
      } @else if (s.F().kind === 'txt') {
        <div class="glsrf glsrb">
          <div class="fld">
            <div class="seg clbseg">
              @for (r of rows(); track r[1]) {
                <span [class.on]="S.o === r[1]" (click)="pick(r[1], r[0])">{{ r[1] }}</span>
              }
            </div>
          </div>
          <div class="glsrg">
            @if (S.o) {
              <span class="clbg" [class]="'g' + S.o">{{ S.o }}</span>{{ cap(S.o) }}
            } @else {
              <span class="gr">Оценка появится после выбора</span>
            }
          </div>
        </div>
      }
      <div class="frm glf glvcm">
        <app-field label="Комментарий" full [filled]="!!S.cm">
          <textarea class="fta" rows="3" [value]="S.cm || ''" (input)="setCm($event)"></textarea>
        </app-field>
      </div>
      <div class="glvsch">Документы</div>
      <app-attach edit [(files)]="s.selfDocs" />
      @if (s.selfErr()) {
        <div class="pqerr">{{ s.selfErr() }}</div>
      }
    </div>
  `,
  host: { class: 'c mb glvself glroev' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewSelf {
  protected readonly s = inject(MygoalviewState);
  /** заголовок: «Оценка»; у качественной цели под таблицей оценок — «Ваша оценка» */
  readonly title = input('Оценка');
  protected readonly cap = goalLetterCap;
  protected readonly rows = computed(() => (goalScaleRows(this.s.F()).length ? goalScaleRows(this.s.F()) : GOAL_SCALES['Пятиуровневая (A–E)']));
  protected pick(o: string, n: string): void {
    this.s.self.update((x) => ({ ...x, o, n }));
    this.s.selfErr.set('');
  }
  protected setCm(e: Event): void {
    const v = (e.target as HTMLTextAreaElement).value;
    this.s.self.update((x) => ({ ...x, cm: v }));
  }
}
