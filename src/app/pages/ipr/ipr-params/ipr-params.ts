import { ChangeDetectionStrategy, Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { IprStore, iprDefName, iprNewTarget } from '../../../core/demo/ipr-store.service';
import { IPR_EMPLOYEES, IPR_KINDS, IPR_LEVELS, IPR_PERIOD_END, IPR_PERIODS, IPR_TEMPLATES } from '../../../data/ipr.data';
import { IprStatus } from '../../../interface/ipr';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { Suggest } from '../../../shared/ui/suggest/suggest';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const ME = 'Иванов Павел Сергеевич';
const MOVES: [string, IprStatus][] = [
  ['Перевести в выполнено частично', 'Выполнено частично'],
  ['Перевести в черновик', 'Черновик'],
  ['Перевести в выполнено', 'Выполнено'],
  ['Перевести в предложено', 'Предложено'],
  ['Перевести в утверждено', 'Утверждено'],
];

/**
 * Сайдбар «Редактирование ИПР» (черновик): название, шаблон, сотрудник, вид развития, целевые должность и грейд, период, описание;
 * сплит-кнопка «Сохранить» — переводы статуса. Утвержденный план — «Параметры ИПР», только просмотр.
 */
@Component({
  selector: 'app-ipr-params',
  imports: [Drawer, Field, Select, Suggest, Float, Icon],
  template: `
    <app-drawer
      [title]="ro ? 'Параметры ИПР' : 'Редактирование ИПР'"
      panel="ipw"
      okLabel=""
      [cancelLabel]="ro ? 'Закрыть' : 'Отменить'"
      [open]="true"
      (openChange)="closed.emit()"
    >
      <div class="frm ipfrm">
        <app-field label="Название ИПР" required full [filled]="!!name()" [class.dis]="ro">
          <input class="fin" placeholder="Например: План развития кредитного специалиста" [value]="name()" [disabled]="ro" (input)="name.set($any($event.target).value)" />
        </app-field>
        @if (!ro || tpl()) {
          <app-field label="Создать из шаблона" full [filled]="!!tpl()" [class.dis]="ro">
            <app-select [class.dis]="ro" [options]="tpls" [value]="tpl()" (valueChange)="setTpl($event)" />
            @if (!ro) {
              <div class="fhelp">Шаблон подставит вид развития и типовой набор заданий.</div>
            }
          </app-field>
        }
        <app-field label="Сотрудник" required full [filled]="!!emp()" [class.dis]="ro">
          <input class="fin" placeholder="Начните вводить ФИО" [appSuggest]="emps" [value]="emp()" [disabled]="ro" (change)="emp.set($any($event.target).value); gradeTouched.set(false)" />
        </app-field>
        <app-field label="Вид развития" required full filled [class.dis]="ro">
          <app-select [class.dis]="ro" [options]="kinds" [value]="kind()" (valueChange)="kind.set($event); gradeTouched.set(false)" />
        </app-field>
        <app-field label="Целевая должность" required filled [class.dis]="ro">
          <input class="fin" [value]="t().role" disabled />
        </app-field>
        <app-field label="Целевой грейд" required filled [class.dis]="ro">
          <app-select [class.dis]="ro" [options]="grades" [value]="grade()" (valueChange)="g.set($event); gradeTouched.set(true)" />
        </app-field>
        <app-field label="Период" required full filled [class.dis]="ro">
          <app-select [class.dis]="ro" [options]="pers" [value]="per()" (valueChange)="per.set($event)" />
        </app-field>
        <app-field label="Описание" full [filled]="!!desc()" [class.dis]="ro">
          <textarea class="fta" rows="4" placeholder="Чего хотите достичь за период" [value]="desc()" [disabled]="ro" (input)="desc.set($any($event.target).value)"></textarea>
        </app-field>
      </div>
      @if (!ro) {
        <span drwBtn class="sbtn"
          ><button class="btn pri" (click)="save()">Сохранить</button
          ><button class="btn pri sbar" aria-label="Другие действия" (click)="toggle($event)"><app-icon name="chevSm" /></button
        ></span>
      }
    </app-drawer>
    @if (menu(); as m) {
      <div class="fpop selpop" [appFloat]="m" (click)="$event.stopPropagation()">
        <div class="folist">
          @for (x of moves; track x[0]) {
            <div class="foi" (click)="move(x[1])">{{ x[0] }}</div>
          }
        </div>
      </div>
    }
  `,
  host: { '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprParams implements OnInit {
  private readonly s = inject(IprStore);
  private readonly toast = inject(ToastService);
  readonly closed = output<void>();

  protected readonly tpls = IPR_TEMPLATES;
  protected readonly emps = Object.keys(IPR_EMPLOYEES);
  protected readonly kinds = IPR_KINDS;
  protected readonly grades = IPR_LEVELS;
  protected readonly pers = IPR_PERIODS;
  protected readonly moves = MOVES;
  protected ro = false;

  protected readonly name = signal('');
  protected readonly tpl = signal('');
  protected readonly emp = signal(ME);
  protected readonly kind = signal('');
  protected readonly g = signal('');
  protected readonly gradeTouched = signal(true);
  protected readonly per = signal('');
  protected readonly desc = signal('');
  protected readonly menu = signal<HTMLElement | null>(null);

  protected readonly t = computed(() => iprNewTarget(this.emp(), this.kind()));
  protected readonly grade = computed(() => (this.gradeTouched() ? this.g() : this.t().grade));

  ngOnInit(): void {
    const P = this.s.plan();
    this.ro = this.s.st() === 'Утверждено';
    this.name.set(P.name);
    this.tpl.set(P.tpl || '');
    this.kind.set(P.kind);
    this.g.set(P.tGrade);
    this.per.set(P.per);
    this.desc.set(P.desc);
  }

  protected setTpl(v: string): void {
    this.tpl.set(v);
    if (v && !this.desc()) this.desc.set('Типовой план «' + v + '»: базовый набор заданий по роли, срок — до конца периода.');
  }
  private apply(): void {
    const P = this.s.plan(),
      tRole = this.t().role;
    this.s.savePlan({
      kind: this.kind(),
      per: this.per(),
      due: IPR_PERIOD_END[this.per()] || P.due,
      desc: this.desc() || P.desc,
      tRole,
      tGrade: this.grade(),
      tpl: this.tpl(),
      name: this.name().trim() || iprDefName(tRole),
      author: this.emp() !== ME ? ME : P.author,
    });
  }
  protected save(): void {
    this.apply();
    this.closed.emit();
    this.toast.show('Сохранено', 'Параметры плана обновлены.');
  }
  protected toggle(e: Event): void {
    e.stopPropagation();
    const b = e.currentTarget as HTMLElement;
    this.menu.set(this.menu() === b ? null : b);
  }
  protected move(st: IprStatus): void {
    this.menu.set(null);
    this.apply();
    this.closed.emit();
    this.s.setStatus(st);
    this.toast.show('Статус изменен', 'ИПР переведен в «' + st + '».');
  }
}
