import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { goalForm, goalMyEvaluator, goalPeople } from '../../../core/demo/goals-store.service';
import { MAP_ME } from '../../../data/goals.data';
import { GoalStage } from '../../../interface/goal';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MygoalsState } from '../mygoals.state';

/**
 * Действия внизу страницы (остров, как у ИПР): при заведении целей — «Отправить на согласование» (карта утверждается);
 * в периоде оценки — прогресс и отправка: у сотрудника — самооценки, у руководителя — оценок участника (после нее карта завершена).
 * В статусах «Утверждено» и «Завершена» действий нет.
 */
@Component({
  selector: '[mygoals-foot]',
  template: `
    <div class="ipff">
      @switch (s.stage()) {
        @case ('draft') {
          <button class="btn pri" [disabled]="!s.list().length" (click)="send()">Отправить на согласование</button>
        }
        @case ('self') {
          <span class="glsprog">Оценено {{ selfDone() }} из {{ s.list().length }}</span>
          <button class="btn pri" [disabled]="!selfReady()" [title]="selfReady() ? '' : 'Оцените все цели, чтобы отправить самооценку'" (click)="sendSelf()">Отправить самооценку</button>
        }
        @case ('cust') {
          <span class="glsprog">Оценено {{ custDone() }} из {{ s.list().length }}</span>
          <button class="btn pri" [disabled]="!custReady()" [title]="custReady() ? '' : 'Оцените все цели, чтобы отправить оценку'" (click)="sendCust()">Отправить оценку</button>
        }
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalsFoot {
  protected readonly s = inject(MygoalsState);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  /** кому уходит карта — руководитель в дательном падеже, как в прототипе */
  private readonly mgr = MAP_ME.mgr;

  protected readonly selfDone = computed(() => this.s.list().filter((g) => g.self).length);
  protected readonly selfReady = computed(() => !!this.s.list().length && this.selfDone() === this.s.list().length);
  /** на оценке заказчиков количественные и бинарные оценены автоматически; качественные — когда сохранена моя оценка */
  protected readonly custDone = computed(
    () =>
      this.s.list().filter((g) => {
        if (goalForm(g).kind !== 'txt') return true;
        const me = goalMyEvaluator(goalPeople(g).filter((p) => p.role !== 'Исполнитель'));
        return !!(me && g.evs?.[me.n]?.saved);
      }).length,
  );
  protected readonly custReady = computed(() => !!this.s.list().length && this.custDone() === this.s.list().length);

  private go(st: GoalStage, title: string, text: string): void {
    this.s.demo.goalStage.set(st);
    this.toast.show(title, text);
  }
  protected async send(): Promise<void> {
    const ws = this.s.weight(), n = this.s.list().length;
    if (ws !== 100) return this.toast.show('Сумма весов не равна 100%', 'Сейчас ' + ws + '%. Карта уходит на согласование целиком, веса должны давать ровно 100%.');
    if (await this.confirm.ask({ title: 'Отправить карту на согласование?', text: 'Все ' + n + ' целей уйдут ' + this.mgr + ' одним пакетом. После утверждения карта не редактируется.', ok: 'Отправить' }))
      this.go('plan', 'Карта утверждена', 'Цели согласованы. Оценки откроются в период оценки.');
  }
  protected async sendSelf(): Promise<void> {
    const n = this.s.list().length;
    if (await this.confirm.ask({ title: 'Отправить самооценку?', text: 'Оценки по ' + n + ' целям уйдут ' + this.mgr + '. После отправки изменить их нельзя.', ok: 'Отправить' }))
      this.toast.show('Самооценка отправлена', 'Руководитель и заказчики ставят свои оценки в этот же период.');
  }
  protected async sendCust(): Promise<void> {
    const n = this.s.list().length;
    if (await this.confirm.ask({ title: 'Отправить оценку?', text: 'Итоговые оценки по ' + n + ' целям уйдут на калибровку. После отправки изменить их нельзя.', ok: 'Отправить' }))
      this.go('fin', 'Оценка отправлена', 'Карта целей завершена.');
  }
}
