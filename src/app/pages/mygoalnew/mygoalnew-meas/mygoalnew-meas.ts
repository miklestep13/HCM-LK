import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { goalTvDef } from '../../../core/demo/goals-store.service';
import { GOAL_BIN, GOAL_KINDS, GOAL_SCALES, GOAL_UNITS } from '../../../data/goals.data';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MygoalnewState } from '../mygoalnew.state';

/**
 * «Показатель и критерии»: тип и единица измерения; у количественной — плановый и фактический (только просмотр) результат,
 * шкала и критерии достижения по уровням (в % от плана или в единице цели); у качественной — тексты критериев; у бинарной — «Выполнено / Не выполнено».
 */
@Component({
  selector: '[mygoalnew-meas]',
  imports: [Field, Select],
  template: `
    @let k = s.kind();
    <div class="ch"><h3>Показатель и критерии</h3></div>
    <div class="cb">
      <div class="frm glf3">
        <app-field label="Тип измерения" required filled>
          <app-select [options]="kindNames" [value]="kinds[k]" (valueChange)="setKind($event)" />
        </app-field>
        <app-field class="glu glunf" [class.hidden]="k !== 'num'" label="Единица измерения" required filled>
          <app-select [options]="units" [value]="s.u()" (valueChange)="setUnit($event)" />
        </app-field>
        <app-field class="glnum newrow" [class.hidden]="k !== 'num'" label="Плановый результат" required [filled]="!!s.plan()">
          <div class="numin glpfu">
            <input class="fin" inputmode="decimal" [value]="s.plan()" (input)="s.plan.set($any($event.target).value.trim())" /><span class="nusf glunit">{{ s.u() }}</span>
          </div>
        </app-field>
        <app-field class="dis glnum" [class.hidden]="k !== 'num'" label="Фактический результат" [filled]="!!s.fact()">
          <div class="numin glpfu cudis">
            <input class="fin" disabled [value]="s.fact()" /><span class="nusf glunit">{{ s.u() }}</span>
          </div>
        </app-field>
        <div class="glmsh">Шкала оценки</div>
        <app-field class="glscf" [class.hidden]="k === 'str'" label="Шкала" required full filled>
          <app-select [options]="scales" [value]="s.sc()" (valueChange)="s.setScale($event)" />
        </app-field>
      </div>
      <div class="glfk">
        @if (k === 'txt') {
          <div class="glsct txt">
            <div class="tw">
              <table class="tbl">
                <thead>
                  <tr><th style="width: 96px">Значение</th><th style="width: 280px">Описание</th><th>Критерий достижения</th></tr>
                </thead>
                <tbody>
                  @for (r of s.rows(); track r[1]; let i = $index) {
                    <tr>
                      <td><span class="clbg" [class]="'g' + r[1]">{{ r[1] }}</span></td>
                      <td>{{ r[0] }}</td>
                      <td class="glkd">
                        <textarea class="fta gltv" rows="2" [attr.aria-label]="'Критерий для ' + r[1]" [value]="s.tv()[i] ?? def()[i]" (input)="setTv(i, $event)"></textarea>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="fhelp gltvh">
              @if (tvChanged()) {
                <button class="lnk" (click)="tvReset()">Вернуть текст по умолчанию</button>
              }
            </div>
          </div>
        }
        @if (k === 'str') {
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
        }
        @if (k === 'num') {
          <div class="glsct glkc">
            <div class="tw">
              <table class="tbl">
                <thead>
                  <tr>
                    <th style="width: 96px">Значение</th>
                    <th>Описание</th>
                    <th style="width: 340px">
                      <span class="glcuh"
                        >Критерий достижения
                        @if (s.u() !== '%') {
                          <app-select class="glcus" title="Единица критерия: процент от плана или единица цели" [options]="['%', s.u()]" [(value)]="s.cu" />
                        } @else {
                          , %
                        }
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of s.rows(); track r[1]; let i = $index) {
                    <tr>
                      <td><span class="clbg" [class]="'g' + r[1]">{{ r[1] }}</span></td>
                      <td>{{ r[0] }}</td>
                      <td>
                        <div class="glpwt glcv">
                          <input
                            class="fin glscv"
                            inputmode="decimal"
                            [attr.aria-label]="'Значение для ' + r[1]"
                            [value]="s.vals()[i] ?? ''"
                            [attr.style]="'padding-right:calc(22px + ' + (s.cu() || '%').length + 'ch)!important'"
                            (input)="setVal(i, $event)"
                          /><span>{{ s.cu() || '%' }}</span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  host: { class: 'c mb glmeas' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalnewMeas {
  protected readonly s = inject(MygoalnewState);
  private readonly toast = inject(ToastService);
  protected readonly kinds = GOAL_KINDS;
  protected readonly kindNames = Object.values(GOAL_KINDS);
  protected readonly units = GOAL_UNITS;
  protected readonly scales = Object.keys(GOAL_SCALES);
  protected readonly bin = GOAL_BIN;
  protected readonly def = computed(() => goalTvDef(this.s.sc()));
  protected readonly tvChanged = computed(() => this.s.tv().some((x, i) => x !== this.def()[i]));

  protected setKind(name: string): void {
    this.s.kind.set(Object.keys(GOAL_KINDS).find((k) => GOAL_KINDS[k] === name) || 'num');
  }
  protected setUnit(u: string): void {
    const old = this.s.u();
    this.s.u.set(u);
    if (this.s.cu() === old && old !== '%') this.s.cu.set(u);
  }
  protected setVal(i: number, e: Event): void {
    const v = (e.target as HTMLInputElement).value.trim();
    this.s.vals.update((l) => l.map((x, k) => (k === i ? v : x)));
    this.s.err.set('');
  }
  protected setTv(i: number, e: Event): void {
    const v = (e.target as HTMLTextAreaElement).value;
    this.s.tv.update((l) => {
      const n = [...l];
      n[i] = v;
      return n;
    });
  }
  protected tvReset(): void {
    this.s.tv.set(goalTvDef(this.s.sc()));
    this.toast.show('Текст критериев', 'Вернули текст по умолчанию.');
  }
}
