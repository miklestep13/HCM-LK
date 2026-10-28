import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LearnAction } from '../../interface/learn';
import { Icon } from '../../shared/ui/icon/icon';
import { Tooltip } from '../../shared/ui/tooltip/tooltip';

/** Кнопка карточки и страницы обучения (курс, программа, мероприятие) по статусу или пометка «недоступно» (замок + текст + подсказка) */
@Component({
  selector: '[learn-action]',
  imports: [Icon, Tooltip],
  template: `
    @if (btn(); as a) {
      <button class="btn" [class.pri]="!a.raised" [class.raised]="a.raised" (click)="act.emit(a.act)">{{ a.label }}</button>
    } @else if (note(); as a) {
      <div class="lfnote" [class.tipt]="!!a.tip" [appTip]="a.tip || ''"><app-icon [name]="a.lock ? 'lock' : 'clock'" />{{ a.label }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnActionButton {
  readonly action = input<LearnAction>(null);
  readonly act = output<string>();
  protected readonly btn = computed(() => {
    const a = this.action();
    return a?.kind === 'btn' ? a : null;
  });
  protected readonly note = computed(() => {
    const a = this.action();
    return a?.kind === 'note' ? a : null;
  });
}
