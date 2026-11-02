import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { EmployeeCard as EmployeeCardData } from '../../interface/org';

/**
 * Карточка сотрудника (.c.ecard): фото 112, ФИО, должность, статусы серыми бейджами (как в виджете «Участники»), строки «метка — значение» (12px).
 * Используется в разделе «Сотрудники» (сетка) и во всплывающей карточке на схеме «Структура компании».
 * Клик обрабатывает страница: (click)="…" на <app-employee-card>.
 */
import { avCls } from '../../data/people.data';
@Component({
  selector: 'app-employee-card',
  template: `
    @let e = card();
    <div class="cb">
      <div class="pf">
        @if (e.photo) {
          <img class="ph" [src]="e.photo" alt="" />
        } @else {
          <span class="ph av" [class]="avCls(e.name, e.av ?? '')"></span>
        }
        <div class="info">
          <div>
            <div class="nm">{{ e.name }}{{ e.me ? ' (вы)' : '' }}</div>
            <div class="lg">{{ e.role }}</div>
            @if (e.tags?.length) {
              <div class="gltags">
                @for (t of e.tags; track t.text) {
                  <span class="bdg">{{ t.text }}</span>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
    <div class="cb">
      @for (r of e.rows; track r.key) {
        <div class="kv" [class.hidden]="r.hidden" [attr.data-r]="r.key">
          <span class="k">{{ r.label }}</span>
          <span class="v">
            @if (r.link) {
              <a>{{ r.value }}</a>
            } @else {
              {{ r.value }}
            }
          </span>
        </div>
      }
    </div>
  `,
  styleUrl: './employee-card.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c ecard', 'data-emp': '' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeCard {
  protected readonly avCls = avCls;
  readonly card = input.required<EmployeeCardData>();
}
