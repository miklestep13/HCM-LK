import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from '@angular/core';
import { REQ_RES_REFUSE } from '../../../data/req.data';
import { ReqRes } from '../../../interface/req';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';

/** вид результата → цвет плашки и значок (как решение в «Итоге» бланка аттестации) */
const TONE: Record<string, [string, string]> = {
  Выполнено: ['ok', 'check'],
  'Выполнено частично': ['wr', 'info'],
  Отказано: ['dg', 'close'],
};

/**
 * «Результат обработки» — блок просмотра заявки:
 *   без решения (ответственный — я): «Комментарий»; при отказе — «Причина отказа»;
 *   с решением: плашка в цвете решения (вид, дата и кто), комментарий или причина отказа.
 *   Вид результата задается split-кнопкой на странице («Согласовать» / «Отказать»), не полем здесь.
 *   Документы — только в общем виджете «Документы» (исходящие), здесь загрузки нет.
 *   <div class="c" reqnew-result [res]="r.res" />
 *   <div class="c" reqnew-result edit [(kind)] [(text)] [(reason)] [err] />
 */
@Component({
  selector: '[reqnew-result]',
  imports: [Field, Icon],
  template: `
    <div class="ch"><h3>Результат обработки</h3></div>
    <div class="cb">
      @if (res(); as x) {
        <div [class]="'rqrhero ' + tone(x.kind)[0]">
          <span class="rqrhic"><app-icon [name]="tone(x.kind)[1]" /></span>
          <div class="rqrhtx">
            <small>Вид результата обработки</small>
            <b>{{ x.kind }}</b>
            <span>Дата решения {{ x.date }}{{ x.by ? ' · ' + x.by : '' }}</span>
          </div>
        </div>
        @if (x.text) {
          <div class="rqrcm">
            <small>{{ refuse(x.kind) ? 'Причина отказа' : 'Комментарий' }}</small>
            <p>{{ x.text }}</p>
          </div>
        }
      } @else if (edit()) {
        <div class="rqrgrid">
          <app-field class="rqrfull" label="Комментарий" [filled]="!!text()">
            <textarea class="fta" rows="3" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
          </app-field>
          @if (refuse(kind())) {
            <app-field class="rqrfull" label="Причина отказа" required [filled]="!!reason()" [error]="err() && !reason().trim()">
              <textarea class="fta" rows="3" [value]="reason()" (input)="reason.set($any($event.target).value)"></textarea>
            </app-field>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './reqnew-result.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'rqres' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqnewResult {
  /** решение — показываем итог; нет — форма (edit) */
  readonly res = input<ReqRes | undefined>(undefined);
  readonly edit = input(false, { transform: booleanAttribute });
  readonly kind = model('');
  readonly text = model('');
  /** причина отказа — только при виде «Отказано» */
  readonly reason = model('');
  /** подсветить незаполненные обязательные */
  readonly err = input(false);
  protected refuse(k: string): boolean {
    return k === REQ_RES_REFUSE;
  }
  protected tone(k: string): [string, string] {
    return TONE[k] ?? TONE['Выполнено'];
  }
}
