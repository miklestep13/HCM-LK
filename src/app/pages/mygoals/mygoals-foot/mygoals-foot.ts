import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { goalForm, goalMyEvaluator, goalPeople } from '../../../core/demo/goals-store.service';
import { MAP_ME } from '../../../data/goals.data';
import { GoalStage } from '../../../interface/goal';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Float } from '../../../shared/ui/float/float';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MygoalsState } from '../mygoals.state';

/**
 * Действия этапа внизу страницы (остров, как у ИПР): черновик — «Отправить на согласование»,
 * согласование — «Согласовать» с меню (согласовать / вернуть на доработку), самооценка и оценка заказчиков — прогресс и отправка.
 */
@Component({
  selector: '[mygoals-foot]',
  imports: [Float],
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
        @case ('appr') {
          <button class="btn pri glapb" aria-haspopup="menu" (click)="toggleMenu($event)">
            Согласовать<svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        }
      }
    </div>
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m" (click)="$event.stopPropagation()">
        <button class="ami" (click)="approve()">Согласовать</button>
        <button class="ami" (click)="back()">Вернуть на доработку</button>
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalsFoot {
  protected readonly s = inject(MygoalsState);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  /** кому уходит карта — руководитель в дательном падеже, как в прототипе */
  private readonly mgr = MAP_ME.mgr;
  protected readonly menu = signal<HTMLElement | null>(null);

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
      this.go('appr', 'Отправлено', 'Карта на согласовании у руководителя.');
  }
  protected async sendSelf(): Promise<void> {
    const n = this.s.list().length;
    if (await this.confirm.ask({ title: 'Отправить самооценку?', text: 'Оценки по ' + n + ' целям уйдут ' + this.mgr + '. После отправки изменить их нельзя.', ok: 'Отправить' }))
      this.go('wait', 'Самооценка отправлена', 'Руководитель поставит итоговые оценки.');
  }
  protected async sendCust(): Promise<void> {
    const n = this.s.list().length;
    if (await this.confirm.ask({ title: 'Отправить оценку?', text: 'Итоговые оценки по ' + n + ' целям уйдут на калибровку. После отправки изменить их нельзя.', ok: 'Отправить' }))
      this.go('fin', 'Оценка отправлена', 'Карта перешла на этап «Итог».');
  }
  protected toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    if (this.menu()) return this.menu.set(null);
    this.menu.set(e.currentTarget as HTMLElement);
  }
  protected async approve(): Promise<void> {
    this.menu.set(null);
    const ws = this.s.weight(), n = this.s.list().length;
    if (ws !== 100) return this.toast.show('Сумма весов не равна 100%', 'Сейчас ' + ws + '%. Согласовать можно карту с общим весом ровно 100%.');
    if (await this.confirm.ask({ title: 'Согласовать карту целей?', text: 'Все ' + n + ' целей будут утверждены. После утверждения карта не редактируется.', ok: 'Согласовать' }))
      this.go('plan', 'Карта утверждена', 'Цели доступны только для просмотра.');
  }
  protected async back(): Promise<void> {
    this.menu.set(null);
    if (await this.confirm.ask({ title: 'Вернуть на доработку?', text: 'Карта вернется в черновик — цели можно будет изменить и отправить снова.', ok: 'Вернуть' })) {
      this.s.demo.goalFill.set('full');
      this.go('draft', 'Карта возвращена на доработку', 'Этап — «Черновик».');
    }
  }
}
