import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { NumInput } from '../../../shared/ui/num-input/num-input';
import { PollnewState } from '../pollnew.state';

/** Шаг «Общая информация», блок «Настройки опроса» — скрываемый (по умолчанию свернут): анонимность; у теста — проходной балл. */
@Component({
  selector: '[pollnew-settings]',
  imports: [Field, Icon, NumInput],
  template: `
    <div class="ch" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())">
      <span class="actb cfar"><app-icon name="chevSm" /></span>
      <h3>Настройки опроса</h3>
    </div>
    @if (!cold()) {
      <div class="cb frm pnfrm">
        <div class="fld full">
          <label class="swt pqsw pnanon"
            ><input
              type="checkbox"
              [checked]="s.anon()"
              (change)="s.anon.set($any($event.target).checked)"
            /><i></i
            ><span
              ><b>Сделать опрос анонимным</b
              ><small
                >Ответы не связываются с ФИО. Результаты по группе показываются, только если
                ответили 5 и более человек</small
              ></span
            ></label
          >
        </div>
        @if (s.kind() === 'Тест') {
          <app-field label="Проходной балл, %" filled>
            <app-num-input [min]="1" [max]="100" [value]="'' + s.pass()" (valueChange)="s.pass.set(+$event)" />
          </app-field>
        }
      </div>
    }
  `,
  host: { class: 'c cfold', '[class.cold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollnewSettings {
  protected readonly s = inject(PollnewState);
  /** свернут по умолчанию */
  protected readonly cold = signal(true);
}
