import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { CP_CRITERIA, CP_KPI, CP_WAYS, CP_WAY_TONE } from '../../../data/career-path.data';
import { CT_ROLE } from '../../../data/career-track.data';
import { CpWay } from '../../../interface/career-path';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CtLevel } from '../../ctrack/ct-level';

/**
 * Требования выбранного грейда: описание, три показателя и таблица компетенций.
 * Строка раскрывается: критерии уровня и способы развития. Кнопка «Запросить ИПР» — справа в шапке.
 */
@Component({
  selector: '[career-req]',
  imports: [Icon, CtLevel],
  template: `
    <div class="ch">
      <h3>Требования грейда «{{ s.grade() }}»</h3>
      @if (s.developing()) {
        <button type="button" class="btn raised" (click)="ask()">Запросить ИПР</button>
      }
    </div>
    <div class="cb">
      @if (showBanner()) {
        <div class="cpbnr" role="status">
          <app-icon name="info" />
          <div>
            <b>Ваши компетенции уже соответствуют роли</b>
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
        <div class="rst"><div class="l">Способы развития</div><div class="v">{{ s.waysCount(s.grade()) }}</div></div>
      </div>

      <div class="cpsect">
        <h4>Требуемые компетенции</h4>
        <div class="tw">
          <table class="tbl ctt cpt">
            <thead>
              <tr>
                <th>Компетенция</th>
                <th>Факт</th>
                <th>Требуется</th>
              </tr>
            </thead>
            <tbody>
              @for (r of s.rows(); track r.comp) {
                <tr>
                  <td>
                    <button type="button" class="cpcomp" [class.open]="opened() === r.comp" [attr.aria-expanded]="opened() === r.comp" (click)="toggle(r.comp)">
                      <app-icon name="chevron" />
                      <span><b>{{ r.comp }}</b><small>{{ r.group }}</small></span>
                    </button>
                  </td>
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
                </tr>
                @if (opened() === r.comp) {
                  <tr class="cpxrow">
                    <td colspan="3">
                      <div class="cpx">
                        <div class="cpxk">
                          <b>Критерии</b>
                          <ul>
                            @for (c of criteria; track c) {
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
                                    <b>{{ w.title }}</b>
                                    <div class="prm">
                                      @for (m of w.meta; track m.text) {
                                        <span [class.od]="m.warn"><app-icon [name]="m.icon" />{{ m.text }}</span>
                                      }
                                    </div>
                                  </div>
                                  <span class="bdg" [class]="tone[w.status]">{{ w.status }}</span>
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
  /** баннер только если в открытой таблице факт не ниже требования по каждой компетенции и повышение еще возможно */
  protected readonly showBanner = computed(() => !this.bannerOff() && !!this.s.nextGrade() && this.s.rows().length > 0 && this.s.rows().every((r) => r.status === 'Достигнут'));
  protected readonly criteria = CP_CRITERIA;
  private readonly openedOn = signal({ grade: '', comp: '' });

  protected readonly gradeReq = computed(() => CT_ROLE.grades.find((g) => g.grade === this.s.grade()));
  protected readonly kpi = computed(() => CP_KPI[this.s.grade()] || { exp: '—', edu: '—' });
  /** раскрытая компетенция сбрасывается при смене грейда */
  protected readonly opened = computed(() => (this.openedOn().grade === this.s.grade() ? this.openedOn().comp : ''));

  constructor() {
    effect(() => {
      this.s.scenario();
      this.bannerOff.set(false);
    });
  }

  protected toggle(comp: string): void {
    this.openedOn.set({ grade: this.s.grade(), comp: this.opened() === comp ? '' : comp });
  }
  protected ways(comp: string): CpWay[] {
    return CP_WAYS[comp] || [];
  }

  /** без плана запрос включает синий шаг; если ИПР уже есть — открывает его */
  protected ask(): void {
    const grade = this.s.grade();
    if (!this.s.transition()) {
      this.s.askPlan();
      this.toast.show('Запрос отправлен', 'Руководитель получит просьбу открыть ИПР на грейд «' + grade + '».');
      return;
    }
    this.toast.show('ИПР уже есть', 'План развития открыт. Цель плана — грейд «' + grade + '».');
    this.nav.go('ipr');
  }
}
