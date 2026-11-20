import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, untracked } from '@angular/core';
import { CareerRoleStore } from '../../../core/demo/career-role.service';
import { EVM_TYPES } from '../../../data/event-members.data';
import { CT_ROLES } from '../../../data/career-track.data';
import { EvCol } from '../../../interface/member';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { EventMembers } from '../../../widgets/event-members/event-members';
import { CareerHrComps } from './career-hr-comps';
import { CareerHrGrades } from './career-hr-grades';
import { CareerHrView } from './career-hr-view';

/**
 * Карточка должности для HR.
 * Просмотр — трек как у сотрудника: требования грейда и сотрудники с должностью в одной колонке.
 * «Редактировать» открывает форму. Должность действует сразу после создания.
 */
@Component({
  selector: 'app-career-hr',
  imports: [Field, Select, EventMembers, CareerHrGrades, CareerHrComps, CareerHrView],
  template: `
    @if (s.form()) {
      <div class="c">
        <div class="cb">
          <div class="frm">
            <app-field label="Наименование должности" required full [filled]="!!s.name()">
              <app-select [options]="posts" [search]="true" placeholder="Выберите должность" [value]="s.name()" (valueChange)="pickPost($event)" />
            </app-field>
            <app-field label="Описание" full class="dis" [filled]="!!s.desc()">
              <textarea class="fta" rows="3" placeholder="Чем занимается сотрудник на этой должности" [value]="s.desc()" disabled></textarea>
            </app-field>
          </div>
        </div>
      </div>
    }

    @if (s.form()) {
      <div
        class="c"
        event-members
        title="Участники"
        [(rows)]="s.members"
        [pool]="s.memberPool"
        [types]="memberTypes"
        [roles]="memberRoles"
        [cols]="formCols"
        [sole]="leaderSole"
        edit="all"
        filters
        searchPlaceholder="Поиск по ФИО или должности"
        addAt="bottom"
        paging="pages"
      ></div>
      <div career-hr-grades></div>
      <div career-hr-comps></div>
    } @else {
      <div career-hr-view></div>
    }

    @if (s.form()) {
      <div class="c hrisl">
        <div class="hrff">
          @if (s.mode() === 'create' && !s.kept()) {
            <button type="button" class="btn pri" (click)="create()">Создать</button>
          } @else {
            <button type="button" class="btn pri" (click)="save()">Сохранить</button>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './career-hr.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-hr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHr {
  protected readonly s = inject(CareerRoleStore);
  protected readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly memberTypes = EVM_TYPES;
  protected readonly memberRoles = ['Лидер должности', 'Эксперт'];
  /** без признака «основной», веса и описания */
  protected readonly formCols: EvCol[] = ['member', 'type', 'role', 'from', 'to', 'status'];
  /** лидер должности в таблице один, экспертов может быть несколько */
  protected readonly leaderSole = ['Лидер должности'];
  /** должности заводятся отдельно: здесь только выбор из справочника */
  protected readonly posts = [...CT_ROLES.map((r) => r.name)].sort((a, b) => a.localeCompare(b, 'ru'));

  constructor() {
    effect(() => {
      const rows = this.s.members().filter((r) => r.n);
      const leader = rows.find((r) => r.roles.includes('Лидер должности'))?.n || '';
      const experts = rows.filter((r) => r.roles.includes('Эксперт')).map((r) => r.n);
      untracked(() => {
        if (this.s.leader() !== leader) this.s.leader.set(leader);
        if (this.s.experts().join('|') !== experts.join('|')) this.s.experts.set(experts);
      });
    });
  }

  /** выбор должности: в копии меняются описание и набор грейдов, в пустой форме — данные этой должности без участников */
  protected pickPost(name: string): void {
    if (!name || name === this.s.name()) return;
    if (this.s.copied()) {
      this.s.applyPost(name);
      return;
    }
    this.s.fromSample(name);
    this.s.members.set([]);
  }

  protected create(): void {
    const name = this.s.name().trim();
    if (!name) {
      this.toast.show('Создать профиль должности', 'Выберите должность.');
      return;
    }
    this.s.name.set(name);
    this.s.keep();
    this.toast.show('Должность создана', 'Карточка сразу действует.');
  }

  edit(): void {
    this.s.shaping.set(true);
  }

  async remove(): Promise<void> {
    const name = this.s.name();
    if (!(await this.confirm.ask({ title: 'Удалить должность?', text: '«' + name + '» перестанет действовать. В списке профилей должностей она останется со статусом «Не действует».', ok: 'Удалить', danger: true }))) return;
    const id = CT_ROLES.find((r) => r.name === name)?.id || 'new';
    this.s.deactivate(id);
    this.toast.show('Должность не действует', '«' + name + '» больше не действует.');
  }

  protected save(): void {
    const name = this.s.name().trim();
    if (!name) {
      this.toast.show('Карточка должности', 'Выберите должность.');
      return;
    }
    this.s.name.set(name);
    this.s.shaping.set(false);
    this.toast.show('Изменения сохранены', 'Карточка должности обновлена.');
  }
}
