import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IprStore, iprNeedsExpert, iprNewTarget } from '../../../core/demo/ipr-store.service';
import { IPR_EMPLOYEES, IPR_KINDS, IPR_LEVELS, IPR_PERIODS, IPR_TARGET_ROLES, IPR_TEMPLATES } from '../../../data/ipr.data';
import { IprNewForm } from '../../../interface/ipr';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { Suggest } from '../../../shared/ui/suggest/suggest';

/**
 * «Новый ИПР»: параметры плана в три колонки — сотрудник, период, вид развития; эксперт при повышении грейда;
 * целевые должность и грейд с подсказкой о текущих; «Создать из шаблона» подставляет типовые задачи; описание.
 */
@Component({
  selector: '[ipr-new]',
  imports: [Field, Select, Suggest, Icon],
  template: `
    @let F = s.nf()!;
    <div class="cb">
      <div class="frm ipnfrm">
        <app-field label="Сотрудник" required [filled]="!!F.emp">
          <input class="fin" placeholder="Начните вводить ФИО" [appSuggest]="emps" [value]="F.emp" (change)="setEmp($any($event.target).value)" />
        </app-field>
        <app-field label="Период" required filled>
          <app-select [options]="pers" [value]="F.per" (valueChange)="s.patchNew({ per: $event })" />
        </app-field>
        <app-field label="Вид развития" required filled>
          <app-select [options]="kinds" [value]="F.kind" (valueChange)="s.patchNew({ kind: $event, roleTouched: false, gradeTouched: false })" />
        </app-field>
        @if (needExp()) {
          <div class="ipexp">
            <div class="ipext">
              <b>Повышение грейда подтверждает эксперт</b
              ><small>Итоги плана обсуждаются на встрече с руководителем. Выберите эксперта, который будет на ней присутствовать, — без него грейд не повысят.</small>
            </div>
            <app-field label="Эксперт на встрече" required [filled]="!!F.expert" [error]="expErr()">
              <input class="fin" placeholder="Начните вводить ФИО" [appSuggest]="experts()" [value]="F.expert" (input)="s.patchNew({ expert: $any($event.target).value })" (change)="s.patchNew({ expert: $any($event.target).value })" />
            </app-field>
          </div>
        }
        <app-field label="Целевая должность" required filled>
          <app-select [options]="roles()" [value]="role()" (valueChange)="s.patchNew({ role: $event, roleTouched: true })" />
          @if (cur()) {
            <div class="fhelp ipnow">Текущая должность: {{ cur()![0] }}</div>
          }
        </app-field>
        <app-field label="Целевой грейд" required filled>
          <app-select [options]="grades" [value]="grade()" (valueChange)="s.patchNew({ grade: $event, gradeTouched: true })" />
          @if (cur()) {
            <div class="fhelp ipnow">Текущий грейд: {{ cur()![1] }}</div>
          }
        </app-field>
        <app-field label="Создать из шаблона" [filled]="!!F.tpl">
          <input class="fin iptpl" placeholder="Создать из шаблона" [appSuggest]="tpls" [value]="F.tpl" (change)="tpl($any($event.target).value)" />
          <span class="mselsr ipsrl"><app-icon name="loupe" /></span>
          <div class="fhelp">Шаблон подставит типовой набор заданий.</div>
        </app-field>
        <app-field label="Описание" full [filled]="!!F.desc">
          <textarea class="fta" rows="3" placeholder="Чего хотите достичь за период" [value]="F.desc" (input)="s.patchNew({ desc: $any($event.target).value })"></textarea>
        </app-field>
      </div>
    </div>
  `,
  host: { class: 'c iphead ipnew' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprNew {
  protected readonly s = inject(IprStore);
  /** подсветка пустого эксперта */
  readonly expErr = input(false);
  protected readonly emps = Object.keys(IPR_EMPLOYEES);
  protected readonly pers = IPR_PERIODS;
  protected readonly kinds = IPR_KINDS;
  protected readonly grades = IPR_LEVELS;
  protected readonly tpls = IPR_TEMPLATES;
  private readonly F = computed<IprNewForm>(() => this.s.nf()!);
  private readonly t = computed(() => iprNewTarget(this.F().emp, this.F().kind));
  protected readonly needExp = computed(() => iprNeedsExpert(this.F().kind));
  protected readonly experts = computed(() => this.emps.filter((n) => n !== this.F().emp));
  protected readonly role = computed(() => (this.F().roleTouched ? this.F().role : this.t().role));
  protected readonly grade = computed(() => (this.F().gradeTouched ? this.F().grade : this.t().grade));
  protected readonly roles = computed(() => [...new Set([...IPR_TARGET_ROLES, this.role()])]);
  protected readonly cur = computed(() => IPR_EMPLOYEES[this.F().emp] ?? null);

  protected setEmp(v: string): void {
    const F = this.F();
    this.s.patchNew({ emp: v, roleTouched: false, gradeTouched: false, expert: F.expert === v ? '' : F.expert });
  }
  protected tpl(v: string): void {
    v = v.trim();
    if (v && !IPR_TEMPLATES.includes(v)) return;
    this.s.applyTemplate(v);
  }
}
