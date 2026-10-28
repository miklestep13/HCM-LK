import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Modal } from '../../../shared/ui/modal/modal';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { inject } from '@angular/core';

/** Окно с комментарием: запрос руководителю, «Вернуть на доработку» — подсказка, поле, кнопка */
@Component({
  selector: 'app-ipr-comment',
  imports: [Modal],
  template: `
    <app-modal [title]="title()" panel="mdl-md" [open]="true" (openChange)="closed.emit()">
      <p class="mygld" style="margin: 0 0 12px">{{ hint() }}</p>
      <textarea class="fta" rows="4" placeholder="Комментарий" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
      <div class="mdlf glmf">
        <button class="btn raised" (click)="closed.emit()">Отменить</button><button class="btn pri" (click)="send()">{{ ok() }}</button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprComment {
  private readonly toast = inject(ToastService);
  readonly title = input.required<string>();
  readonly hint = input.required<string>();
  readonly ok = input.required<string>();
  readonly sent = output<void>();
  readonly closed = output<void>();
  protected readonly text = signal('');

  protected send(): void {
    if (!this.text().trim()) return this.toast.show('Комментарий', 'Напишите пару слов.');
    this.closed.emit();
    this.sent.emit();
  }
}
