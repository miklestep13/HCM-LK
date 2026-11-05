import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { iprPl } from '../../../core/demo/ipr-store.service';
import { GOAL_COLORS, GOAL_PEOPLE, GOAL_PROLES, MAP_PERIOD } from '../../../data/goals.data';
import { GoalPerson } from '../../../interface/goal';
import { Member, MemberField } from '../../../interface/member';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Members } from '../../../widgets/members/members';
import { MygoalnewState } from '../mygoalnew.state';

/**
 * «Участники»: исполнитель и заказчики (сотрудник, роль, вес), полоса весов и «Распределить поровну» (кнопка рядом с «Добавить»).
 * Список — общий виджет «Участники» (widgets/members) с правкой в строке; вид — таблица или карточки, переключается в dev-панели.
 */
@Component({
  selector: '[mygoalnew-ppl]',
  imports: [Members],
  template: `
    <div class="ch">
      <h3>Участники</h3>
      <span class="chip">{{ 1 + s.ppl().length }}</span>
      <span class="glpbtns">
        @if (s.ppl().length) {
          <button class="btn raised glpeq" (click)="spread()">Распределить поровну</button>
        }
</span
      >
    </div>
    <div class="cb">
      <app-members
        edit="inline"
        [newRow]="newRow"
        [view]="s.pview() === 'cmp' ? 'cards' : 'table'"
        [fields]="fields"
        [roles]="roles"
        [pool]="pool"
        [people]="rows()"
        (peopleChange)="set($event)"
        [sub]="sub"
        [dot]="dot"
        empty="Добавьте хотя бы одного заказчика: руководителя, эксперта или команду."
        (removed)="removed($event)"
      />
      <div class="glptot glptot2">
        @if (sum() <= 100) {
          <div class="glptb glptbs">
            @for (p of s.ppl(); track $index; let i = $index) {
              @if (+(p.w ?? 0)) {
                <i [style.width.%]="+(p.w ?? 0)" [style.background]="col(i)" [title]="(p.n || 'Заказчик не выбран') + ' — ' + p.w + '%'"></i>
              }
            }
          </div>
        } @else {
          <div class="glptb"><i class="dg" [style.width.%]="100"></i></div>
        }
        <span class="glptn" [class.ok]="sum() === 100" [class.dg]="sum() > 100">{{ totalText() }}</span>
      </div>
    </div>
  `,
  host: { class: 'c mb glpw' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalnewPpl {
  protected readonly s = inject(MygoalnewState);
  private readonly toast = inject(ToastService);
  protected readonly roles = GOAL_PROLES;
  protected readonly pool = GOAL_PEOPLE;
  protected readonly fields: MemberField[] = ['av', 'name', 'pos', 'role', 'w'];
  protected readonly sum = this.s.pplSum;
  /** исполнитель — первой строкой, без правки и веса; дальше — заказчики */
  protected readonly rows = computed<Member[]>(() => [{ ...this.s.exe(), role: 'Исполнитель', w: null, lock: true }, ...this.s.ppl()]);
  protected readonly totalText = computed(() => {
    const s = this.sum();
    return s === 100 ? 'Веса распределены: 100%' : s > 100 ? 'Сумма весов ' + s + '% — больше 100% на ' + (s - 100) + '%' : 'Распределено ' + s + ' из 100% · осталось ' + (100 - s) + '%';
  });

  protected col(i: number): string {
    return GOAL_COLORS[i % GOAL_COLORS.length];
  }
  /** точка роли — цвет доли заказчика в полосе весов (строка 0 — исполнитель) */
  protected readonly dot = (_: Member, i: number) => this.col(i - 1);
  protected readonly sub = (p: Member) => {
    const t = (p as GoalPerson).team;
    return t ? t.cnt + ' ' + iprPl(t.cnt, 'сотрудник', 'сотрудника', 'сотрудников') + ' · оценка — среднее по команде' : p.pos;
  };
  protected set(list: Member[]): void {
    this.s.ppl.set(list.filter((m) => !m.lock) as GoalPerson[]);
    this.s.err.set('');
  }
  /** новая строка («Добавить участника» под списком): заказчик, остаток веса, период исполнителя */
  protected readonly newRow = (): Partial<Member> => {
    const ex = this.s.exe();
    // у участника цели есть период участия (from / to) — сверх полей Member
    const row = { role: 'Заказчик', w: Math.max(0, 100 - this.sum()) || '', from: ex.from || MAP_PERIOD.from, to: ex.to || MAP_PERIOD.to };
    return row;
  };
  protected removed(p: Member): void {
    if (p.n) this.toast.show('Оценивающий убран', p.n + (p.w ? '. Освободилось ' + p.w + '% веса.' : '.'));
  }
  protected spread(): void {
    const n = this.s.ppl().length, base = Math.floor(100 / n);
    this.s.ppl.update((l) => l.map((p, i) => ({ ...p, w: base + (i < 100 - base * n ? 1 : 0) })));
  }
}
