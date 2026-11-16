import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Stepper } from '../../shared/ui/stepper/stepper';
import { ReqBuilder } from '../../widgets/req-builder/req-builder';
import { ReqtypenewInfo } from './reqtypenew-info/reqtypenew-info';
import { REQTYPE_STEPS, ReqtypenewState } from './reqtypenew.state';

/**
 * «Управление персоналом → Заявки → Типы заявок → Новый тип заявки»: степпер «Общая информация → Конструктор заявки»;
 * конструктор — виджет widgets/req-builder (инфоблоки с неизменным набором полей). Внизу — «Назад», «Далее», на последнем шаге — «Сохранить».
 * Параметр адреса rt — id типа для редактирования (название подставляется из справочника). Форма-страница — без «Отменить» (правило 11).
 */
@Component({
  selector: 'app-reqtypenew',
  imports: [PageHead, Stepper, ReqtypenewInfo, ReqBuilder],
  providers: [ReqtypenewState],
  template: `
    <app-page-head [title]="s.editId() ? 'Редактирование типа заявки' : 'Новый тип заявки'" backTo="reqtypes" backLabel="К типам заявок" />
    <app-stepper [steps]="steps" [step]="s.step()" (stepChange)="s.go($event)" [reached]="s.reached()" />
    @switch (s.step()) {
      @case (0) {
        <div reqtypenew-info></div>
      }
      @case (1) {
        <div app-req-builder [(blocks)]="s.blocks" [title]="s.n()"></div>
      }
    }
    <div class="c rtnbar">
      @if (s.step() > 0) {
        <button class="btn raised" (click)="s.back()">Назад</button>
      }
      @if (s.step() < steps.length - 1) {
        <button class="btn pri" (click)="s.next()">Далее</button>
      } @else {
        <button class="btn pri" (click)="s.save()">Сохранить</button>
      }
    </div>
  `,
  styleUrl: './reqtypenew.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-reqtypenew' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reqtypenew {
  protected readonly s = inject(ReqtypenewState);
  protected readonly steps = REQTYPE_STEPS;
  /** id типа заявки из адреса — редактирование; без него — новый тип */
  readonly rt = input('');

  constructor() {
    effect(() => {
      const id = this.rt();
      untracked(() => this.s.open(id));
    });
  }
}
