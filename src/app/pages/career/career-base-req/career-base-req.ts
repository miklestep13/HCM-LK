import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { CP_CRITERIA, CP_KPI, CP_WAYS, ctWayFacts } from '../../../data/career-path.data';
import { CT_GRADES, CT_ROLE } from '../../../data/career-track.data';
import { CpWay } from '../../../interface/career-path';
import { Icon } from '../../../shared/ui/icon/icon';
import { CtLevel } from '../../ctrack/ct-level';

/**
 * Требования грейда в карточке стандарта (роль HR): тот же вид, что у сотрудника —
 * описание, опыт и образование, таблица компетенций с раскрытием. Без факта, дат присвоения и статусов курсов.
 */
@Component({
  selector: '[career-base-req]',
  imports: [Icon, CtLevel],
  template: `
    <div class="ch">
      <h3>Требования грейда «{{ s.standardGrade() }}»</h3>
    </div>
    <div class="cb">
      @if (gradeReq(); as g) {
        <p class="cpdesc">{{ g.desc }}</p>
      }
      <div class="cpkpi">
        <div class="rst"><div class="l">Опыт</div><div class="v">{{ kpi().exp }}</div></div>
        <div class="rst"><div class="l">Образование</div><div class="v">{{ kpi().edu }}</div></div>
      </div>

      <div class="cpsect">
        <div class="cpsh">
          <h4>Компетенции</h4>
          <span class="chip">{{ rows().length }}</span>
        </div>
        <div class="tw">
          <table class="tbl ctt cpt">
            <thead>
              <tr>
                <th>Компетенция</th>
                <th>Требуется</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.comp) {
                <tr>
                  <td>
                    <button type="button" class="cpcomp" [class.open]="isOpen(r.comp)" [attr.aria-expanded]="isOpen(r.comp)" (click)="toggle(r.comp)">
                      <app-icon name="chevron" />
                      <span><b>{{ r.comp }}</b><small>{{ r.group }}</small></span>
                    </button>
                  </td>
                  <td>
                    <span class="cplv"><ct-level [level]="r.need" [comp]="r.comp" [grade]="s.standardGrade()" /><small>{{ r.need }}</small></span>
                  </td>
                </tr>
                @if (isOpen(r.comp)) {
                  <tr class="cpxrow">
                    <td colspan="2">
                      <div class="cpx">
                        <div class="cpxk">
                          <b>Критерии</b>
                          <ul>
                            @for (c of criteria(); track c) {
                              <li>{{ c }}</li>
                            }
                          </ul>
                        </div>
                        @if (ways(r.comp).length) {
                          <div class="cpxw">
                            <b>Способы развития</b>
                            <div class="cpxcard">
                              @for (w of ways(r.comp); track w.title) {
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
      </div>
    </div>
  `,
  styleUrl: './career-base-req.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-req career-base-req' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerBaseReq {
  protected readonly s = inject(CareerStore);
  private readonly nav = inject(NavService);
  private readonly openedOn = signal<{ grade: string; comps: string[] }>({ grade: '', comps: [] });

  protected readonly gradeReq = computed(() => CT_ROLE.grades.find((g) => g.grade === this.s.standardGrade()));
  protected readonly rows = computed(() => {
    const i = CT_GRADES.indexOf(this.s.standardGrade());
    return CT_ROLE.comps.filter((c) => !!c.levels[i]).map((c) => ({ comp: c.name, group: c.group, need: c.levels[i] }));
  });
  protected readonly kpi = computed(() => CP_KPI[this.s.standardGrade()] || { exp: '—', edu: '—' });
  protected readonly opened = computed(() => (this.openedOn().grade === this.s.standardGrade() ? this.openedOn().comps : []));

  protected criteria(): string[] {
    return CP_CRITERIA[this.s.standardGrade()] || [];
  }
  protected isOpen(comp: string): boolean {
    return this.opened().includes(comp);
  }
  protected toggle(comp: string): void {
    const grade = this.s.standardGrade();
    const cur = this.openedOn().grade === grade ? this.openedOn().comps : [];
    this.openedOn.set({ grade, comps: cur.includes(comp) ? cur.filter((c) => c !== comp) : [...cur, comp] });
  }
  protected ways(comp: string): CpWay[] {
    return (CP_WAYS[comp] || []).filter((w) => w.grades.includes(this.s.standardGrade()));
  }
  /** тип материала без иконки, длительность и грейд */
  protected facts(w: CpWay): { icon: string; text: string }[] {
    return ctWayFacts(w, [this.s.standardGrade()]);
  }
  protected openWay(w: CpWay): void {
    const link = w.link;
    if (!link) return;
    if (link.page === 'kb') this.nav.go('kb', { kbo: link.id });
    else this.nav.go('course', link.ev ? { crs: link.id, kind: 'trn' } : { crs: link.id });
  }
}
