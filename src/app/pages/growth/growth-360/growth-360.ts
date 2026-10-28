import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { GROWTH_360, GROWTH_360_INFO, GROWTH_360_SOURCES, GROWTH_PERIOD } from '../../../data/growth.data';
import { GrowthStage } from '../../../interface/growth';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { GrowthRadar, growthGap, growthOther } from '../growth-radar/growth-radar';

/**
 * Оценка 360: легенда источников (вкл/выкл), радар по компетенциям и выводы — средний балл, сильные стороны,
 * зона роста, слепая зона, скрытый потенциал. Пока идет сбор оценок или итог на рассмотрении — заглушка с прогрессом.
 */
@Component({
  selector: '[growth-360]',
  imports: [GrowthRadar],
  template: `
    <div class="ch">
      <h3>Оценка 360<small>{{ sub() }}</small></h3>
      @if (stage() !== 'self' && stage() !== 'wait') {
        <button class="btn raised" (click)="report()">Выгрузить отчет</button>
      }
    </div>
    @if (stage() === 'self' || stage() === 'wait') {
      @let all = stage() === 'wait';
      <div class="cb grE">
        <div class="empty">
          <div class="wipi">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 5.5 25.1 10.8v10.4L16 26.5l-9.1-5.3V10.8L16 5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              <path d="M16 11.5l4.2 2.4v4.2L16 20.5l-4.2-2.4v-4.2L16 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
            </svg>
          </div>
          <b>{{ all ? 'Оценки собраны' : 'Идет сбор оценок' }}</b>
          <div class="grpb"><i [style.width.%]="all ? 100 : pct"></i></div>
          <span class="grpl">Ответили {{ all ? info.respondents : info.answered }} из {{ info.respondents }} коллег</span>
          <small>{{
            all
              ? 'Результаты откроются вместе с итогом — после оценки руководителем и калибровки.'
              : 'Сбор до 19.09.2026. Радар и выводы появятся вместе с итогом оценки.'
          }}</small>
        </div>
      </div>
    } @else {
      <div class="cb">
        <div class="gr360">
          <div class="gr360r">
            <div class="grleg">
              @for (s of sources; track s[0]; let k = $index) {
                <button class="grl" [class.on]="on().has(k)" (click)="toggle(k)"><i [style.background]="s[1]"></i>{{ s[0] }}</button>
              }
            </div>
            <div growth-radar class="grwrap" [on]="on()"></div>
          </div>
          <div class="gr360c">
            <div class="cnc">
              <div class="cnch"><i style="background: var(--q-primary-500)"></i><b>Средний балл 360</b></div>
              <div class="big">{{ info.avg }}<small> из 5</small></div>
              <p>{{ period() }} · {{ info.respondents }} респондентов · {{ info.delta }}</p>
            </div>
            @for (c of conc; track c[1]) {
              <div class="cnc">
                <div class="cnch"><i [style.background]="c[0]"></i><b>{{ c[1] }}</b></div>
                <p>{{ c[2] }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Growth360 {
  private readonly toast = inject(ToastService);
  readonly stage = input.required<GrowthStage>();
  protected readonly sources = GROWTH_360_SOURCES;
  protected readonly info = GROWTH_360_INFO;
  protected readonly pct = Math.round((GROWTH_360_INFO.answered / GROWTH_360_INFO.respondents) * 100);
  /** включенные источники (хотя бы один) */
  protected readonly on = signal(new Set([0, 1, 2, 3]));
  protected readonly period = computed(() => (this.stage() === 'done' ? GROWTH_PERIOD.cur : GROWTH_PERIOD.prev));
  protected readonly sub = computed(() => {
    const c = GROWTH_PERIOD.cur;
    return { self: 'Идет сбор оценок за ' + c, wait: 'Оценки за ' + c + ' собраны', plan: '', done: '' }[this.stage()] || `Итог за ${this.period()} · оценивали ${this.info.respondents} коллег`;
  });
  /** выводы: по среднему внешних оценок и по разрыву с самооценкой */
  protected readonly conc = (() => {
    const top = [...GROWTH_360].sort((a, b) => growthOther(b) - growthOther(a)),
      gaps = [...GROWTH_360].sort((a, b) => growthGap(b) - growthGap(a)),
      g0 = gaps[0],
      gl = gaps[gaps.length - 1];
    return [
      ['var(--q-success-500)', 'Сильные стороны', top.slice(0, 2).map((c) => `${c.name} (${growthOther(c)}%)`).join(' · ')],
      ['var(--q-error-500)', 'Зона роста', `${top[top.length - 1].name} (${growthOther(top[top.length - 1])}%)`],
      ['var(--q-warning-500)', 'Слепая зона', `${g0.name} (разрыв +${growthGap(g0)} п. п.)`],
      ['var(--q-warning-300)', 'Скрытый потенциал', `${gl.name} (разрыв ${growthGap(gl)} п. п.)`],
    ];
  })();

  protected toggle(k: number): void {
    const s = new Set(this.on());
    if (s.has(k)) {
      if (s.size === 1) return;
      s.delete(k);
    } else s.add(k);
    this.on.set(s);
  }
  protected report(): void {
    this.toast.show('Готово', 'Полный отчет 360 выгружается в PDF: радар, таблица по компетенциям, комментарии оценивающих и выводы.');
  }
}
