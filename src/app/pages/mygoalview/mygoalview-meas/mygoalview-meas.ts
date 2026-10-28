import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { goalGrade, goalLetterCap, goalNum, goalUnit } from '../../../core/demo/goals-store.service';
import { GOAL_BIN, GOAL_KINDS } from '../../../data/goals.data';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { MygoalviewState } from '../mygoalview.state';
import { MygoalviewScale } from '../mygoalview-scale/mygoalview-scale';

/**
 * «Показатель и критерии» в формате инфо: тип и единица, план и факт (на самооценке факт вводится, оценка считается по шкале),
 * у бинарной — результат «Выполнено / Не выполнено» (на самооценке выбирается); шкала оценки.
 */
@Component({
  selector: '[mygoalview-meas]',
  imports: [Icon, Field, MygoalviewScale],
  template: `
    @let F = s.F();
    @let S = s.self();
    <div class="ch">
      <button class="actb ipcol" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())"><app-icon name="chevSm" /></button>
      <h3>Показатель и критерии</h3>
    </div>
    <div class="cb">
      <div class="glvw">
        <div class="glvrow two">
          <div class="glvkv"><span class="l">Тип измерения</span>{{ kinds[F.kind] }}</div>
          @if (F.kind === 'num') {
            <div class="glvkv"><span class="l">Единица измерения</span>{{ u() || '—' }}</div>
          }
          @if (F.kind === 'str') {
            @if (edit()) {
              <div class="glvkv glbres">
                <span class="l">Результат<em>*</em></span>
                <div>
                  <div class="glsrf glsrb">
                    <div class="fld">
                      <div class="seg clbseg glbseg">
                        @for (b of bin; track b[1]) {
                          <span [class.on]="S.o === b[1]" (click)="pick(b[1], b[0])">{{ b[0] }}</span>
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
                </div>
              </div>
            } @else {
              <div class="glvkv">
                <span class="l">Результат</span>
                @if (g().self?.o) {
                  <span class="glsv"><span class="clbg" [class]="'g' + g().self!.o">{{ g().self!.o }}</span>{{ g().self!.n }}</span>
                } @else {
                  —
                }
              </div>
            }
          }
        </div>
        @if (F.kind === 'num') {
          <div class="glvrow two glvrf">
            <div class="glvkv"><span class="l">Плановый результат</span>{{ plan() }}</div>
            @if (edit()) {
              <div class="frm glf glrfact">
                <app-field label="Фактический результат" required [filled]="fact() !== ''">
                  <div class="numin glpfu">
                    <input class="fin" inputmode="decimal" [value]="fact()" (input)="setFact($event)" /><span class="nusf">{{ u() }}</span>
                  </div>
                </app-field>
              </div>
            } @else {
              <div class="glvkv"><span class="l">Фактический результат</span>{{ g().self?.fact != null ? num(g().self!.fact!) + us() : '—' }}</div>
            }
          </div>
        }
        @if (F.kind === 'str') {
          <div class="glmsh glvmsh">Шкала оценки</div>
          <div class="glvkv"><span class="l">Шкала</span>Бинарная</div>
          <div class="glsct glbtbl">
            <div class="tw">
              <table class="tbl">
                <thead>
                  <tr><th style="width: 96px">Значение</th><th style="width: 280px">Описание</th><th>Критерий достижения</th></tr>
                </thead>
                <tbody>
                  @for (b of bin; track b[1]) {
                    <tr><td><span class="clbg" [class]="'g' + b[1]">{{ b[1] }}</span></td><td>{{ b[0] }}</td><td>{{ b[2] }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else {
          <div class="glmsh glvmsh">Шкала оценки</div>
          <div class="glvkv"><span class="l">Шкала</span>{{ F.sc || 'Пятиуровневая (A–E)' }}</div>
          <div mygoalview-scale [on]="edit() ? S.o : ''"></div>
        }
      </div>
    </div>
  `,
  host: { class: 'c mb glvmeas ipsect', '[class.ipcold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewMeas {
  protected readonly s = inject(MygoalviewState);
  /** самооценка: фактический результат / результат бинарной вводится */
  readonly edit = input(false, { transform: booleanAttribute });
  protected readonly cold = signal(false);
  protected readonly kinds = GOAL_KINDS;
  protected readonly bin = GOAL_BIN;
  protected readonly num = goalNum;
  protected readonly g = computed(() => this.s.goal()!);
  protected readonly u = computed(() => goalUnit(this.s.F().u));
  protected readonly us = computed(() => (this.u() === '%' ? '%' : ' ' + this.u()));
  protected readonly plan = computed(() => {
    const F = this.s.F(), k = this.g().krs[0];
    const p = F.plan != null && F.plan !== '' ? F.plan : k && k.g !== '' && k.g != null ? k.g : '';
    return p !== '' ? goalNum(+p) + this.us() : '—';
  });
  protected readonly fact = computed(() => (this.s.self().fact != null ? String(this.s.self().fact).replace('.', ',') : ''));
  protected cap(o: string): string {
    return goalLetterCap(o);
  }
  protected pick(o: string, n: string): void {
    this.s.self.update((x) => ({ ...x, o, n }));
    this.s.selfErr.set('');
  }
  protected setFact(e: Event): void {
    const i = e.target as HTMLInputElement;
    i.value = i.value.replace(/[^\d.,]/g, '');
    const v = i.value.trim().replace(',', '.'), ok = v !== '' && !isNaN(+v), R = ok ? goalGrade(this.s.F(), +v) : null;
    this.s.self.update((x) => ({ ...x, fact: ok ? +v : null, o: R ? R.o : '', n: R ? R.n : '' }));
    this.s.selfErr.set('');
  }
}
