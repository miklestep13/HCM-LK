import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_BLANK, ATT_STAGES } from '../../../data/attest.data';
import { roleWithGrade } from '../../../data/org.data';
import { ME_PHOTO } from '../../../data/people.data';

const DEC_LABEL: Record<string, string> = {
  Пройдена: 'Аттестация пройдена',
  'Пройдена с условиями': 'Аттестация пройдена с условиями',
  'Не пройдена': 'Аттестация не пройдена',
  'Превосходит ожидания': 'Аттестация: превосходит ожидания',
};
const DEC_TONE: Record<string, string> = { Пройдена: 'ok', 'Пройдена с условиями': 'warn', 'Не пройдена': 'dg', 'Превосходит ожидания': 'info' };

/** Шапка бланка: номер, этап (после решения — «Завершен» и итог); у руководителя — карточка сотрудника (фото, ФИО, должность, подразделение, как в карте целей); период и кампания */
@Component({
  selector: '[attncard-head]',
  template: `
    <div class="cb">
      <div class="iptit">
        <h2 class="tkt">Бланк № {{ b.no }}</h2>
        <span class="gltags iptbdg">
          @if (done()) {
            <span class="bdg ok">Завершен</span><span [class]="'bdg ' + tone()">{{ label() }}</span>
            @if (cand()) {
              <span class="bdg info">Кандидат на повышение</span>
            }
          } @else {
            <span class="bdg warn">{{ stageName() }}</span>
          }
        </span>
      </div>
      @if (s.role() === 'mgr') {
        <div class="atemp">
          <img [src]="photo" alt="" />
          <span class="cnm"><b>{{ b.name }}</b><small>{{ role }}</small><small>Подразделение: {{ b.unit }}</small></span>
        </div>
      }
      <div class="kpis k2 ipkpi">
        <div class="rst"><div class="l">Оцениваемый период</div><div class="v txt">{{ b.period }}</div></div>
        <div class="rst"><div class="l">Период аттестационной кампании</div><div class="v txt">{{ b.campaign }}</div></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardHead {
  protected readonly s = inject(AttestStore);
  protected readonly b = ATT_BLANK;
  /** «Старший кредитный специалист» */
  protected readonly role = roleWithGrade(ATT_BLANK.role, ATT_BLANK.grade);
  /** фото сотрудника бланка (в демо — текущий пользователь) */
  protected readonly photo = ME_PHOTO;
  protected readonly done = computed(() => this.s.post() && this.s.stage() !== 'ipr');
  protected readonly stageName = computed(() => ATT_STAGES.find((x) => x[0] === this.s.stage())?.[1] ?? '');
  private readonly dec = computed(() => (this.s.stage() === 'iprok' ? 'Пройдена' : this.s.res().dec));
  protected readonly label = computed(() => DEC_LABEL[this.dec()] || this.dec());
  protected readonly tone = computed(() => DEC_TONE[this.dec()] || 'ok');
  protected readonly cand = computed(() => !!this.s.res().cand && this.s.stage() !== 'iprok');
}
