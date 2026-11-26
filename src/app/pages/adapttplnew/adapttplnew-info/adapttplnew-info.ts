import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EmpPick } from '../../../shared/ui/emp-pick/emp-pick';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { AdapttplnewState } from '../adapttplnew.state';

/**
 * Блок «Основная информация» без заголовка: наименование, описание;
 * ответственный и должность — в один ряд (~50 % каждое).
 */
@Component({
  selector: '[adapttplnew-info]',
  imports: [Field, Select, EmpPick],
  template: `
    <div class="cb frm atnfrm">
      <app-field label="Наименование" required full [filled]="!!s.name()" [error]="s.bad() && !s.name().trim()">
        <input
          class="fin"
          placeholder="Например: Адаптация нового сотрудника"
          [value]="s.name()"
          (input)="s.name.set($any($event.target).value)"
        />
      </app-field>
      <app-field label="Описание" full [filled]="!!s.desc()">
        <textarea
          class="fta"
          rows="4"
          placeholder="Для кого шаблон и какие задачи входят в план"
          [value]="s.desc()"
          (input)="s.desc.set($any($event.target).value)"
        ></textarea>
      </app-field>
      <app-field label="Ответственный" required [filled]="!!s.owner().length" [error]="s.bad() && !s.owner().length">
        <app-emp-pick
          [people]="s.people"
          [value]="s.owner()"
          (valueChange)="s.setOwner($event)"
          placeholder="Выберите сотрудника"
        />
      </app-field>
      <app-field label="Должность" [filled]="!!s.role()">
        <app-select
          placeholder="Выберите должность"
          [search]="true"
          [options]="s.roles"
          [value]="s.role()"
          (valueChange)="s.role.set($event)"
        />
      </app-field>
    </div>
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdapttplnewInfo {
  protected readonly s = inject(AdapttplnewState);
}
