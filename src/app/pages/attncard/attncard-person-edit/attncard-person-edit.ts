import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_EVENT_PEOPLE, ATT_PERSON_ROLES } from '../../../data/attest.data';
import { AttPerson } from '../../../interface/attest';
import { todayDmy } from '../../../shared/ui/attach/attach.utils';
import { ChipSelect } from '../../../shared/ui/chip-select/chip-select';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { EmpPick } from '../../../shared/ui/emp-pick/emp-pick';
import { Field } from '../../../shared/ui/field/field';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { attPeoplePick, shortFio } from '../attncard.utils';

const RESP = 'Ответственный за бланк';

/**
 * Сайдбар «Добавление / Изменение участника»: сотрудники (кроме уже участвующих и аттестуемого) и роли (несколько);
 * «Ответственный за бланк» — роль в списке, ответственный один: при выборе роль переходит к этому участнику.
 */
@Component({
  selector: 'app-attncard-person-edit',
  imports: [Drawer, Field, EmpPick, ChipSelect],
  template: `
    <app-drawer [title]="isNew ? 'Добавление участника' : 'Изменение участника'" [okLabel]="isNew ? 'Добавить' : 'Сохранить'" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="frm" style="grid-template-columns: 1fr">
        @if (isNew) {
          <app-field label="Сотрудник" required [filled]="!!sel().length">
            <app-emp-pick [people]="people" [(value)]="sel" [busy]="busy" />
          </app-field>
        } @else {
          <app-field label="Сотрудник" filled>
            <input class="fin" [value]="person()!.name" disabled />
          </app-field>
        }
        <app-field label="Роль" required full [filled]="!!roles().length" [error]="rolesErr()">
          <app-chip-select [options]="roleOpts" [(value)]="roles" placeholder="Выберите роли" />
          <div class="fhelp">{{ help() }}</div>
        </app-field>
        @if (msg()) {
          <div class="pqerr">{{ msg() }}</div>
        }
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardPersonEdit implements OnInit {
  private readonly s = inject(AttestStore);
  private readonly toast = inject(ToastService);
  readonly person = input<AttPerson | null>(null);
  readonly closed = output<void>();
  protected readonly people = attPeoplePick();
  protected readonly roleOpts = [...ATT_PERSON_ROLES, RESP];
  protected isNew = true;
  protected readonly sel = signal<string[]>([]);
  protected readonly roles = signal<string[]>([]);
  protected readonly rolesErr = signal(false);
  protected readonly msg = signal('');
  /** уже участвует или сам аттестуемый — недоступен */
  protected readonly busy = (n: string) => n === ATT_EVENT_PEOPLE['me'][0] || this.s.people().some((z) => z.name === n && !z.till);
  protected readonly help = computed(() => {
    const cur = this.s.people().find((z) => z.name === this.s.responsible() && !z.till);
    return (
      'Можно выбрать несколько ролей. Ответственный за бланк один' +
      (cur && (this.isNew || cur !== this.person()) ? ', сейчас — ' + shortFio(cur.name) + ' При выборе роль перейдет к этому участнику.' : '.')
    );
  });

  ngOnInit(): void {
    const x = this.person();
    this.isNew = !x;
    if (x) this.roles.set([...(x.role ? x.role.split(', ') : []), ...(x.name === this.s.responsible() ? [RESP] : [])]);
  }
  protected save(): void {
    const sel = this.roles(),
      own = sel.includes(RESP),
      roles = sel.filter((r) => r !== RESP).join(', '),
      names = this.sel();
    if (this.isNew && !names.length) return this.msg.set('Выберите хотя бы одного сотрудника.');
    if (!sel.length) {
      this.rolesErr.set(true);
      return this.msg.set('Выберите хотя бы одну роль.');
    }
    if (this.isNew && own && names.length > 1) return this.msg.set('Ответственным за бланк можно назначить только одного сотрудника.');
    let text: string;
    if (this.isNew) {
      const d = todayDmy();
      this.s.people.update((l) => [
        ...l,
        ...names.map((n) => {
          const e = this.people.find((z) => z.name === n) || { name: n, post: '', av: 1 };
          return { role: roles, name: n, post: e.post, av: e.av || 1, mail: '', tel: '', since: d };
        }),
      ]);
      if (own) this.s.responsible.set(names[0]);
      text = (names.length > 1 ? 'Добавлено участников: ' + names.length + '.' : 'Участник ' + names[0] + ' добавлен.') + (own ? ' Ответственный за бланк сменен.' : '');
    } else {
      const x = this.person()!,
        was = this.s.responsible() === x.name;
      this.s.people.update((l) => l.map((z) => (z === x ? { ...z, role: roles } : z)));
      if (own) this.s.responsible.set(x.name);
      else if (was) this.s.responsible.set(this.s.people().find((z) => z.role === 'Руководитель' && !z.till)?.name ?? '');
      text = 'Изменения по ' + shortFio(x.name) + ' сохранены.' + (own && !was ? ' Ответственный за бланк сменен.' : '');
    }
    this.closed.emit();
    this.toast.show('Готово', text);
  }
}
