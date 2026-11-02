import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { absDays } from '../../../core/demo/absence-store.service';
import { plural } from '../../../data/org.data';
import { AbsEntry } from '../../../interface/absence';
import { AbsencesState } from '../absences.state';

/**
 * Статистика сверху (как «Отпуск» и «Отгулы» на обзоре): доступно отпуска (полоса использованного), ближайший отпуск
 * (даты и число дней), накоплено отгулов. Планирование отпусков на следующий год — баннер над страницей (absences-banner).
 */
@Component({
  selector: '[absences-stats]',
  template: `
    @let m = s.store.me();
    <div class="abst">
      <div class="stc abvac">
        <div class="l">Доступно отпуска</div>
        <div class="v">{{ m.vacLeft }} <small>{{ days(m.vacLeft) }} из {{ m.vacTotal }}</small></div>
        <div class="bar ok"><i [style.width.%]="((m.vacTotal - m.vacLeft) / m.vacTotal) * 100"></i></div>
      </div>
      <div class="stc">
        <div class="l">Ближайший отпуск</div>
        @if (s.store.nextVac(); as v) {
          <div class="v">{{ v.from }} – {{ v.to }} <small>· {{ n(v) }} {{ days(n(v)) }}</small></div>
        } @else {
          <div class="v"><small>Не запланирован</small></div>
        }
      </div>
      <div class="stc"><div class="l">Накоплено отгулов</div><div class="v">{{ m.offLeft }} <small>{{ days(m.offLeft) }}</small></div></div>
    </div>
  `,
  host: { class: 'c mb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbsencesStats {
  protected readonly s = inject(AbsencesState);
  protected readonly days = (n: number) => plural(n, 'день', 'дня', 'дней');
  protected readonly n = (x: AbsEntry) => absDays(x.from, x.to);
}
