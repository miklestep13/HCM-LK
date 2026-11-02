import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { meetLink } from '../../../core/demo/events-store.service';
import { EVENT_STATUSES, EVENT_TIMES, EVENT_TYPES } from '../../../data/events.data';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Icon } from '../../../shared/ui/icon/icon';
import { RichText } from '../../../shared/ui/rich-text/rich-text';
import { Suggest } from '../../../shared/ui/suggest/suggest';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { EventnewState } from '../eventnew.state';

/**
 * Основные поля (как в «Добавлении встречи» Q.HCM): тип встречи, наименование; начало и окончание (дата + время);
 * место (адрес или ссылка — «Сгенерировать ссылку встречи»), статус; описание — редактор (полужирный, курсив, списки). Повторение — отдельный блок (eventnew-repeat).
 */
@Component({
  selector: '[eventnew-main]',
  imports: [Field, Select, DateField, Suggest, Icon, RichText],
  template: `
    @let f = s.f();
    <div class="cb frm enf">
      <app-field label="Тип встречи" required [filled]="!!f.type" [error]="s.bad() === 'type'">
        <app-select [options]="types" [value]="f.type" (valueChange)="s.set('type', $event)" placeholder="Выберите тип" />
      </app-field>
      <app-field class="en2" label="Наименование" required [filled]="!!f.title" [error]="s.bad() === 'title'">
        <input class="fin" [value]="f.title" (input)="s.set('title', $any($event.target).value)" />
      </app-field>

      <!-- начало и окончание: по два поля — дата и время (список с шагом 15 минут или свое) -->
      <div class="endt">
        <div class="endtg">
          <app-field label="Дата начала" required [filled]="!!f.date" [error]="s.bad() === 'date'">
            <app-date-field [value]="f.date" (valueChange)="s.set('date', $event)" />
          </app-field>
          <app-field label="Время начала" required [filled]="!!f.time" [error]="s.bad() === 'time'">
            <div class="entm">
              <input #ttime class="fin" placeholder="чч:мм" [appSuggest]="times" [suggestAll]="true" [value]="f.time"
                (input)="s.set('time', $any($event.target).value)" (suggestPick)="s.set('time', $event)" />
              <app-icon name="chevDown" (click)="ttime.focus()" />
            </div>
          </app-field>
        </div>
        <div class="endtg">
          <app-field label="Дата окончания" required [filled]="!!f.endDate" [error]="s.bad() === 'endDate'">
            <app-date-field [value]="f.endDate" (valueChange)="s.set('endDate', $event)" />
          </app-field>
          <app-field label="Время окончания" required [filled]="!!f.endTime" [error]="s.bad() === 'endTime'">
            <div class="entm">
              <input #tendTime class="fin" placeholder="чч:мм" [appSuggest]="times" [suggestAll]="true" [value]="f.endTime"
                (input)="s.set('endTime', $any($event.target).value)" (suggestPick)="s.set('endTime', $event)" />
              <app-icon name="chevDown" (click)="tendTime.focus()" />
            </div>
          </app-field>
        </div>
      </div>

      <!-- место: адрес или ссылка на онлайн-встречу (ссылка — под полем) -->
      <div class="enplw">
        <app-field label="Место проведения" required [filled]="!!f.place" [error]="s.bad() === 'place'">
          <input class="fin" [value]="f.place" (input)="s.set('place', $any($event.target).value)" />
        </app-field>
        <button class="lnk enlink" type="button" (click)="link()">Сгенерировать ссылку встречи</button>
      </div>
      <app-field label="Статус" required filled>
        <app-select [options]="statuses" [value]="f.status" (valueChange)="s.set('status', $event)" />
      </app-field>

      <app-field label="Описание встречи" full [float]="false">
        <app-rich-text [value]="f.desc" (valueChange)="s.set('desc', $event)" />
      </app-field>

    </div>
  `,
  host: { class: 'c mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventnewMain {
  protected readonly s = inject(EventnewState);
  private readonly toast = inject(ToastService);
  protected readonly types = EVENT_TYPES;
  protected readonly statuses = EVENT_STATUSES;
  /** время: список с шагом 15 минут или свое */
  protected readonly times = EVENT_TIMES;

  /** ссылка на онлайн-встречу — в поле места */
  protected link(): void {
    this.s.set('place', meetLink());
    this.toast.show('Ссылка создана', 'Ссылка на онлайн-встречу подставлена в «Место проведения». Участники получат ее в приглашении.');
  }
}
