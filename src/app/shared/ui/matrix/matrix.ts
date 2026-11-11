import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Матрица: утверждения (строки) × варианты шкалы (столбцы), в каждой строке — один ответ.
 * value — { утверждение: вариант }. <app-matrix [rows]="…" [cols]="…" [(value)]="m" />
 */
@Component({
  selector: 'app-matrix',
  template: `
    <div class="tw">
      <table class="mtx">
        <thead>
          <tr>
            <th></th>
            @for (c of cols(); track c) {
              <th>{{ c }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r) {
            <tr [class.done]="!!value()[r]">
              <td>{{ r }}</td>
              @for (c of cols(); track c) {
                <td>
                  <label class="rdb" [title]="c"><input type="radio" [name]="name + $index" [checked]="value()[r] === c" (change)="pick(r, c)" /><i></i></label>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  host: { class: 'matrix' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Matrix {
  readonly rows = input.required<string[]>();
  readonly cols = input.required<string[]>();
  readonly value = model<Record<string, string>>({});
  protected readonly name = 'mtx' + Math.random().toString(36).slice(2, 8);
  protected pick(r: string, c: string): void {
    this.value.set({ ...this.value(), [r]: c });
  }
}
