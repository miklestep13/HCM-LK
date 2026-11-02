import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { COMM_MONTHS } from '../../../data/comm.data';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { EmpPick, PickPerson } from '../../../shared/ui/emp-pick/emp-pick';
import { Field } from '../../../shared/ui/field/field';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommoneState } from '../commone.state';

const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

/** Сайдбар «Добавление мероприятия» сообщества: название, дата, время, место, участники (из состава сообщества). */
@Component({
  selector: 'app-commone-event-new',
  imports: [Drawer, Field, DateField, EmpPick],
  template: `
    <app-drawer title="Добавление мероприятия" okLabel="Добавить" [(open)]="open" (ok)="save()">
      <div class="frm" style="grid-template-columns: 1fr">
        <app-field label="Название" required full [filled]="!!t()" [error]="err() === 't'">
          <input class="fin" [value]="t()" (input)="t.set($any($event.target).value); err.set('')" />
        </app-field>
        <app-field label="Дата" required full [filled]="!!d()" [error]="err() === 'd'">
          <app-date-field [(value)]="d" />
        </app-field>
        <app-field label="Время" required full [filled]="!!h()" [error]="err() === 'h'">
          <input class="fin" placeholder="чч:мм" [value]="h()" (input)="h.set($any($event.target).value); err.set('')" />
        </app-field>
        <app-field label="Место" required full [filled]="!!p()" [error]="err() === 'p'">
          <input class="fin" [value]="p()" (input)="p.set($any($event.target).value); err.set('')" />
        </app-field>
        <app-field label="Участники" full [filled]="!!sel().length">
          <app-emp-pick [people]="people()" [(value)]="sel" placeholder="Начните вводить ФИО" />
        </app-field>
        @if (msg()) {
          <div class="pqerr">{{ msg() }}</div>
        }
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommoneEventNew {
  private readonly s = inject(CommoneState);
  private readonly toast = inject(ToastService);
  readonly open = model(false);

  protected readonly t = signal('');
  protected readonly d = signal('');
  protected readonly h = signal('');
  protected readonly p = signal(this.s.c()?.place ?? '');
  protected readonly sel = signal<string[]>([]);
  protected readonly err = signal('');
  protected readonly msg = signal('');
  protected readonly people = computed<PickPerson[]>(() => {
    const c = this.s.c();
    return c ? this.s.store.members(c).map((m) => ({ name: m.n, post: m.pos, av: typeof m.av === 'number' ? m.av : 0 })) : [];
  });

  private fail(k: string, text: string): void {
    this.err.set(k);
    this.msg.set(text);
  }

  protected save(): void {
    const c = this.s.c();
    if (!c) return;
    const dm = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(this.d().trim());
    if (!this.t().trim()) return this.fail('t', 'Укажите название мероприятия.');
    if (!dm || +dm[2] < 1 || +dm[2] > 12 || +dm[1] < 1 || +dm[1] > 31) return this.fail('d', 'Укажите дату в формате дд.мм.гггг.');
    if (!/^\d{1,2}:\d{2}$/.test(this.h().trim())) return this.fail('h', 'Укажите время в формате чч:мм.');
    if (!this.p().trim()) return this.fail('p', 'Укажите место проведения.');
    const wd = WD[new Date(+dm[3], +dm[2] - 1, +dm[1]).getDay()];
    const title = this.t().trim(), inv = this.sel().length;
    this.s.store.addMeet(c.id, [String(+dm[1]), COMM_MONTHS[+dm[2] - 1], wd + ', ' + this.h().trim(), title, this.p().trim(), inv]);
    this.toast.show('Готово', `Мероприятие «${title}» добавлено в сообщество «${c.name}».` + (inv ? ` Приглашено участников: ${inv}.` : ''));
    this.open.set(false);
  }
}
