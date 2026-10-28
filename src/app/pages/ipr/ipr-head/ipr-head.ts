import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { IPR_STATUS_LABEL, IPR_STATUS_TONE } from '../../../data/ipr.data';
import { shortFio } from '../../../data/org.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';

/**
 * Шапка плана: название, статус (и «Просрочен»), «Редактировать» (черновик и утвержденный план),
 * серый подстрочник, заметка по статусу, описание, плитки (вид развития, целевая должность, срок) и прогресс.
 */
@Component({
  selector: '[ipr-head]',
  imports: [Icon, Progress, Tooltip],
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
          <span class="ipact"><button class="ib3" appTip="Редактировать" aria-label="Редактировать" (click)="edit.emit()"><app-icon name="edit" /></button></span>
        }
      </div>
      <div class="ipsub">
        <span>Текущая должность: {{ P.curRole }} ({{ P.curGrade }})&nbsp;&nbsp;Подразделение: {{ dept() }}</span>
        <span
          >Период: {{ P.per }}&nbsp;&nbsp;Создан: {{ P.created }}&nbsp;&nbsp;Автор: {{ fio(P.author) }}{{ P.expert ? '  Эксперт: ' + fio(P.expert) : ''
          }}{{ P.tpl ? '  Шаблон: ' + P.tpl : '' }}</span
        >
      </div>
      @switch (s.st()) {
        @case ('В работе') {
          <div class="ipnote">
            <b>План в работе</b>Состав плана закрыт для изменений. Рабочие задачи отмечайте выполненными сами — их можно вернуть в работу. Задачи с обучением закрываются автоматически после
            прохождения курса.
          </div>
        }
        @case ('Аттестация') {
          @if (s.isMgr()) {
            <div class="ipnote"><b>Идет аттестация</b>План закрыт для изменений. Оцените выполнение каждой задачи: выполнена, частично или не выполнена. К любой задаче можно оставить комментарий.</div>
          } @else {
            <div class="ipnote"><b>Идет аттестация</b>Руководитель {{ fio(P.mgr[0]) }} оценивает выполнение задач. План закрыт для изменений; ответить руководителю можно в комментариях к задаче.</div>
          }
        }
        @case ('Предложено') {
          <div class="ipnote warn">План на согласовании у руководителя — {{ fio(P.mgr[0]) }}.</div>
        }
        @case ('Не выполнено') {
          <div class="ipnote dg"><b>Невыполнение зафиксировано руководителем</b>Закрыто {{ s.doneN() }} из {{ P.tasks.length }} заданий.</div>
        }
      }
      <p class="mtdsc">{{ P.desc }}</p>
      <div class="kpis k3 ipkpi">
        <div class="rst"><div class="l">Вид развития</div><div class="v txt">{{ P.kind }}</div></div>
        <div class="rst"><div class="l">Целевая должность</div><div class="v txt">{{ P.tRole }} ({{ P.tGrade }})</div></div>
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
  protected readonly tone = computed(() => IPR_STATUS_TONE[this.s.st()]);
  protected readonly label = computed(() => IPR_STATUS_LABEL[this.s.st()] || this.s.st());
  protected readonly dept = computed(() => this.s.plan().dept.split(' · ').pop());
}
