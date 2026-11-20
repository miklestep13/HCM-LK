import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CareerRoleStore, HrGrade } from '../../../core/demo/career-role.service';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';

/** Грейды выбранной должности: группа полей на каждый грейд, без ручного добавления */
@Component({
  selector: '[career-hr-grades]',
  imports: [Field, Icon],
  template: `
    <div class="ch">
      <span class="hrht"><h3>Требования к грейдам</h3><span class="chip">{{ s.grades().length }}</span></span>
    </div>
    <div class="cb">
      @if (!s.grades().length) {
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTarget" /></div>
          <b>{{ s.name() || s.copied() ? 'Грейдов нет' : 'Грейды еще не подтянулись' }}</b>
          <small>{{ s.name() || s.copied() ? 'У этой должности нет лестницы грейдов.' : 'Выберите должность — сюда подтянутся грейды, которые к ней привязаны.' }}</small>
        </div>
      } @else {
        <div class="hrgl">
          @for (g of s.grades(); track g.name) {
            <section class="hrg">
              <h4>{{ g.name }}</h4>
              <div class="frm">
                <app-field label="Описание" full [filled]="!!g.desc">
                  <textarea class="fta" rows="3" placeholder="Что делает сотрудник на этом грейде" [value]="g.desc" (input)="set(g, 'desc', $any($event.target).value)"></textarea>
                </app-field>
                <app-field label="Опыт работы" full [filled]="!!g.exp">
                  <input class="fin" placeholder="Например: от 2 лет в кредитовании" [value]="g.exp" (input)="set(g, 'exp', $any($event.target).value)" />
                </app-field>
                <app-field label="Образование" full [filled]="!!g.edu">
                  <input class="fin" placeholder="Например: высшее экономическое" [value]="g.edu" (input)="set(g, 'edu', $any($event.target).value)" />
                </app-field>
              </div>
            </section>
          }
        </div>
      }
    </div>
  `,
  host: { class: 'c career-hr-grades' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrGrades {
  protected readonly s = inject(CareerRoleStore);

  protected set(g: HrGrade, key: 'desc' | 'exp' | 'edu', value: string): void {
    this.s.patchGrade(g.name, { [key]: value });
  }
}
