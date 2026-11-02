import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { IPR_STATUS_LABEL, IPR_STATUS_TONE } from '../../../data/ipr.data';
import { roleWithGrade, shortFio } from '../../../data/org.data';
import { ME, ME_PHOTO } from '../../../data/people.data';
import { Progress } from '../../../shared/ui/progress/progress';

/**
 * Шапка плана: название, статус (и «Просрочен»), «Редактировать» (черновик и утвержденный план),
 * серый подстрочник (скрыт: showSub), у руководителя — карточка сотрудника (фото, ФИО, должность, подразделение, как в карте целей), описание, плитки (вид развития, текущая и целевая должность, срок) и прогресс.
 */
@Component({
  selector: '[ipr-head]',
  imports: [Progress],
  template: `
    @let P = s.plan();
    <div class="cb">
      <div class="iptit">
        <h2 class="tkt">{{ P.name }}</h2>
        <span class="gltags iptbdg"
          ><span class="bdg" [class]="tone()">{{ label() }}</span>
          @if (s.over()) {
            <span class="bdg dg">Просрочен</span>
          }
        </span>
        @if (s.editable()) {
          <span class="objacts"><button class="btn raised" (click)="edit.emit()">Редактировать</button></span>
        }
      </div>
      @if (showSub) {
        <div class="ipsub">
          <span
            >Период: {{ P.per }}&nbsp;&nbsp;Создан: {{ P.created }}&nbsp;&nbsp;Автор: {{ fio(P.author) }}{{ P.expert ? '  Эксперт: ' + fio(P.expert) : ''
            }}{{ P.tpl ? '  Шаблон: ' + P.tpl : '' }}</span
          >
        </div>
      }
      @if (s.isMgr()) {
        <div class="ipemp">
          <img [src]="photo" alt="" />
          <span class="cnm"><b>{{ name }}</b><small>{{ grade(P.curRole, P.curGrade) }}</small><small>Подразделение: {{ dept() }}</small></span>
        </div>
      }
      <p class="mtdsc">{{ P.desc }}</p>
      <div class="kpis k4 ipkpi">
        <div class="rst"><div class="l">Вид развития</div><div class="v txt">{{ P.kind }}</div></div>
        <div class="rst"><div class="l">Текущая должность</div><div class="v txt">{{ grade(P.curRole, P.curGrade) }}</div></div>
        <div class="rst"><div class="l">Целевая должность</div><div class="v txt">{{ grade(P.tRole, P.tGrade) }}</div></div>
        <div class="rst"><div class="l">Срок выполнения</div><div class="v txt" [class.rd]="s.over()">{{ P.due }}</div></div>
      </div>
      <app-progress
        class="prgbar ipprg"
          label="Выполнено"
          [value]="s.progress() + '%'"
          [percent]="s.progress()"
          [tone]="s.st() === 'Выполнено' ? 'ok' : s.over() ? 'dg' : ''"
          [caption]="'Закрыто ' + s.doneN() + ' из ' + P.tasks.length + ' задач'"
        />
    </div>
  `,
  host: { class: 'c iphead' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprHead {
  protected readonly s = inject(IprStore);
  readonly edit = output<void>();
  protected readonly fio = shortFio;
  /** должность с грейдом: «Старший кредитный специалист» */
  protected readonly grade = roleWithGrade;
  /** серый подстрочник (период, создан, автор, эксперт, шаблон) пока скрыт — может понадобиться на других страницах */
  protected readonly showSub = false;
  /** сотрудник плана (в демо — текущий пользователь) */
  protected readonly name = ME[0];
  protected readonly photo = ME_PHOTO;
  protected readonly tone = computed(() => IPR_STATUS_TONE[this.s.st()]);
  protected readonly label = computed(() => IPR_STATUS_LABEL[this.s.st()] || this.s.st());
  protected readonly dept = computed(() => this.s.plan().dept.split(' · ').pop());
}
