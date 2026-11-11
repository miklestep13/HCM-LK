import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { COURSE_ORDER } from '../../../data/coursenew.data';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { NumInput } from '../../../shared/ui/num-input/num-input';
import { Select } from '../../../shared/ui/select/select';
import { CoursenewState } from '../coursenew.state';

/**
 * «Настройки курса» под обложкой — скрываемый блок (по умолчанию свернут, шеврон слева от заголовка):
 * время для изучения, порядок просмотра материалов; «Критерии успешности» — проходной процент и «Все учебные материалы просмотрены».
 */
@Component({
  selector: '[coursenew-settings]',
  imports: [Field, Select, Icon, NumInput],
  template: `
    <div class="ch" [title]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())">
      <span class="actb cfar"><app-icon name="chevSm" /></span>
      <h3>Настройки курса</h3>
    </div>
    @if (!cold()) {
      <div class="cb frm">
        <app-field label="Время для изучения" [filled]="!!s.time()">
          <input class="fin" placeholder="Например: 6 ч" [value]="s.time()" (input)="s.time.set($any($event.target).value)" />
        </app-field>
        <app-field label="Порядок просмотра материалов" filled>
          <app-select [options]="orders" [value]="order()" (valueChange)="setOrder($event)" />
        </app-field>
        <h4 class="cfsub full">Критерии успешности</h4>
        <app-field label="Проходной процент, %" filled>
          <app-num-input [min]="1" [max]="100" [value]="'' + (s.mat().pass ?? 80)" (valueChange)="s.setPass(+$event)" />
        </app-field>
        <div class="fld full">
          <label class="swt cnsw"
            ><input type="checkbox" [checked]="s.allSeen()" (change)="s.allSeen.set($any($event.target).checked)" /><i></i
            ><span><b>Все учебные материалы просмотрены</b><small>Курс считается пройденным, только если сотрудник открыл все блоки курса</small></span></label
          >
        </div>
      </div>
    }
  `,
  host: { class: 'c mb cfold', '[class.cold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursenewSettings {
  protected readonly s = inject(CoursenewState);
  /** свернут по умолчанию */
  protected readonly cold = signal(true);
  protected readonly orders = COURSE_ORDER.map((x) => x[0]);
  protected readonly order = computed(() => (COURSE_ORDER.find((x) => x[1] === (this.s.mat().order ?? 'free')) ?? COURSE_ORDER[0])[0]);
  protected setOrder(v: string): void {
    this.s.setOrder(COURSE_ORDER.find((x) => x[0] === v)![1]);
  }
}
