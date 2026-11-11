import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Field } from '../../../shared/ui/field/field';
import { RichText } from '../../../shared/ui/rich-text/rich-text';
import { PollnewState } from '../pollnew.state';

/**
 * Шаг «Публикация»: содержание письма (название опроса подставляется), «Отправить уведомление».
 * Даты и время назначения и окончания — у каждой процедуры (шаг «Процедуры опроса»).
 */
@Component({
  selector: '[pollnew-pub]',
  imports: [Field, RichText],
  template: `
    <div class="ch"><h3>Публикация</h3></div>
    <div class="cb frm pnpub">
      <app-field label="Содержание письма" full [float]="false">
        <app-rich-text [value]="mail()" (valueChange)="s.mail.set($event)" />
      </app-field>
      <div class="fld full">
        <label class="swt pqsw"
          ><input type="checkbox" [checked]="s.notify()" (change)="s.notify.set($any($event.target).checked)" /><i></i
          ><span><b>Отправить уведомление</b><small>Письмо и уведомление в портале придут участникам в дату назначения их процедуры</small></span></label
        >
      </div>
    </div>
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollnewPub {
  protected readonly s = inject(PollnewState);
  /** название опроса в письме */
  protected readonly mail = computed(() => this.s.mail().replace('{name}', this.s.n() || 'Название опроса'));
}
