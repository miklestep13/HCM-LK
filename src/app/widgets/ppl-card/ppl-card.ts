import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model } from '@angular/core';
import { Member, MemberField } from '../../interface/member';
import { Members } from '../members/members';

/**
 * «Участники» для форм (мероприятие, сообщество): карточка со счетчиком и «Добавить», внутри — виджет widgets/members
 * (таблица, правка в строке, без веса). В пуле могут быть подразделения и команды — счетчик считает всех их сотрудников.
 *   <div ppl-card [(people)]="list" [roles]="roles" [pool]="pool" addRole="Участник"></div>
 *   <div ppl-card ro [people]="list" [roles]="roles" [pool]="pool"></div>  — только просмотр
 *   <div ppl-card ro [pageSize]="10" …></div>  — с пагинацией (карточка мероприятия)
 * Форма цели использует тот же widgets/members, но со своей карточкой (вес и полоса весов).
 */
@Component({
  selector: '[ppl-card]',
  imports: [Members],
  template: `
    <div class="ch">
      <h3>{{ title() }}</h3>
      <span class="chip" title="Всего приглашенных с учетом подразделений и команд">{{ total() }}</span>
    </div>
    <div class="cb">
      <app-members [edit]="ro() ? 'none' : 'inline'" view="table" [fields]="fields" [roles]="roles()" [pool]="pool()" [(people)]="people" [empty]="empty()" [newRow]="newRow" [pageSize]="pageSize()" />
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c mb w-pplcard' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PplCard {
  readonly people = model.required<Member[]>();
  readonly roles = input.required<string[]>();
  readonly pool = input.required<Member[]>();
  /** роль новой строки */
  readonly addRole = input('Участник');
  readonly title = input('Участники');
  readonly empty = input('Добавьте участников.');
  /** только просмотр (просмотр встречи, мероприятия): сотрудник и роль, без правки */
  readonly ro = input(false, { transform: booleanAttribute });
  /** строк на странице (пагинация под таблицей); 0 — все */
  readonly pageSize = input(0);
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role'];
  /** приглашенных всего: группа — все ее сотрудники */
  protected readonly total = computed(() => this.people().reduce((a, p) => a + (p.n ? p.cnt || 1 : 0), 0));

  /** новая строка («Добавить участника» под списком) — с ролью по умолчанию */
  protected readonly newRow = (): Partial<Member> => ({ role: this.addRole() });
}
