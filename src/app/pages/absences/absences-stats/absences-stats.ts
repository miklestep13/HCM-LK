import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { absDate, absDays } from '../../../core/demo/absence-store.service';
import { plural } from '../../../data/org.data';
import { avCls } from '../../../data/people.data';
import { AbsEntry } from '../../../interface/absence';
import { TODAY } from '../../../shared/ui/date-range/date-range';
import { Icon } from '../../../shared/ui/icon/icon';
import { AbsencesState } from '../absences.state';

/**
 * Статистика сверху (как «Отпуск» и «Отгулы» на обзоре): доступно отпуска (полоса использованного), ближайший отпуск
 * (даты и число дней), накоплено отгулов. Свой график — без шапки; руководитель, открыв график сотрудника
 * (клик по сотруднику в диаграмме), видит над плитками сотрудника (фото, ФИО, должность) и «Мой график» — вернуться к своему.
 */
@Component({
  selector: '[absences-stats]',
  imports: [Icon],
  template: `
    @let m = s.person();
    <!-- сотрудник — только когда руководитель смотрит чужой график; свой график — без шапки -->
    @if (s.who(); as w) {
      <div class="ch abstw">
        <span class="abwho">
          <span class="av" [class]="av(w.n, w.av)"></span>
          <span class="cnm"><b>{{ w.n }}</b><small>{{ w.pos }}</small></span>
        </span>
        <button class="lnk abstme" (click)="s.who.set(null)"><app-icon name="backArrow" />Мой график</button>
      </div>
    }
    <div class="cb abst" [class.abown]="!s.who()">
      <div class="stc abvac">
        <div class="l">Доступно отпуска</div>
        <div class="v">{{ m.vacLeft }} <small>{{ days(m.vacLeft) }} из {{ m.vacTotal }}</small></div>
        <div class="bar ok"><i [style.width.%]="((m.vacTotal - m.vacLeft) / m.vacTotal) * 100"></i></div>
      </div>
      <div class="stc">
        <div class="l">Ближайший отпуск</div>
        @if (next(); as v) {
          <div class="v">{{ v.from }} – {{ v.to }} <small>· {{ n(v) }} {{ days(n(v)) }}</small></div>
        } @else {
          <div class="v"><small>Не запланирован</small></div>
        }
      </div>
      <div class="stc"><div class="l">Накоплено отгулов</div><div class="v">{{ m.offLeft }} <small>{{ days(m.offLeft) }}</small></div></div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c mb ab-stats' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbsencesStats {
  protected readonly s = inject(AbsencesState);
  protected readonly av = avCls;
  protected readonly days = (n: number) => plural(n, 'день', 'дня', 'дней');
  protected readonly n = (x: AbsEntry) => absDays(x.from, x.to);
  /** ближайший основной отпуск (согласованный, на согласовании или черновик) того, чья статистика */
  protected readonly next = computed(
    () =>
      this.s
        .person()
        .items.filter((x) => x.kind === 'vac' && ['Согласовано', 'Согласование', 'Черновик'].includes(x.status) && absDate(x.to)! >= TODAY)
        .sort((a, b) => +absDate(a.from)! - +absDate(b.from)!)[0] ?? null,
  );
}
