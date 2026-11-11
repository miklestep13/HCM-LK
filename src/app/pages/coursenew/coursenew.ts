import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { COURSE_STEPS } from '../../data/coursenew.data';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Stepper } from '../../shared/ui/stepper/stepper';
import { Builder } from '../../widgets/builder/builder';
import { CoursenewInfo } from './coursenew-info/coursenew-info';
import { CoursenewState } from './coursenew.state';

/**
 * «Управление персоналом → Обучение → Добавить курс» (перенесено из старого прототипа, pg-coursenew), как форма опроса:
 * степпер «Общая информация → Структура → Автоматическое назначение → Участники»; структура — общий конструктор материалов
 * (widgets/builder: раздел → модуль → блоки, справа настройки, «Предпросмотр»). Внизу — «Назад», «Далее», на последнем шаге «Сохранить»
 * (форма-страница — без «Отменить»). Демо в dev-панели: пустой курс или пример.
 */
@Component({
  selector: 'app-coursenew',
  imports: [PageHead, Stepper, Icon, Builder, CoursenewInfo],
  providers: [CoursenewState],
  template: `
    <app-page-head title="Добавление курса" backTo="learn" backLabel="К каталогу курсов" />
    <app-stepper [steps]="steps" [step]="s.step()" (stepChange)="s.go($event)" [reached]="s.reached()" />
    @switch (s.step()) {
      @case (0) {
        <div coursenew-info></div>
      }
      @case (1) {
        <div app-builder [material]="s.mat()"></div>
      }
      @default {
        <div class="c">
          <div class="cb">
            <div class="empty cnwip">
              <div class="wipi"><app-icon [name]="s.step() === 2 ? 'refresh' : 'group'" /></div>
              <b>{{ steps[s.step()] }}</b>
              <small>{{ s.step() === 2 ? 'Правила автоматического назначения курса появятся после согласования состава вкладки' : 'Списки назначенных сотрудников и групп появятся после согласования состава вкладки' }}</small>
            </div>
          </div>
        </div>
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
          <button class="btn pri" (click)="s.save()">Сохранить</button>
        }
      </div>
    </div>
  `,
  styleUrl: './coursenew.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-coursenew' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Coursenew {
  protected readonly s = inject(CoursenewState);
  private readonly dev = inject(DevPanelService);
  protected readonly steps = COURSE_STEPS;
  constructor() {
    this.s.load('all');
    effect((onCleanup) => {
      onCleanup(
        this.dev.register({
          id: 'courseDemo',
          label: 'Курс',
          options: [
            { value: 'empty', label: 'Новый (пустой)' },
            { value: 'demo', label: 'Пример курса' },
            { value: 'all', label: 'Все виды модулей' },
          ],
          value: devValue<'empty' | 'demo' | 'all'>(() => this.s.demo(), (v) => this.s.load(v)),
        }),
      );
    });
  }
}
