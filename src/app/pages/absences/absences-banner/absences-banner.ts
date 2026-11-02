import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { plural } from '../../../data/org.data';
import { Progress } from '../../../shared/ui/progress/progress';
import { AbsencesState } from '../absences.state';

/**
 * Баннер-предупреждение над страницей (как «Период оценки» на обзоре): открыт период планирования отпусков на следующий год —
 * срок, прогресс (процент, под полосой — «N из 28 дней») и «Запланировать отпуск». Показывается, пока период открыт (dev-панель).
 */
@Component({
  selector: '[absences-banner]',
  imports: [Progress],
  template: `
    <div class="abbi">
      <span class="t">Открыт период планирования отпусков на {{ s.store.plan.year }}&nbsp;год<small>Запланируйте отпуск до&nbsp;{{ s.store.plan.till }}</small></span>
      <app-progress class="abbp" label="Запланировано" [value]="pct() + '%'" [percent]="pct()" [tone]="pct() >= 100 ? 'ok' : ''" [caption]="caption()" />
    </div>
    <button class="btn pri sm" (click)="plan.emit()">Запланировать отпуск</button>
  `,
  host: { class: 'c bnr abbnr' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbsencesBanner {
  protected readonly s = inject(AbsencesState);
  readonly plan = output<void>();
  protected readonly pct = computed(() => Math.min(100, Math.round((this.s.store.planned() / this.s.store.plan.days) * 100)));
  protected readonly caption = computed(() => {
    const d = this.s.store.plan.days;
    return this.s.store.planned() + ' из ' + d + ' ' + plural(d, 'дня', 'дней', 'дней');
  });
}
