import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { avCls } from '../../../data/people.data';
import { EmployeeCard } from '../../../interface/org';

/** Блок «Таблица сотрудников» — как таблица в виджете «Участники»: сотрудник (фото, ФИО, должность), подразделение, город, контакты, статус. */
@Component({
  selector: '[people-table]',
  template: `
    <div class="ptth">
      <span>Сотрудник</span><span>Департамент</span><span>Подразделение</span><span>Город офиса</span><span>Телефон</span><span>Почта</span><span>Статус</span>
    </div>
    @for (e of list(); track e.name) {
      <div class="pttr" tabindex="0" (click)="opened.emit(e)" (keydown.enter)="opened.emit(e)">
        <span class="ptwho">
          @if (e.photo) {
            <img [src]="e.photo" alt="" />
          } @else {
            <span class="av" [class]="av(e.name, e.av ?? '')"></span>
          }
          <span class="cnm"><b [title]="e.name">{{ e.name }}{{ e.me ? ' (вы)' : '' }}</b><small>{{ e.role }}</small></span>
        </span>
        <span>{{ v(e, 'dept') }}</span>
        <span>{{ v(e, 'unit') }}</span>
        <span>{{ v(e, 'city') }}</span>
        <span class="ptnw">{{ v(e, 'phone') }}</span>
        <span class="ptml">{{ v(e, 'mail') }}</span>
        <span class="gltags">
          @for (t of e.tags; track t.text) {
            <span class="bdg">{{ t.text }}</span>
          }
        </span>
      </div>
    } @empty {
      <div class="pte">Никого не нашли — измените запрос или фильтры</div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c ptbl' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleTable {
  readonly list = input.required<EmployeeCard[]>();
  readonly opened = output<EmployeeCard>();
  protected readonly av = avCls;
  protected readonly v = (e: EmployeeCard, k: string) => e.rows.find((r) => r.key === k && !r.hidden)?.value || '—';
}
