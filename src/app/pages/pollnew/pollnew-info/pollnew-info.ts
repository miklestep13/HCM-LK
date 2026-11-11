import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLL_STATUSES, POLL_VIEWS } from '../../../data/polls.data';
import { PollStatus } from '../../../interface/poll';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { PollnewState } from '../pollnew.state';

/** Шаг «Общая информация» (без заголовка): наименование и описание; вид опроса, дата начала (обязательная, у нового — сегодня), дата окончания (необязательная), статус. */
@Component({
  selector: '[pollnew-info]',
  imports: [Field, Select, DateField],
  template: `
    <div class="cb frm pnfrm">
      <app-field label="Наименование" required full [filled]="!!s.n()" [error]="s.isBad('n') && !s.n().trim()">
        <input class="fin" placeholder="Например: Ежеквартальный eNPS · IV квартал 2026" [value]="s.n()" (input)="s.n.set($any($event.target).value)" />
      </app-field>
      <app-field label="Описание" full [filled]="!!s.d()">
        <textarea class="fta" rows="4" placeholder="Зачем проводится опрос и как будут использованы результаты" [value]="s.d()" (input)="s.d.set($any($event.target).value)"></textarea>
      </app-field>
      <app-field label="Вид опроса" required filled>
        <app-select [options]="viewNames" [value]="viewName()" (valueChange)="setView($event)" />
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
    </div>
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollnewInfo {
  protected readonly s = inject(PollnewState);
  protected readonly viewNames = POLL_VIEWS.map((x) => x.t);
  protected readonly statuses: PollStatus[] = POLL_STATUSES;
  protected viewName(): string {
    return POLL_VIEWS.find((x) => x.v === this.s.view())!.t;
  }
  protected setView(t: string): void {
    this.s.view.set(POLL_VIEWS.find((x) => x.t === t)!.v);
  }
}
