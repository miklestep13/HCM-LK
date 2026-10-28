import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { goalScaleRows } from '../../../core/demo/goals-store.service';
import { GOAL_SCALES } from '../../../data/goals.data';
import { MygoalviewState } from '../mygoalview.state';

/** Таблица шкалы оценки: значение, описание, критерий достижения; выбранный уровень подсвечен */
@Component({
  selector: '[mygoalview-scale]',
  template: `
    <div class="tw">
      <table class="tbl">
        <thead>
          <tr>
            <th style="width: 90px">Значение</th>
            <th>Описание</th>
            <th [style.width]="num() ? '220px' : '55%'">Критерий достижения</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r[1]; let i = $index) {
            <tr [class.on]="on() === r[1]">
              <td><span class="clbg" [class]="'g' + r[1]">{{ r[1] }}</span></td>
              <td>{{ r[0] }}</td>
              <td>{{ crit(i) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  host: { class: 'glsct glvsc', '[class.txt]': '!num()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewScale {
  private readonly s = inject(MygoalviewState);
  /** выбранный уровень */
  readonly on = input('');
  protected readonly num = computed(() => this.s.F().kind === 'num');
  protected readonly rows = computed(() => goalScaleRows(this.s.F()).length ? goalScaleRows(this.s.F()) : GOAL_SCALES['Пятиуровневая (A–E)']);
  protected crit(i: number): string {
    const F = this.s.F(), v = F.vals?.[i];
    if (v == null || v === '') return '—';
    const cu = F.cu ? (F.cu === '%' ? '%' : ' ' + F.cu) : this.s.us();
    return v + (this.num() ? cu : '');
  }
}
