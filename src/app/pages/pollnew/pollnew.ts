import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { FormTabs } from '../../shared/ui/form-tabs/form-tabs';
import { PollnewInfo } from './pollnew-info/pollnew-info';
import { PollnewWaves } from './pollnew-waves/pollnew-waves';
import { Builder } from '../../widgets/builder/builder';
import { POLL_STEPS, PollnewState } from './pollnew.state';

/**
 * «Управление персоналом → Опросы → Новый опрос / Редактирование опроса» (перенесено из старого прототипа, pg-pollnew):
 * верхние вкладки «Общая информация → Вопросы → Процедуры назначения» (shared/ui/form-tabs, как у курса);
 * вопросы — в конструкторе (widgets/builder); внизу — «Отмена» / «Сохранить» (вкладки переключают шаги).
 * Параметр адреса poll — номер опроса для редактирования; без него — новый опрос с нуля.
 */
@Component({
  selector: 'app-pollnew',
  imports: [PageHead, PollnewInfo, Builder, PollnewWaves, FormTabs],
  providers: [PollnewState],
  template: `
    <app-page-head [title]="s.editIdx() != null ? 'Редактирование опроса' : 'Новый опрос'" backTo="polls" backLabel="К опросам" />
    <app-form-tabs [steps]="steps" [step]="s.step()" (stepChange)="s.go($event)" [reached]="s.reached()" />
    @switch (s.step()) {
      @case (0) {
        <div pollnew-info></div>
      }
      @case (1) {
        <!-- вопросы — в общем конструкторе материалов: «По модулям» — модули с вопросами, «Вопрос за вопросом» — только вопросы -->
        <div app-builder [material]="s.bld()" [addMods]="false" [stats]="false" [tree]="false" [survey]="s.svInfo()" (changed)="s.fromBld($event)"></div>
      }
      @case (2) {
        <div pollnew-waves></div>
      }
    }
    <div class="c ipisl">
      <div class="ipff">
        <button class="btn raised" (click)="cancel()">Отмена</button>
        <button class="btn pri" (click)="save()">Сохранить</button>
      </div>
    </div>
  `,
  styleUrl: './pollnew.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-pollnew' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pollnew {
  /** номер опроса для редактирования (параметр адреса) */
  readonly poll = input('');
  protected readonly s = inject(PollnewState);
  protected readonly steps = POLL_STEPS;

  constructor() {
    effect(() => {
      const p = this.poll();
      untracked(() => this.s.open(p));
    });
  }
  /** «Отмена» — к списку опросов без сохранения */
  protected cancel(): void {
    this.s.cancel();
  }
  /** «Сохранить»: статус — из формы («Черновик» — без публикации, иначе — с проверкой процедур) */
  protected save(): void {
    this.s.save(this.s.status() !== 'Черновик');
  }
}
