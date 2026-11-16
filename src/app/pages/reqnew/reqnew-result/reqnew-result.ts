import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from '@angular/core';
import { REQ_RES_KINDS, REQ_RES_REFUSE } from '../../../data/req.data';
import { AttachFile } from '../../../interface/attach';
import { ReqRes } from '../../../interface/req';
import { Attach } from '../../../shared/ui/attach/attach';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';

/** вид результата → цвет плашки и значок (как решение в «Итоге» бланка аттестации) */
const TONE: Record<string, [string, string]> = {
  Выполнено: ['ok', 'check'],
  'Выполнено частично': ['wr', 'info'],
  Отказ: ['dg', 'close'],
};

/**
 * «Результат обработки» — блок просмотра заявки:
 *   без решения (ответственный — я): поля «Вид результата обработки» и «Комментарий» (при отказе — «Причина отказа»), ниже — загрузка документов;
 *   с решением: как «Итог» бланка аттестации — плашка в цвете решения (вид результата крупно, дата и кто), комментарий или причина отказа, «Документы N».
 *   <div class="c" reqnew-result [res]="r.res" />                                — решение
 *   <div class="c" reqnew-result edit [(kind)] [(text)] [(docs)] [err] />          — заполнение ответственным
 */
@Component({
  selector: '[reqnew-result]',
  imports: [Field, Select, Attach, Icon],
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
        @if (x.docs?.length) {
          <div class="rqrdocs">
            <h4>Документы<span class="pntc">{{ x.docs!.length }}</span></h4>
            <app-attach [files]="x.docs!" />
          </div>
        }
      } @else if (edit()) {
        <div class="rqrgrid">
          <app-field class="rqrfull" label="Вид результата обработки" required [filled]="!!kind()" [error]="err() && !kind()">
            <app-select [options]="kinds" placeholder="Выберите результат" [value]="kind()" (valueChange)="kind.set($event)" />
          </app-field>
          <!-- при отказе — «Причина отказа», обязательна -->
          <app-field class="rqrfull" [label]="refuse(kind()) ? 'Причина отказа' : 'Комментарий'" [required]="refuse(kind())" [filled]="!!text()" [error]="err() && refuse(kind()) && !text().trim()">
            <textarea class="fta" rows="3" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
          </app-field>
        </div>
        <div class="rqrdocs">
          <h4>Документы@if (docs().length) {<span class="pntc">{{ docs().length }}</span>}</h4>
          <app-attach edit [files]="docs()" (filesChange)="docs.set($event)" />
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
  readonly docs = model<AttachFile[]>([]);
  /** подсветить незаполненные обязательные */
  readonly err = input(false);
  protected readonly kinds = REQ_RES_KINDS;
  protected refuse(k: string): boolean {
    return k === REQ_RES_REFUSE;
  }
  protected tone(k: string): [string, string] {
    return TONE[k] ?? TONE['Выполнено'];
  }
}
