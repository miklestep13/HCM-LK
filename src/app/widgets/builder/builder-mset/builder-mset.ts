import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { BLD_CURATORS, BLD_CUR_ALGS, BLD_SCORES } from '../../../data/builder.data';
import { BldModule } from '../../../interface/builder';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { NumInput } from '../../../shared/ui/num-input/num-input';
import { Select } from '../../../shared/ui/select/select';
import { Suggest } from '../../../shared/ui/suggest/suggest';
import { BuilderState } from '../builder.state';

/**
 * Настройки модуля курса под его описанием — скрываемый блок (по умолчанию свернут, шеврон слева):
 * «Тестирование» — вид оценки, проходной процент, количество попыток, время изучения, «Все учебные материалы просмотрены»,
 * «Показывать отчет о результатах», «Показывать варианты ответов в отчете»;
 * «Задание» — алгоритм определения куратора, куратор (при «Вручную», поиск по сотрудникам), баллы, «Куратору доступен перевод задания в статус „Не принято“».
 */
@Component({
  selector: '[bld-mset]',
  imports: [Field, Select, Icon, Suggest, NumInput],
  template: `
    @let M = m();
    @let _v = s.ver();
    <div class="bldmsh" (click)="cold.set(!cold())">
      <span class="actb cfar"><app-icon name="chevSm" /></span>
      <b>Настройки {{ M.test ? 'тестирования' : 'задания' }}</b>
    </div>
    @if (!cold()) {
      <div class="bldmsb">
        @if (M.test; as t) {
          <app-field label="Вид оценки" filled>
            <app-select [options]="scores" [value]="t.score" (valueChange)="t.score = $event; s.touch()" />
          </app-field>
          <app-field [label]="t.score === 'Баллы' ? 'Проходной балл' : 'Проходной процент'" required [filled]="t.pass != null">
            <app-num-input [min]="0" [max]="t.score === 'Баллы' ? null : 100" [value]="str(t.pass)" (valueChange)="t.pass = num($event); s.touch()" />
          </app-field>
          <app-field label="Количество попыток" required [filled]="t.tries != null">
            <app-num-input [min]="1" [value]="str(t.tries)" (valueChange)="t.tries = num($event); s.touch()" />
          </app-field>
          <app-field label="Время изучения" [filled]="!!t.time">
            <input class="fin" placeholder="Например: 30 мин" [value]="t.time" (input)="t.time = $any($event.target).value; s.touch()" />
          </app-field>
          <label class="ckb"><input type="checkbox" [checked]="t.allSeen" (change)="t.allSeen = $any($event.target).checked; s.touch()" /><i></i><span>Все учебные материалы просмотрены</span></label>
          <label class="ckb"><input type="checkbox" [checked]="t.report" (change)="t.report = $any($event.target).checked; s.touch()" /><i></i><span>Показывать отчет о результатах</span></label>
          <label class="ckb"><input type="checkbox" [checked]="t.reportAns" [disabled]="!t.report" (change)="t.reportAns = $any($event.target).checked; s.touch()" /><i></i><span>Показывать варианты ответов в отчете</span></label>
        }
        @if (M.task; as k) {
          <app-field label="Алгоритм определения куратора" filled>
            <app-select [options]="algs" [value]="k.alg" (valueChange)="k.alg = $event; s.touch()" />
          </app-field>
          @if (k.alg === 'Вручную') {
            <app-field label="Куратор" required [filled]="!!k.cur">
              <input class="fin" placeholder="Начните вводить ФИО" [value]="k.cur" [appSuggest]="curators" (input)="k.cur = $any($event.target).value; s.touch()" (suggestPick)="k.cur = $event; s.touch()" />
            </app-field>
          } @else {
            <div></div>
          }
          <app-field label="Баллы" required [filled]="k.pts != null">
            <app-num-input [min]="0" [value]="str(k.pts)" (valueChange)="k.pts = num($event); s.touch()" />
          </app-field>
          <label class="ckb"><input type="checkbox" [checked]="k.reject" (change)="k.reject = $any($event.target).checked; s.touch()" /><i></i><span>Куратору доступен перевод задания в статус «Не принято»</span></label>
        }
      </div>
    }
  `,
  host: { class: 'bldms', '[class.cold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldMset {
  readonly m = input.required<BldModule>();
  protected readonly s = inject(BuilderState);
  /** свернут по умолчанию */
  protected readonly cold = signal(true);
  protected readonly scores = BLD_SCORES;
  protected readonly algs = BLD_CUR_ALGS;
  protected readonly curators = BLD_CURATORS;
  protected num(v: string): number | null {
    return v === '' || v === '-' ? null : +v;
  }
  protected str(n: number | null): string {
    return n == null ? '' : String(n);
  }
}
