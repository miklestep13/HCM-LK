import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { Field } from '../../../shared/ui/field/field';
import { Modal } from '../../../shared/ui/modal/modal';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Окно «Согласование» итога аттестации: предварительный итог по оценкам задач, обязательный комментарий */
@Component({
  selector: 'app-ipr-agree',
  imports: [Modal, Field],
  template: `
    <app-modal title="Согласование" panel="mdl-md" [open]="true" (openChange)="closed.emit()">
      <p class="mdlp">Предварительный итог аттестации: «{{ s.attResult() }}». Заключение эксперта увидят сотрудник и руководитель.</p>
      <div class="frm">
        <app-field label="Комментарий" required full [filled]="!!text()">
          <textarea class="fta" rows="3" [value]="text()" (input)="text.set($any($event.target).value); err.set(false)"></textarea>
        </app-field>
        @if (err()) {
          <div class="pqerr fld full">Напишите комментарий к итогу.</div>
        }
      </div>
      <div class="mdlf glmf">
        <button class="btn raised" (click)="closed.emit()">Отменить</button><button class="btn pri" (click)="send()">Отправить</button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprAgree {
  protected readonly s = inject(IprStore);
  private readonly toast = inject(ToastService);
  readonly closed = output<void>();
  protected readonly text = signal('');
  protected readonly err = signal(false);

  protected send(): void {
    if (!this.text().trim()) return this.err.set(true);
    const st = this.s.attResult();
    this.closed.emit();
    this.s.setStatus(st);
    this.toast.show('Итог согласован', 'План: «' + st + '». Сотрудник и руководитель получат уведомление.');
  }
}
