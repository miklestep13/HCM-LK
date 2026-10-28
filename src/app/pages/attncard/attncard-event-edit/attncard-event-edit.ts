import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_EVENT_TYPES } from '../../../data/attest.data';
import { AttEvent } from '../../../interface/attest';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { EmpPick } from '../../../shared/ui/emp-pick/emp-pick';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { attPeoplePick, cDur, cHM, cMin, evKey, evPerson } from '../attncard.utils';

const HM = /^\d{2}:\d{2}$/;

/** Сайдбар «Добавление / Редактирование мероприятия»: наименование, тип встречи, дата, время с–по (длительность считается), участники */
@Component({
  selector: 'app-attncard-event-edit',
  imports: [Drawer, Field, Select, EmpPick],
  template: `
    <app-drawer [title]="isNew ? 'Добавление мероприятия' : 'Редактирование мероприятия'" [okLabel]="isNew ? 'Добавить' : 'Сохранить'" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="frm" style="grid-template-columns: 1fr">
        <app-field label="Наименование" required [filled]="!!t()" [error]="err().has('t')">
          <input class="fin" [value]="t()" (input)="t.set($any($event.target).value); clr('t')" />
        </app-field>
        <app-field label="Тип встречи" required [filled]="!!ty()" [error]="err().has('ty')">
          <app-select [options]="types" [value]="ty()" (valueChange)="ty.set($event); clr('ty')" placeholder="Выберите тип" />
        </app-field>
        <app-field label="Дата" required [filled]="!!d()" [error]="err().has('d')">
          <input class="fin" placeholder="дд.мм.гггг" [value]="d()" (input)="d.set($any($event.target).value); clr('d')" />
        </app-field>
        <div class="aetm">
          <app-field label="Время с" required [filled]="!!ts()" [error]="err().has('tm')">
            <input class="fin" placeholder="чч:мм" [value]="ts()" (input)="ts.set($any($event.target).value); clr('tm')" />
          </app-field>
          <app-field label="Время по" required [filled]="!!te()" [error]="err().has('tm')">
            <input class="fin" placeholder="чч:мм" [value]="te()" (input)="te.set($any($event.target).value); clr('tm')" />
          </app-field>
        </div>
        <div class="fhelp aedur">{{ durText() }}</div>
        <app-field label="Участники" required [filled]="!!sel().length">
          <app-emp-pick [people]="people" [(value)]="sel" />
        </app-field>
        @if (msg()) {
          <div class="pqerr">{{ msg() }}</div>
        }
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardEventEdit implements OnInit {
  private readonly s = inject(AttestStore);
  private readonly toast = inject(ToastService);
  /** мероприятие; null — новое */
  readonly event = input<AttEvent | null>(null);
  readonly closed = output<void>();
  protected readonly types = ATT_EVENT_TYPES;
  protected readonly people = attPeoplePick();
  protected isNew = true;
  protected readonly t = signal('');
  protected readonly ty = signal('');
  protected readonly d = signal('');
  protected readonly ts = signal('');
  protected readonly te = signal('');
  protected readonly sel = signal<string[]>([]);
  protected readonly err = signal(new Set<string>());
  protected readonly msg = signal('');
  private touched = false;

  protected readonly durText = computed(() => {
    const a = this.ts().trim(),
      z = this.te().trim();
    if (!this.touched && this.event() && !this.isNew) return 'Длительность: ' + cDur(this.event()!.dur);
    if (!this.touched) return 'Длительность посчитается по времени начала и конца.';
    return HM.test(a) && HM.test(z) && cMin(z) > cMin(a) ? 'Длительность: ' + cDur(cMin(z) - cMin(a)) : 'Конец встречи должен быть позже начала.';
  });

  ngOnInit(): void {
    const e = this.event();
    this.isNew = !e;
    if (!e) return;
    const [d0, s0] = e.d.split(' ');
    this.t.set(e.t);
    this.ty.set(e.ty);
    this.d.set(d0);
    this.ts.set(s0);
    this.te.set(cHM(cMin(s0) + e.dur));
    this.sel.set(e.p.map((x) => evPerson(x).name));
  }
  protected clr(k: string): void {
    if (k === 'tm') this.touched = true;
    if (!this.err().has(k)) return;
    const s = new Set(this.err());
    s.delete(k);
    this.err.set(s);
  }
  private bad(k: string, title?: string, text?: string): void {
    this.err.set(new Set([...this.err(), k]));
    if (title) this.toast.show(title, text || '');
  }
  protected save(): void {
    const t = this.t().trim(),
      dd = this.d().trim(),
      ts = this.ts().trim(),
      te = this.te().trim();
    if (!t) return this.bad('t');
    if (!this.ty()) return this.bad('ty', 'Тип встречи', 'Выберите тип встречи.');
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dd)) return this.bad('d', 'Дата', 'Укажите в формате дд.мм.гггг.');
    if (!HM.test(ts) || !HM.test(te) || cMin(te) <= cMin(ts)) return this.bad('tm', 'Время', 'Укажите время в формате чч:мм; конец позже начала.');
    if (!this.sel().length) return this.msg.set('Добавьте хотя бы одного участника.');
    const patch = { t, ty: this.ty(), d: dd + ' ' + ts, dur: cMin(te) - cMin(ts), p: this.sel().map(evKey) };
    const e = this.event();
    if (e) this.s.updateEvent(e, patch);
    else this.s.events.update((l) => [...l, { ...patch, s: '', f: 'Онлайн', u: '' }]);
    this.closed.emit();
    this.toast.show('Готово', `Мероприятие «${t}» ${this.isNew ? 'добавлено.' : 'сохранено.'}`);
  }
}
