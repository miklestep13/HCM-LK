import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { COURSE_STATUSES } from '../../../data/coursenew.data';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { RichText } from '../../../shared/ui/rich-text/rich-text';
import { Select } from '../../../shared/ui/select/select';
import { TagInput } from '../../../shared/ui/tag-input/tag-input';
import { CoverUpload } from '../../../widgets/cover-upload/cover-upload';
import { CoursenewSettings } from '../coursenew-settings/coursenew-settings';
import { CoursenewState } from '../coursenew.state';

/**
 * Шаг «Общая информация»: название, краткое и полное описание, даты начала и окончания, статус, автор, теги; обложка;
 * ниже — «Настройки курса» (свернуты: время изучения, порядок просмотра, критерии успешности).
 */
@Component({
  selector: '[coursenew-info]',
  imports: [Field, Select, RichText, DateField, TagInput, CoverUpload, CoursenewSettings],
  template: `
    <div class="c mb">
      <div class="ch"><h3>Общая информация</h3></div>
      <div class="cb frm">
        <app-field label="Название" required full [filled]="!!s.n()" [error]="s.isBad('n') && !s.n().trim()">
          <input class="fin" placeholder="Например: Как устроен банк: продукты, процессы, регуляторика" [value]="s.n()" (input)="s.n.set($any($event.target).value)" />
        </app-field>
        <app-field label="Краткое описание" full [filled]="!!s.lead()">
          <textarea class="fta" rows="2" placeholder="Одно-два предложения для карточки в каталоге" [value]="s.lead()" (input)="s.lead.set($any($event.target).value)"></textarea>
        </app-field>
        <div class="fld full"><label class="flab">Описание</label><app-rich-text [value]="s.d()" (valueChange)="s.d.set($event)" /></div>
        <app-field label="Дата начала" [filled]="!!s.start()">
          <app-date-field [value]="s.start()" (valueChange)="s.start.set($event)" />
        </app-field>
        <app-field label="Дата окончания" [filled]="!!s.end()" [error]="s.isBad('end')">
          <app-date-field [value]="s.end()" (valueChange)="s.end.set($event)" />
        </app-field>
        <app-field label="Статус" filled>
          <app-select [options]="statuses" [value]="s.status()" (valueChange)="s.status.set($event)" />
        </app-field>
        <app-field label="Автор курса" [filled]="!!s.author()">
          <input class="fin" placeholder="Начните вводить ФИО или подразделение" [value]="s.author()" (input)="s.author.set($any($event.target).value)" />
        </app-field>
        <app-field label="Теги" full [filled]="!!s.tags().length">
          <app-tag-input [value]="s.tags()" (valueChange)="s.tags.set($event)" placeholder="Введите тег и нажмите Enter" />
        </app-field>
      </div>
    </div>
    <div cover-upload [value]="s.cover()" (valueChange)="s.cover.set($event)"></div>
    <div coursenew-settings></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursenewInfo {
  protected readonly s = inject(CoursenewState);
  protected readonly statuses = COURSE_STATUSES;
}
