import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLL_STATUSES } from '../../../data/polls.data';
import { PollStatus } from '../../../interface/poll';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { NumInput } from '../../../shared/ui/num-input/num-input';
import { Select } from '../../../shared/ui/select/select';
import { PollnewState } from '../pollnew.state';

/** Вкладка «Общая информация»: наименование и описание; время прохождения, даты, статус; у теста — проходной балл; анонимность. */
@Component({
  selector: '[pollnew-info]',
  imports: [Field, Select, DateField, NumInput],
  template: `
    <div class="cb frm pnfrm">
      <app-field label="Наименование" required full [filled]="!!s.n()" [error]="s.isBad('n') && !s.n().trim()">
        <input class="fin" placeholder="Например: Ежеквартальный eNPS · IV квартал 2026" [value]="s.n()" (input)="s.n.set($any($event.target).value)" />
      </app-field>
      <app-field label="Описание" full [filled]="!!s.d()">
        <textarea class="fta" rows="4" placeholder="Зачем проводится опрос и как будут использованы результаты" [value]="s.d()" (input)="s.d.set($any($event.target).value)"></textarea>
      </app-field>
      <app-field label="Время прохождения" [filled]="!!s.dur()">
        <app-num-input [min]="1" [max]="240" placeholder="В минутах, например 10" [value]="s.dur()" (valueChange)="s.dur.set($event)" />
      </app-field>
      <app-field label="Дата начала" required [filled]="!!s.start()" [error]="s.isBad('start') && !s.start()">
        <app-date-field [value]="s.start()" (valueChange)="s.start.set($event)" />
      </app-field>
      <app-field label="Дата окончания" [filled]="!!s.end()" [error]="s.isBad('end')">
        <app-date-field [value]="s.end()" (valueChange)="s.end.set($event)" />
      </app-field>
      <app-field label="Статус" filled>
        <app-select [options]="statuses" [value]="s.status()" (valueChange)="s.status.set($any($event))" />
      </app-field>
      @if (s.kind() === 'Тест') {
        <app-field label="Проходной балл, %" filled>
          <app-num-input [min]="1" [max]="100" [value]="'' + s.pass()" (valueChange)="s.pass.set(+$event)" />
        </app-field>
      }
      <div class="fld full">
        <label class="swt pnanon"
          ><input type="checkbox" [checked]="s.anon()" (change)="s.anon.set($any($event.target).checked)" /><i></i
          ><span>Сделать опрос анонимным</span></label
        >
      </div>
    </div>
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollnewInfo {
  protected readonly s = inject(PollnewState);
  protected readonly statuses: PollStatus[] = POLL_STATUSES;
}
