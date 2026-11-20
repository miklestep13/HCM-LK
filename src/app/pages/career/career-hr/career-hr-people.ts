import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CareerRoleStore } from '../../../core/demo/career-role.service';
import { ORG } from '../../../data/org.data';
import { PEOPLE } from '../../../data/people.data';
import { CT_ROLE } from '../../../data/career-track.data';
import { Member, MemberField } from '../../../interface/member';
import { Members } from '../../../widgets/members/members';

const GRADE_TONE: Record<string, string> = {
  Специалист: '',
  Старший: 'info',
  Ведущий: 'ok',
  Главный: 'warn',
};

/** «Сотрудники с должностью»: реестр участников, кому присвоена открытая должность */
@Component({
  selector: '[career-hr-people]',
  imports: [Members],
  template: `
    <div class="ch">
      <h3>Сотрудники с должностью</h3>
      <span class="chip">{{ people().length }}</span>
    </div>
    <div class="cb">
      <app-members
        edit="none"
        view="table"
        [toolbar]="true"
        [flat]="true"
        [pageSize]="10"
        [fields]="fields"
        [people]="people()"
        [roles]="grades"
        [roleTone]="tone"
        [empty]="empty()"
      />
    </div>
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrPeople {
  private readonly s = inject(CareerRoleStore);
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role'];
  protected readonly grades = ['Специалист', 'Старший', 'Ведущий', 'Главный'];
  protected readonly tone = GRADE_TONE;
  protected readonly people = computed<Member[]>(() => (this.s.name() === 'Кредитный специалист' ? CT_ROLE.people.map(memberOf) : []));
  protected readonly empty = computed(() =>
    this.s.name() ? 'На должности «' + this.s.name() + '» пока нет сотрудников.' : 'Сотрудники появятся, когда должность будет присвоена.',
  );
}

function memberOf(p: (typeof CT_ROLE.people)[number]): Member {
  return {
    n: p.name,
    pos: p.unit,
    dep: p.unit,
    av: avNum(p.name),
    role: p.grade,
  };
}

function avNum(name: string): number {
  const n = ORG.find((x) => x.name === name);
  if (n?.av) return Number(String(n.av).replace(/\D/g, '')) || 1;
  const listed = PEOPLE.find((x) => x[0] === name);
  return listed?.[3] || 1;
}
