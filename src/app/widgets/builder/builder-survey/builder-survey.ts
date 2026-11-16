import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { ObjectHead, ObjectHeadKpi, ObjectHeadProgress } from '../../../shared/ui/object-head/object-head';
import { BldBlockView } from '../builder-block/builder-block';
import { BuilderState } from '../builder.state';

/**
 * «Предпросмотр» опроса — как действующая страница прохождения опроса (pages/survey): одна колонка,
 * шапка объекта (название, «Анонимный», плитки «Срок», «Время прохождения», «Вопросов», описание, прогресс «Выполнено»),
 * под ней все вопросы одной карточкой (легенда «* — обязательный вопрос»), ниже отдельным блоком — «Завершить».
 * Данные шапки — вход [survey] конструктора (BldSurveyInfo).
 */
@Component({
  selector: '[bld-survey]',
  imports: [ObjectHead, Icon, BldBlockView],
  template: `
    @let M = s.mat();
    @let I = s.survey();
    @let _v = s.ver();
    <div app-object-head [title]="I?.t || M.t || s.conf().name + ' без названия'" [desc]="I?.d || ''" [kpis]="kpis()" [progress]="progress()">
      <span ohStatus class="bdg">{{ fin() ? 'Завершен' : 'Доступен' }}</span>
      @if (I?.anon) {
        <span ohStatus class="bdg bldsvanon"><app-icon name="lock" />Анонимный</span>
      }
      @if (fin()) {
        <div class="ohnote"><b>Ответы отправлены</b>Так сотрудник увидит пройденный опрос.</div>
      }
    </div>
    <div class="c bldsvmain">
      <div class="bldsvleg"><span class="bldsvreq">*</span> — обязательный вопрос</div>
      <div class="bldsvbody" [class.ro]="fin()">
        @for (b of blocks(); track b.id) {
          <div bld-block live [b]="b"></div>
        } @empty {
          <div class="blph">В опросе пока нет вопросов</div>
        }
      </div>
    </div>
    <div class="c bldsvnav">
      @if (fin()) {
        <button class="btn raised" (click)="fin.set(false)">Пройти заново</button>
      } @else {
        <button class="btn pri" (click)="fin.set(true)">Завершить</button>
      }
    </div>
  `,
  host: { class: 'bldsv' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldSurvey {
  protected readonly s = inject(BuilderState);
  protected readonly fin = signal(false);
  /** все блоки опроса подряд, без деления на модули */
  protected readonly blocks = computed(() => {
    this.s.ver();
    return this.s.mods().flatMap((m) => m.blocks);
  });
  protected readonly kpis = computed((): ObjectHeadKpi[] => {
    const I = this.s.survey();
    return [
      { label: 'Срок', value: I?.end ? 'до ' + I.end : 'Без срока' },
      { label: 'Время прохождения', value: I?.dur ? '≈ ' + I.dur + ' мин' : '—' },
      { label: 'Вопросов', value: String(this.s.qnum().size) },
    ];
  });
  protected readonly progress = computed((): ObjectHeadProgress => {
    const n = this.s.qnum().size,
      a = this.fin() ? n : 0,
      pct = n ? Math.round((a / n) * 100) : 0;
    return { label: 'Выполнено', value: pct + '%', percent: pct, tone: pct === 100 ? 'ok' : '', caption: `Отвечено ${a} из ${n}` };
  });
}
