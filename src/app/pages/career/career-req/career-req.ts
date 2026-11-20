import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { CP_CRITERIA, CP_KPI, CP_WAYS, CP_WAY_TONE, ctWayFacts } from '../../../data/career-path.data';
import { CT_ROLE } from '../../../data/career-track.data';
import { CpWay } from '../../../interface/career-path';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CtLevel } from '../../ctrack/ct-level';

/**
 * Требования выбранного грейда: описание, опыт и образование, таблица компетенций.
 * Строка раскрывается: критерии уровня и способы развития.
 */
@Component({
  selector: '[career-req]',
  imports: [Icon, CtLevel],
  template: `
    <div class="ch">
      <h3>Требования грейда «{{ s.grade() }}»</h3>
    </div>
    <div class="cb">
      @if (showBanner()) {
        <div class="cpbnr" role="status">
          <app-icon name="info" />
          <div>
            <b>Ваши компетенции уже соответствуют требованиям должности</b>
            <p>Вы можете запросить повышение, если у компании есть ставка или потребность.</p>
          </div>
          <button type="button" class="cpbnr-x" aria-label="Закрыть" (click)="bannerOff.set(true)">
            <app-icon name="close" />
          </button>
        </div>
      }
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
          <span class="chip">{{ s.rows().length }}</span>
        </div>
        <div class="tw">
          <table class="tbl ctt cpt">
            <thead>
              <tr>
                <th>Компетенция</th>
                @if (s.developing()) {
                  <th>Факт</th>
                  <th>Требуется</th>
                } @else {
                  <th>Присвоены</th>
                  <th>Дата присвоения</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (r of s.rows(); track r.comp) {
                <tr>
                  <td>
                    <button type="button" class="cpcomp" [class.open]="isOpen(r.comp)" [attr.aria-expanded]="isOpen(r.comp)" (click)="toggle(r.comp)">
                      <app-icon name="chevron" />
                      <span><b>{{ r.comp }}</b><small>{{ r.group }}</small></span>
                    </button>
                  </td>
                  @if (s.developing()) {
                    <td>
                      @if (r.cur) {
                        <span class="cplv"><ct-level [level]="r.cur" [comp]="r.comp" [grade]="s.myGrade()" /><small>{{ r.cur }}</small></span>
                      } @else {
                        <span class="ctna">Не оценен</span>
                      }
                    </td>
                    <td>
                      <span class="cplv"><ct-level [level]="r.need" [comp]="r.comp" [grade]="s.grade()" /><small>{{ r.need }}</small></span>
                    </td>
                  } @else {
                    <td>
                      <span class="cplv"><ct-level [level]="s.assignedLevel(s.grade(), r.comp)" [comp]="r.comp" [grade]="s.grade()" /><small>{{ s.assignedLevel(s.grade(), r.comp) }}</small></span>
                    </td>
                    <td>{{ s.assignedDate(s.grade(), r.comp) }}</td>
                  }
                </tr>
                @if (isOpen(r.comp)) {
                  <tr class="cpxrow">
                    <td colspan="3">
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
                                  @if (isApplied(r.comp, w.title)) {
                                    <span class="bdg" [class]="tone['Назначен']">Назначен</span>
                                  } @else if (w.apply) {
                                    <button type="button" class="btn raised s" (click)="apply(r.comp, w)">Подать заявку</button>
                                  } @else if (w.status) {
                                    <span class="bdg" [class]="tone[w.status]">{{ w.status }}</span>
                                  }
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
  styleUrl: './career-req.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-req' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerReq {
  protected readonly s = inject(CareerStore);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);

  protected readonly tone = CP_WAY_TONE;
  /** баннер закрыт в этой сессии; при смене сценария снова показывается */
  protected readonly bannerOff = signal(false);
  /** баннер только на грейде, который еще впереди, и только если факт не ниже требования */
  protected readonly showBanner = computed(() => !this.bannerOff() && this.s.developing() && !!this.s.nextGrade() && this.s.rows().length > 0 && this.s.rows().every((r) => r.status === 'Достигнут'));
  private readonly openedOn = signal<{ grade: string; comps: string[] }>({ grade: '', comps: [] });
  /** курсы, на которые в этой сессии подали заявку */
  private readonly applied = signal<Record<string, true>>({});

  protected readonly gradeReq = computed(() => CT_ROLE.grades.find((g) => g.grade === this.s.grade()));
  protected readonly kpi = computed(() => CP_KPI[this.s.grade()] || { exp: '—', edu: '—' });
  /** раскрытые компетенции текущего грейда; смена грейда прячет чужие, открытие одной не закрывает другие */
  protected readonly opened = computed(() => (this.openedOn().grade === this.s.grade() ? this.openedOn().comps : []));

  constructor() {
    effect(() => {
      this.s.scenario();
      this.bannerOff.set(false);
      this.applied.set({});
    });
  }

  protected criteria(): string[] {
    return CP_CRITERIA[this.s.grade()] || [];
  }
  protected isOpen(comp: string): boolean {
    return this.opened().includes(comp);
  }
  protected toggle(comp: string): void {
    const grade = this.s.grade();
    const cur = this.openedOn().grade === grade ? this.openedOn().comps : [];
    this.openedOn.set({ grade, comps: cur.includes(comp) ? cur.filter((c) => c !== comp) : [...cur, comp] });
  }
  protected ways(comp: string): CpWay[] {
    return (CP_WAYS[comp] || []).filter((w) => w.grades.includes(this.s.grade()));
  }
  /** тип материала без иконки, длительность и грейд. Личный срок назначения сюда не входит */
  protected facts(w: CpWay): { icon: string; text: string }[] {
    return ctWayFacts(w, [this.s.grade()]);
  }
  protected isApplied(comp: string, title: string): boolean {
    return !!this.applied()[comp + '|' + title];
  }
  protected apply(comp: string, w: CpWay): void {
    this.applied.update((m) => ({ ...m, [comp + '|' + w.title]: true }));
    this.toast.show('Заявка подана', 'Курс «' + w.title + '» поставлен в очередь на назначение.');
  }
  /** название материала открывает курс или статью базы знаний */
  protected openWay(w: CpWay): void {
    const link = w.link;
    if (!link) return;
    if (link.page === 'kb') this.nav.go('kb', { kbo: link.id });
    else this.nav.go('course', link.ev ? { crs: link.id, kind: 'trn' } : { crs: link.id });
  }

}
