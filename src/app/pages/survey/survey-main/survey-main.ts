import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SurveyQuestionBlock } from '../survey-question/survey-question';
import { SurveyPassState } from '../survey.state';

/**
 * Вопросы опроса друг под другом (одной карточкой), без деления на блоки и шаги; ниже отдельным блоком — «Завершить»
 * (обязательные без ответа подсвечиваются, страница прокручивается к первому из них).
 */
@Component({
  selector: '[survey-main]',
  imports: [SurveyQuestionBlock],
  template: `
    @if (s.nine()) {
      <!-- 9-box: на каждого сотрудника — своя карточка: фото, ФИО, должность и тот же блок вопросов -->
      @for (e of s.nineBox.employees; track e.id) {
        <div class="c svemp">
          <div class="svemph">
            <span class="av" [class]="e.av"></span>
            <span><b>{{ e.name }}</b><small>{{ e.pos }}</small></span>
          </div>
          <fieldset class="svbody" [disabled]="s.ro()" [class.ro]="s.ro()">
            @for (q of s.of(e.id); track q.id) {
              <div survey-question [q]="q"></div>
            }
          </fieldset>
        </div>
      }
    } @else {
      <div class="c svmain">
        <!-- легенда: звездочка — обязательный вопрос -->
        <div class="svleg"><span class="sqreq">*</span> — обязательный вопрос</div>
        <fieldset class="svbody" [disabled]="s.ro()" [class.ro]="s.ro()">
          @for (q of s.questions; track q.id) {
            <div survey-question [q]="q"></div>
          }
        </fieldset>
      </div>
    }
    @if (!s.ro()) {
      <!-- «Завершить» — отдельным блоком под вопросами -->
      <div class="c svnav"><button class="btn pri" (click)="finish()">Завершить</button></div>
    }
  `,
  host: { style: 'display:block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyMain {
  protected readonly s = inject(SurveyPassState);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected async finish(): Promise<void> {
    const miss = this.s.missing();
    if (miss.length) {
      this.s.mark();
      this.toast.show('Ответьте на обязательные вопросы', `Осталось ${miss.length}: вопросы отмечены красным.`);
      this.s.goTo(miss[0].id);
      return;
    }
    const left = this.s.questions.length - this.s.answeredN();
    const ok = await this.confirm.ask({
      title: 'Завершить опрос?',
      text: (left ? `Без ответа — **${left}** необязательных вопросов. ` : '') + 'После отправки изменить ответы нельзя.',
      ok: 'Завершить',
    });
    if (!ok) return;
    this.toast.show('Опрос завершен', 'Спасибо! Ответы отправлены.');
    this.nav.go('surveys');
  }
}
