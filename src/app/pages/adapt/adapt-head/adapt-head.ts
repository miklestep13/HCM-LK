import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { dNum } from '../../../core/demo/ipr-store.service';
import { IPR_TODAY } from '../../../data/ipr.data';
import { ADAPT_FROM, ADAPT_TO, PROBATION_TO } from '../../../data/adapt.data';
import { IprStatus } from '../../../interface/ipr';
import { Icon } from '../../../shared/ui/icon/icon';
import { AdaptStore } from '../adapt-store';

const LABEL: Record<IprStatus, string> = {
  Черновик: 'Создан',
  Предложено: 'На согласовании',
  Утверждено: 'В процессе',
  'В работе': 'В процессе',
  Аттестация: 'Оценка эксперта',
  Выполнено: 'Выполнено',
  'Выполнено частично': 'Выполнено частично',
  'Не выполнено': 'Не пройден',
};

const TONE: Record<IprStatus, string> = {
  Черновик: '',
  Предложено: 'warning',
  Утверждено: 'warning',
  'В работе': 'warning',
  Аттестация: 'info',
  Выполнено: 'success',
  'Выполнено частично': 'warning',
  'Не выполнено': 'error',
};

/**
 * Шапка объекта адаптации: название, бейдж, описание, серые KPI и полоса прогресса.
 * Собрана из частей новой ДС (бейдж, KPI, прогресс). Цвет KPI — как серые плитки прототипа.
 */
@Component({
  selector: '[adapt-head]',
  imports: [Icon],
  template: `
    <div class="cb ad-head">
      <div class="ad-title">
        <h2>{{ s.plan().name }}</h2>
        <span class="q-badge" [class.q-badge--warning]="tone() === 'warning'" [class.q-badge--success]="tone() === 'success'" [class.q-badge--error]="tone() === 'error'" [class.q-badge--info]="tone() === 'info'">{{ label() }}</span>
        @if (late()) {
          <span class="q-badge q-badge--error">Просрочен</span>
        }
        @if (s.editable()) {
          <button class="ad-pen" type="button" title="Редактировать" aria-label="Редактировать" (click)="edit.emit()">
            <app-icon name="edit" />
          </button>
        }
      </div>
      @if (s.isMgr()) {
        <div class="ad-user">
          <span class="av av2"></span>
          <span class="ad-user-tx"><b>Ершов Никита Павлович</b><small>Специалист по кредитованию</small></span>
        </div>
      }
      <p class="ad-desc">{{ s.plan().desc }}</p>
      <div class="q-kpis" style="--n: 3">
        <div class="q-kpi">
          <div class="q-kpi__head"><span class="q-kpi__title">Период адаптации</span></div>
          <div class="q-kpi__value">{{ from }} – {{ to }}</div>
        </div>
        <div class="q-kpi">
          <div class="q-kpi__head"><span class="q-kpi__title">Испытательный срок</span></div>
          <div class="q-kpi__value">до {{ probation }}</div>
        </div>
        <div class="q-kpi">
          <div class="q-kpi__head"><span class="q-kpi__title">Результат</span></div>
          <div class="q-kpi__value">{{ result() }}</div>
        </div>
      </div>
      <div
        class="q-prg q-prg--l"
        [class.q-prg--success]="bar() === 'success'"
        [class.q-prg--warning]="bar() === 'warning'"
        [class.q-prg--danger]="bar() === 'danger'"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="pct()"
        aria-label="Выполнено"
      >
        <div class="q-prg__head">
          <span class="q-prg__label">Выполнено</span>
          <span class="q-prg__value">{{ pct() }}%</span>
        </div>
        <div class="q-prg__track"><i class="q-prg__fill" [style.--p]="pct() + '%'"></i></div>
        <div class="q-prg__sub">Закрыто {{ s.doneN() }} из {{ s.plan().tasks.length }} задач</div>
      </div>
    </div>
  `,
  host: { class: 'c ad-ohead' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptHead {
  protected readonly s = inject(AdaptStore);
  readonly edit = output<void>();
  protected readonly from = ADAPT_FROM;
  protected readonly to = ADAPT_TO;
  protected readonly probation = PROBATION_TO;
  protected readonly label = computed(() => LABEL[this.s.st()]);
  protected readonly tone = computed(() => TONE[this.s.st()]);
  /** «Просрочен» — только если прошел срок самого плана */
  protected readonly late = computed(() => {
    const st = this.s.st();
    return !['Выполнено', 'Выполнено частично', 'Не выполнено'].includes(st) && dNum(ADAPT_TO) < dNum(IPR_TODAY);
  });
  /** у завершенного плана полоса доходит до конца */
  protected readonly pct = computed(() => (['Выполнено', 'Выполнено частично', 'Не выполнено'].includes(this.s.st()) ? 100 : this.s.progress()));
  /** полоса: успех у пройденного плана, предупреждение при отставании, ошибка если срок плана прошел */
  protected readonly bar = computed(() => {
    const st = this.s.st();
    if (st === 'Выполнено') return 'success';
    if (st !== 'Утверждено') return '';
    if (this.late()) return 'danger';
    const behind = this.s.plan().tasks.some((t) => !t.done && dNum(t.due) < dNum(IPR_TODAY));
    return behind ? 'warning' : '';
  });
  /** итог в карточке «Результат» */
  protected readonly result = computed(() => {
    const st = this.s.st();
    if (st === 'Выполнено') return 'Пройден';
    if (st === 'Выполнено частично' || st === 'Не выполнено') return 'Не пройден';
    return '—';
  });
}
