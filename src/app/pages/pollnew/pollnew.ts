import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, signal, untracked } from '@angular/core';
import { Float } from '../../shared/ui/float/float';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Stepper } from '../../shared/ui/stepper/stepper';
import { PollnewInfo } from './pollnew-info/pollnew-info';
import { PollnewSettings } from './pollnew-settings/pollnew-settings';
import { PollnewWaves } from './pollnew-waves/pollnew-waves';
import { PollnewPub } from './pollnew-pub/pollnew-pub';
import { Builder } from '../../widgets/builder/builder';
import { POLL_STEPS, PollnewState } from './pollnew.state';

/**
 * «Управление персоналом → Опросы → Новый опрос / Редактирование опроса» (перенесено из старого прототипа, pg-pollnew):
 * степпер «Общая информация → Вопросы → Процедуры опроса → Публикация» (shared/ui/stepper); вопросы — в конструкторе (widgets/builder); внизу — «Назад», «Далее»
 * (проверяет шаг), на последнем шаге — «Сохранить» (черновик или с публикацией). Форма-страница — без «Отменить» (правило 11).
 * Параметр адреса poll — номер опроса для редактирования; без него — новый опрос с нуля.
 */
@Component({
  selector: 'app-pollnew',
  imports: [PageHead, Icon, Float, PollnewInfo, PollnewSettings, Builder, PollnewWaves, PollnewPub, Stepper],
  providers: [PollnewState],
  template: `
    <app-page-head [title]="s.editIdx() != null ? 'Редактирование опроса' : 'Новый опрос'" backTo="polls" backLabel="К опросам" />
    <app-stepper [steps]="steps" [step]="s.step()" (stepChange)="s.go($event)" [reached]="s.reached()" />
    @switch (s.step()) {
      @case (0) {
        <div pollnew-info></div>
        <div pollnew-settings></div>
      }
      @case (1) {
        <!-- вопросы — в общем конструкторе материалов: «По модулям» — модули с вопросами, «Вопрос за вопросом» — только вопросы -->
        <div app-builder [material]="s.bld()" (changed)="s.fromBld($event)"></div>
      }
      @case (2) {
        <div pollnew-waves></div>
      }
      @case (3) {
        <div pollnew-pub></div>
      }
    }
    <div class="c ipisl">
      <div class="ipff">
        @if (s.step() > 0) {
          <button class="btn raised" (click)="s.back()">Назад</button>
        }
        @if (s.step() < steps.length - 1) {
          <button class="btn pri" (click)="s.next()">Далее</button>
        } @else {
          <button class="btn pri pnsave" (click)="toggle($event)">Сохранить<app-icon name="chevDown" /></button>
        }
      </div>
    </div>
    @if (menu(); as a) {
      <div class="fpop amenu" [appFloat]="a" (click)="$event.stopPropagation()">
        <button class="ami" (click)="save(false)"><app-icon name="edit" />Сохранить черновик</button>
        <button class="ami" (click)="save(true)"><app-icon name="qSingle" />Сохранить и опубликовать</button>
      </div>
    }
  `,
  styleUrl: './pollnew.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-pollnew', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pollnew {
  /** номер опроса для редактирования (параметр адреса) */
  readonly poll = input('');
  protected readonly s = inject(PollnewState);
  protected readonly menu = signal<HTMLElement | null>(null);
  protected readonly steps = POLL_STEPS;

  constructor() {
    effect(() => {
      const p = this.poll();
      untracked(() => this.s.open(p));
    });
  }
  protected toggle(e: Event): void {
    e.stopPropagation();
    const a = e.currentTarget as HTMLElement;
    this.menu.set(this.menu() === a ? null : a);
  }
  protected save(pub: boolean): void {
    this.menu.set(null);
    this.s.save(pub);
  }
}
