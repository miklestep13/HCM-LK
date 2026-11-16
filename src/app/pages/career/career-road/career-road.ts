import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { CP_MOVED, CP_ROLE } from '../../../data/career-path.data';
import { CpStep } from '../../../interface/career-path';
import { Icon } from '../../../shared/ui/icon/icon';

/**
 * Дорожная карта: освоенные грейды — зеленая галочка, следующий синий, только если переход заявлен.
 * Без ИПР и плана соединитель к следующему грейду серый. Клик открывает требования ступени.
 */
@Component({
  selector: '[career-road]',
  imports: [Icon],
  template: `
    <div class="ch"><h3>Возможности развития. Должность «{{ role }}».</h3></div>
    <div class="cb">
      <ol class="cproad">
        @for (st of s.steps(); track st.grade; let i = $index, last = $last) {
          <li class="cpstep" [class]="st.state" [class.cpsel]="st.grade === s.grade()">
            @if (!last) {
              <span class="cpline" [class.ok]="line(st) === 'ok'" [class.go]="line(st) === 'go'"></span>
            }
            <button type="button" class="cpnode" [attr.aria-pressed]="st.grade === s.grade()" [attr.aria-label]="'Требования грейда «' + st.grade + '»'" (click)="s.select(st.grade)">
              <span class="cpdot">
                @if (st.state === 'done') {
                  <app-icon name="check" />
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <span class="cptxt">
                <b>{{ st.grade }}</b>
                <small>{{ caption(st) }}</small>
              </span>
            </button>
          </li>
        }
      </ol>
      @if (note(); as text) {
        <p class="cpnote"><app-icon name="info" />{{ text }}</p>
      }
    </div>
  `,
  styleUrl: './career-road.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-road' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerRoad {
  protected readonly s = inject(CareerStore);
  protected readonly role = CP_ROLE;

  /** подпись ступени: история освоенного грейда или сколько компетенций осталось развить */
  protected caption(st: CpStep): string {
    if (st.state === 'done') return st.period + (st.place ? ' · ' + st.place : '');
    const n = this.s.gap(st.grade);
    return n ? 'Развить компетенций: ' + n : 'Компетенции закрыты';
  }

  /** соединитель: зеленый между освоенными, синий к заявленному переходу, иначе серый */
  protected line(st: CpStep): string {
    const steps = this.s.steps();
    const next = steps[steps.indexOf(st) + 1];
    if (!next || st.state !== 'done') return '';
    return next.state === 'done' ? 'ok' : next.state === 'aim' ? 'go' : '';
  }

  protected note(): string {
    const s = this.s.scenario();
    if (s === 'moved') return CP_MOVED.title + '. ' + CP_MOVED.text;
    if (s === 'top') return 'Вы на верхнем грейде роли «' + CP_ROLE + '». Следующего грейда в этой роли нет.';
    if (!this.s.transition()) return 'Перехода к следующему грейду нет: нет ИПР и нет плана. Соединитель серый, пока план не запрошен.';
    return '';
  }
}
