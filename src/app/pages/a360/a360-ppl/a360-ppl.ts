import { ChangeDetectionStrategy, Component } from '@angular/core';
import { A360_RATERS, A360_RATER_ROLES, A360_RATER_TONE } from '../../../data/a360.data';
import { MemberField } from '../../../interface/member';
import { Members } from '../../../widgets/members/members';

/**
 * «Участники оценки» (только HR): таблица, как в сообществе (widgets/members, просмотр) — кто оценивал и в какой роли;
 * поиск и фильтры (должность, подразделение, роль), по 5 записей на странице.
 * Роли — как столбцы таблицы компетенций, бейджами разного цвета (как серии на радаре).
 */
@Component({
  selector: '[a360-ppl]',
  imports: [Members],
  template: `
    <div class="ch">
      <h3>Участники оценки</h3>
      <span class="chip">{{ people.length }}</span>
    </div>
    <div class="cb">
      <app-members edit="none" view="table" [toolbar]="true" [flat]="true" [pageSize]="5" [fields]="fields" [people]="people" [roles]="roles" [lead]="roles" [roleTone]="tone" />
    </div>
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360Ppl {
  protected readonly people = A360_RATERS;
  protected readonly roles = A360_RATER_ROLES;
  protected readonly tone = A360_RATER_TONE;
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role'];
}
