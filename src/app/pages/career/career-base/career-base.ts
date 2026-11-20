import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { CP_POSITION_DESC, CP_ROLE } from '../../../data/career-path.data';
import { CT_GRADES, CT_ROLE } from '../../../data/career-track.data';

/**
 * Карточка карьерного трека после создания (роль HR): та же разметка, что у трека сотрудника,
 * но стандарт никому не назначен — ступени одного вида, без «пройден» и «следующий».
 */
@Component({
  selector: '[career-base]',
  template: `
    <div class="ch cphead">
      <div class="cphead-tx">
        <h3>{{ role }}</h3>
        <p class="cppos">{{ desc }}</p>
      </div>
    </div>
    <div class="cb">
      <ol class="cproad">
        @for (g of grades; track g; let i = $index, last = $last) {
          <li class="cpstep" [class.cpsel]="g === s.standardGrade()">
            @if (!last) {
              <span class="cpline"></span>
            }
            <button type="button" class="cpnode" [attr.aria-pressed]="g === s.standardGrade()" [attr.aria-label]="'Требования грейда «' + g + '»'" (click)="s.standardGrade.set(g)">
              <span class="cpdot">{{ i + 1 }}</span>
              <span class="cptxt">
                <b>{{ g }}</b>
                <small>Компетенций: {{ count(g) }}</small>
              </span>
            </button>
          </li>
        }
      </ol>
    </div>
  `,
  styleUrl: '../career-road/career-road.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-road career-base' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerBase {
  protected readonly s = inject(CareerStore);
  protected readonly role = CP_ROLE;
  protected readonly desc = CP_POSITION_DESC;
  protected readonly grades = CT_GRADES;

  protected count(grade: string): number {
    const i = CT_GRADES.indexOf(grade);
    return CT_ROLE.comps.filter((c) => !!c.levels[i]).length;
  }
}
