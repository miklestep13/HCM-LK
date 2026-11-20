import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { CP_POSITION_DESC, CP_ROLE } from '../../../data/career-path.data';
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
    <div class="ch cphead">
      <div class="cphead-tx">
        <h3>{{ role }}</h3>
        <p class="cppos">{{ desc }}</p>
      </div>
    </div>
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
                <small>
                  @if (st.state === 'done') {
                    @if (st.period) {
                      {{ st.period }}<br />
                    }
                    Присвоено компетенций: {{ s.closedCount(st.grade) }}
                  } @else {
                    {{ gapCaption(st) }}
                  }
                </small>
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
  protected readonly desc = CP_POSITION_DESC;

  /** подпись еще не освоенного грейда: сколько компетенций осталось */
  protected gapCaption(st: CpStep): string {
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
    if (s === 'top') return 'Вы на верхнем грейде должности «' + CP_ROLE + '». Следующего грейда в этой должности нет.';
    if (!this.s.transition()) return 'Перехода к следующему грейду нет: нет ИПР и нет плана. Соединитель серый, пока план не запрошен.';
    return '';
  }
}
