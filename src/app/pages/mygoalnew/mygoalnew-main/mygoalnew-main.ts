import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { GOAL_GROUPS, GOAL_GTYPES, GOAL_LEVELS, GOAL_PERIODS } from '../../../data/goals.data';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { MygoalnewState } from '../mygoalnew.state';

/** Основные поля цели: шаблон (окно выбора), тип, уровень, группа, наименование, описание, период, даты, вес со степпером */
@Component({
  selector: '[mygoalnew-main]',
  imports: [Field, Select, DateField, Icon],
  template: `
    <div class="cb frm glf3">
      <app-field label="Шаблон" full [filled]="!!s.tpl()">
        <div class="sbox glpick">
          <input class="fin" readonly [value]="s.tpl()" (click)="pickTpl.emit()" />
          <button class="glpkx" [class.hidden]="!s.tpl()" title="Очистить" aria-label="Очистить" (click)="s.tpl.set('')"><app-icon name="clearX" /></button>
          <button class="glpks" title="Выбрать шаблон" aria-label="Выбрать шаблон" (click)="pickTpl.emit()"><app-icon name="loupe" /></button>
        </div>
      </app-field>
      <app-field class="newrow" label="Тип" required filled>
        <app-select [options]="gtypes" [(value)]="s.gt" />
      </app-field>
      <app-field label="Уровень" required filled>
        <app-select [options]="levels" [(value)]="s.lvl" />
      </app-field>
      <app-field label="Группа" [filled]="!!s.grp()">
        <app-select [options]="groups" [(value)]="s.grp" />
      </app-field>
      <app-field label="Наименование" required full [filled]="!!s.t()">
        <input class="fin" [value]="s.t()" (input)="s.t.set($any($event.target).value)" />
      </app-field>
      <app-field label="Описание" required full [filled]="!!s.d()">
        <textarea class="fta" rows="3" [value]="s.d()" (input)="s.d.set($any($event.target).value)"></textarea>
      </app-field>
      <div class="glf4r">
        @if (s.fromMap()) {
          <app-field class="dis newrow" label="Период" required filled>
            <input class="fin" disabled [value]="s.per()" />
          </app-field>
        } @else {
          <app-field class="newrow" label="Период" required filled>
            <app-select [options]="periods" [value]="s.per()" (valueChange)="s.setPer($event)" />
          </app-field>
        }
        <app-field class="dis" label="Дата начала" required filled>
          <div class="dtin">
            <input class="fin" disabled placeholder="дд.мм.гггг" [value]="s.beg()" /><button class="dtb" disabled tabindex="-1"><app-icon name="calSm" /></button>
          </div>
        </app-field>
        <app-field label="Дата окончания" required [filled]="!!s.due()">
          <app-date-field [(value)]="s.due" />
        </app-field>
        <app-field class="glw" label="Вес, %" required [filled]="!!s.w()">
          <div class="numin glwst">
            <input class="fin" inputmode="numeric" [value]="s.w()" (input)="setW($event)" />
            <span class="nustep"
              ><button class="nub" aria-label="Больше на 5" (click)="snap(5)"><app-icon name="stepUp" /></button
              ><button class="nub" aria-label="Меньше на 5" (click)="snap(-5)"><app-icon name="stepDown" /></button
            ></span>
          </div>
        </app-field>
      </div>
    </div>
  `,
  host: { class: 'c mb glfnoh' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalnewMain {
  protected readonly s = inject(MygoalnewState);
  readonly pickTpl = output<void>();
  protected readonly gtypes = GOAL_GTYPES;
  protected readonly levels = GOAL_LEVELS;
  protected readonly groups = GOAL_GROUPS;
  protected readonly periods = GOAL_PERIODS.map((p) => p.n);

  protected setW(e: Event): void {
    const i = e.target as HTMLInputElement;
    i.value = i.value.replace(/[^\d]/g, '').slice(0, 3);
    if (+i.value > 100) i.value = '100';
    this.s.w.set(i.value);
    this.s.err.set('');
  }
  /** шаг кратен 5: 17 → 20 вверх, 17 → 15 вниз */
  protected snap(d: number): void {
    const v = +this.s.w() || 0, n = d > 0 ? Math.floor(v / 5) * 5 + 5 : Math.ceil(v / 5) * 5 - 5;
    this.s.w.set(String(Math.min(100, Math.max(0, n))));
  }
}
