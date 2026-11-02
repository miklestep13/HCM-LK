import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COMM_CATS } from '../../../data/comm.data';
import { CommCat } from '../../../interface/comm';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { CommnewState } from '../commnew.state';

/** Основные поля сообщества: наименование; категория и дата создания (50/50); описание */
@Component({
  selector: '[commnew-main]',
  imports: [Field, Select, DateField],
  template: `
    @let f = s.f();
    <div class="cb frm cmnf">
      <app-field label="Наименование" required full [filled]="!!f.name" [error]="s.bad() === 'name'">
        <input class="fin" placeholder="Например, Клуб любителей походов" [value]="f.name" (input)="s.set('name', $any($event.target).value)" />
      </app-field>
      <app-field label="Категория" required [filled]="!!f.cat" [error]="s.bad() === 'cat'">
        <app-select [options]="cats" [value]="f.cat ? catName[f.cat] : ''" (valueChange)="setCat($event)" placeholder="Не выбрано" />
      </app-field>
      <app-field label="Дата создания" required [filled]="!!f.created" [error]="s.bad() === 'created'">
        <app-date-field [value]="f.created" (valueChange)="s.set('created', $event)" />
      </app-field>
      <app-field label="Описание" required full [filled]="!!f.about" [error]="s.bad() === 'about'">
        <textarea class="fta" rows="5" placeholder="Чем занимается сообщество, как часто встречается и кому будет интересно" [value]="f.about" (input)="s.set('about', $any($event.target).value)"></textarea>
      </app-field>
    </div>
  `,
  host: { class: 'c mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommnewMain {
  protected readonly s = inject(CommnewState);
  protected readonly catName = COMM_CATS;
  protected readonly cats = Object.values(COMM_CATS);
  protected setCat(name: string): void {
    this.s.set('cat', (Object.keys(COMM_CATS) as CommCat[]).find((k) => COMM_CATS[k] === name) ?? '');
  }
}
