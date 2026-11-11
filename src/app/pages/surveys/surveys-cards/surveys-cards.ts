import { Progress } from '../../../shared/ui/progress/progress';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { SURVEY_STATUS_TONE } from '../../../data/surveys.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { SurveysState } from '../surveys.state';

/**
 * Карточка опроса: статус над названием, под названием данные с иконками
 * (срок — оранжевый за 3 дня и меньше, красный — просрочено; время, вопросы, «Анонимно»), внизу — прогресс начатого или результат теста.
 * Кнопок нет — карточка открывается кликом. Автор, тип, описание и «Обязательный» в карточке не показываем.
 */
@Component({
  selector: '[surveys-cards]',
  imports: [Progress, Icon],
  template: `
    @for (x of s.pg.view(); track x.id) {
      @let d = s.due(x);
      <div class="vcard svc" tabindex="0" role="link" [attr.aria-label]="x.title" (click)="s.open(x)" (keydown.enter)="s.open(x)">
        <!-- статус — над названием -->
        <div class="svhd"><span class="bdg" [class]="tone[x.status]">{{ x.status }}</span></div>
        <div class="svtt" [title]="x.title">{{ x.title }}</div>
        <div class="svmeta">
          <span class="svdue" [class]="d.tone"><app-icon [name]="x.status === 'Завершен' ? 'check' : 'calendar'" />{{ d.t }}</span>
          <span><app-icon name="clock" />≈ {{ x.minutes }} мин</span>
          <span><app-icon name="test" />{{ s.questionsText(x) }}</span>
          @if (x.anon) {
            <span><app-icon name="lock" />Анонимно</span>
          }
        </div>
        @let p = s.progress(x);
        @if (p) {
          <!-- прогресс внизу карточки — как в «Обучении»: «Выполнено» / «Результат» и процент над полосой, под ней «9 из 25» -->
          <app-progress class="svcpr" label="Выполнено" [value]="p.value" [percent]="p.pct" [tone]="p.tone" [caption]="p.caption" />
        }
      </div>
    } @empty {
      <div class="c mtcempty"><div class="empty"><b>По этим условиям опросов нет</b><small>Измените поиск или условия фильтров</small></div></div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveysCards {
  protected readonly s = inject(SurveysState);
  protected readonly tone = SURVEY_STATUS_TONE;
}
