import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { Member, MemberField } from '../../interface/member';
import { Icon } from '../../shared/ui/icon/icon';
import { Members } from '../members/members';

/**
 * «Участники» для форм (мероприятие, сообщество): карточка со счетчиком и «Добавить», внутри — виджет widgets/members
 * (таблица, правка в строке, без веса). В пуле могут быть подразделения и команды — счетчик считает всех их сотрудников.
 *   <div ppl-card [(people)]="list" [roles]="roles" [pool]="pool" addRole="Участник"></div>
 * Форма цели использует тот же widgets/members, но со своей карточкой (вес и полоса весов).
 */
@Component({
  selector: '[ppl-card]',
  imports: [Icon, Members],
  template: `
    <div class="ch">
      <h3>{{ title() }}</h3>
      <span class="chip" title="Всего приглашенных с учетом подразделений и команд">{{ total() }}</span>
      <button class="btn raised pcadd" (click)="add()"><app-icon name="plusThin" />Добавить</button>
    </div>
    <div class="cb">
      <app-members edit="inline" view="table" [fields]="fields" [roles]="roles()" [pool]="pool()" [(people)]="people" [empty]="empty()" />
    </div>
  `,
  styles: `
    .w-pplcard > .ch .pcadd {
      margin-left: auto;
    }
    .w-pplcard .pcadd app-icon {
      display: flex;
      width: 16px;
      height: 16px;
    }
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
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role'];
  /** приглашенных всего: группа — все ее сотрудники */
  protected readonly total = computed(() => this.people().reduce((a, p) => a + (p.n ? p.cnt || 1 : 0), 0));

  protected add(): void {
    this.people.set([...this.people(), { n: '', pos: '', av: 0, role: this.addRole() }]);
  }
}
