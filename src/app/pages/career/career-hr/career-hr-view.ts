import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, signal, untracked } from '@angular/core';
import { CareerRoleStore } from '../../../core/demo/career-role.service';
import { NavService } from '../../../core/navigation/nav.service';
import { EVM_TYPES } from '../../../data/event-members.data';
import { personAvatar } from '../../../data/avatar';
import { CP_CRITERIA, CP_WAYS, ctWayFacts } from '../../../data/career-path.data';
import { CpWay } from '../../../interface/career-path';
import { EvCol } from '../../../interface/member';
import { Icon } from '../../../shared/ui/icon/icon';
import { EventMembers } from '../../../widgets/event-members/event-members';
import { CtLevel } from '../../ctrack/ct-level';

/**
 * Просмотр карточки должности: тот же трек, что видит сотрудник, но без человека.
 * Шаги серые, без дат присвоения и без фактического уровня — только требуемый.
 */
@Component({
  selector: '[career-hr-view]',
  imports: [Icon, CtLevel, EventMembers],
  template: `
    <div class="c career-road">
      <div class="ch cphead">
        <div class="cphead-tx">
          <h3>
            {{ s.name() }}
            <span class="bdg" [class.ok]="s.status() === 'Действует'">{{ s.status() }}</span>
          </h3>
          @if (s.desc()) {
            <p class="cppos">{{ s.desc() }}</p>
          }
        </div>
      </div>
      <div class="cb">
        @if (s.grades().length) {
          <ol class="cproad">
            @for (g of s.grades(); track g.name; let i = $index, last = $last) {
              <li class="cpstep" [class.cpsel]="g.name === grade()">
                @if (!last) {
                  <span class="cpline"></span>
                }
                <button type="button" class="cpnode" [attr.aria-pressed]="g.name === grade()" [attr.aria-label]="'Требования грейда «' + g.name + '»'" (click)="grade.set(g.name)">
                  <span class="cpdot">{{ i + 1 }}</span>
                  <span class="cptxt">
                    <b>{{ g.name }}</b>
                    <small>Компетенций: {{ compCount(g.name) }}</small>
                  </span>
                </button>
              </li>
            }
          </ol>
        } @else {
          <p class="cpnote"><app-icon name="info" />Грейды еще не добавлены. Откройте редактирование и соберите лестницу должности.</p>
        }
      </div>
    </div>

    <div class="cols cpcols">
      <div class="cM">
        <div class="c career-req">
          <div class="ch">
            <h3>{{ grade() ? 'Требования грейда «' + grade() + '»' : 'Требования грейда' }}</h3>
          </div>
          <div class="cb">
            @if (current(); as g) {
              @if (g.desc) {
                <p class="cpdesc">{{ g.desc }}</p>
              }
              <div class="cpkpi">
                <div class="rst"><div class="l">Опыт</div><div class="v">{{ g.exp || '—' }}</div></div>
                <div class="rst"><div class="l">Образование</div><div class="v">{{ g.edu || '—' }}</div></div>
              </div>
              <div class="cpsect">
                <div class="cpsh">
                  <h4>Компетенции</h4>
                  <span class="chip">{{ gradeComps().length }}</span>
                </div>
                @if (gradeComps().length) {
                  <div class="tw">
                    <table class="tbl ctt cpt">
                      <thead>
                        <tr>
                          <th>Компетенция</th>
                          <th>Требуется</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (c of gradeComps(); track c.name) {
                          <tr>
                            <td>
                              <button type="button" class="cpcomp" [class.open]="isOpen(c.name)" [attr.aria-expanded]="isOpen(c.name)" (click)="toggle(c.name)">
                                <app-icon name="chevron" />
                                <span><b>{{ c.name }}</b><small>{{ c.group }}</small></span>
                              </button>
                            </td>
                            <td>
                              <span class="cplv">
                                <ct-level [level]="c.levels[g.name] || ''" [comp]="c.name" [grade]="g.name" />
                                @if (c.levels[g.name]; as lv) {
                                  <small>{{ lv }}</small>
                                }
                              </span>
                            </td>
                          </tr>
                          @if (isOpen(c.name)) {
                            <tr class="cpxrow">
                              <td colspan="2">
                                <div class="cpx">
                                  <div class="cpxk">
                                    <b>Критерии</b>
                                    <ul>
                                      @for (line of criteria(); track line) {
                                        <li>{{ line }}</li>
                                      } @empty {
                                        <li>Критерии еще не описаны.</li>
                                      }
                                    </ul>
                                  </div>
                                  @if (ways(c.name).length) {
                                    <div class="cpxw">
                                      <b>Способы развития</b>
                                      <div class="cpxcard">
                                        @for (w of ways(c.name); track w.title) {
                                          <div class="prow">
                                            <span class="cico"><app-icon [name]="w.icon" /></span>
                                            <div>
                                              @if (w.link) {
                                                <button type="button" class="cpway" (click)="openWay(w)">{{ w.title }}</button>
                                              } @else {
                                                <b>{{ w.title }}</b>
                                              }
                                              @if (facts(w).length) {
                                                <div class="prm">
                                                  @for (m of facts(w); track m.text) {
                                                    <span>@if (m.icon) { <app-icon [name]="m.icon" /> }{{ m.text }}</span>
                                                  }
                                                </div>
                                              }
                                            </div>
                                          </div>
                                        }
                                      </div>
                                    </div>
                                  }
                                </div>
                              </td>
                            </tr>
                          }
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p class="cpnote"><app-icon name="info" />Компетенции еще не добавлены.</p>
                }
              </div>
            } @else {
              <p class="cpnote"><app-icon name="info" />Требования появятся, когда в карточке будет хотя бы один грейд.</p>
            }
          </div>
        </div>
        <div
          class="c"
          event-members
          title="Сотрудники с должностью"
          [rows]="staff()"
          [pool]="s.memberPool"
          [types]="memberTypes"
          [roles]="staffRoles()"
          [cols]="staffCols"
          memberLabel="Сотрудник"
          roleLabel="Грейд"
          fromLabel="Дата присвоения"
          edit="none"
          filters
          paging="pages"
          roleMode="single"
        ></div>
      </div>
      <div class="cR">
        <div class="c career-experts">
          <div class="ch"><h3>Лидеры и эксперты<span class="chip">{{ curators().length }}</span></h3></div>
          <div class="cb">
            @for (m of curators(); track m.id) {
              <div class="mem" (click)="nav.go('emp', { emp: m.n })">
                @if (av(m.n).photo; as photo) {
                  <img class="av" [src]="photo" alt="" />
                } @else {
                  <span class="av" [class]="av(m.n).cls"></span>
                }
                <div class="i">
                  <div class="nm">{{ m.n }}</div>
                  @if (m.pos) {
                    <div class="rl">{{ m.pos }}</div>
                  }
                  <div class="gltags">
                    @for (role of m.roles; track role) {
                      <span class="bdg">{{ role }}</span>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <p class="cpnote"><app-icon name="info" />Лидер и эксперты появятся, когда их добавят в карточку.</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../career-road/career-road.scss', '../career-req/career-req.scss', '../career-experts/career-experts.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hrview' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrView {
  protected readonly s = inject(CareerRoleStore);
  protected readonly nav = inject(NavService);

  /** какой грейд открыт в требованиях. Цвета ступеней от этого не зависят: все серые */
  protected readonly grade = signal('');
  protected readonly memberTypes = EVM_TYPES;
  protected readonly staffCols: EvCol[] = ['member', 'role', 'from'];
  /** список уже сужен выбранным грейдом, поэтому фильтр предлагает только его */
  protected readonly staff = computed(() => this.s.holders().filter((h) => h.roles.includes(this.grade())));
  protected readonly staffRoles = computed(() => (this.grade() ? [this.grade()] : []));
  private readonly openedOn = signal<{ grade: string; comps: string[] }>({ grade: '', comps: [] });
  protected readonly curators = computed(() => this.s.members().filter((m) => m.n && (m.roles.includes('Лидер должности') || m.roles.includes('Эксперт'))));
  protected readonly current = computed(() => this.s.grades().find((g) => g.name === this.grade()));
  protected readonly opened = computed(() => (this.openedOn().grade === this.grade() ? this.openedOn().comps : []));
  /** в таблице грейда только компетенции с заданным уровнем */
  protected readonly gradeComps = computed(() => {
    const g = this.grade();
    return this.s.comps().filter((c) => !!c.levels[g]);
  });
  protected readonly av = personAvatar;

  constructor() {
    effect(() => {
      const names = this.s.gradeNames();
      const cur = this.grade();
      if (!names.includes(cur)) untracked(() => this.grade.set(names[0] || ''));
    });
  }

  protected compCount(grade: string): number {
    return this.s.comps().filter((c) => !!c.levels[grade]).length;
  }
  protected criteria(): string[] {
    return CP_CRITERIA[this.grade()] || [];
  }
  protected ways(comp: string): CpWay[] {
    const grade = this.grade();
    return (CP_WAYS[comp] || []).filter((w) => w.grades.includes(grade));
  }
  /** тип материала, длительность и грейд. Срок назначения — дата сотрудника, в шаблоне ее нет */
  protected facts(w: CpWay): { icon: string; text: string }[] {
    return ctWayFacts(w, this.grade() ? [this.grade()] : []);
  }
  protected isOpen(comp: string): boolean {
    return this.opened().includes(comp);
  }
  protected toggle(comp: string): void {
    const grade = this.grade();
    const cur = this.openedOn().grade === grade ? this.openedOn().comps : [];
    this.openedOn.set({ grade, comps: cur.includes(comp) ? cur.filter((c) => c !== comp) : [...cur, comp] });
  }
  protected openWay(w: CpWay): void {
    const link = w.link;
    if (!link) return;
    if (link.page === 'kb') this.nav.go('kb', { kbo: link.id });
    else this.nav.go('course', link.ev ? { crs: link.id, kind: 'trn' } : { crs: link.id });
  }
}
