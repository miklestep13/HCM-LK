import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { NumInput } from '../../../shared/ui/num-input/num-input';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AdaptStore } from '../adapt-store';

/**
 * Сайдбар этапа плана адаптации: наименование и длительность (дней).
 * index ≥ 0 — правка, −1 — новый этап; у существующего — «Удалить».
 */
@Component({
  selector: 'app-adapt-stage-form',
  imports: [Drawer, Field, NumInput],
  template: `
    <app-drawer
      [title]="index() >= 0 ? 'Редактирование этапа' : 'Добавление этапа'"
      panel="ipw"
      [open]="true"
      (openChange)="closed.emit()"
      (ok)="save()"
      [okLabel]="'Сохранить'"
    >
      <div class="frm ipfrm">
        <app-field label="Наименование" required full [filled]="!!name()" [error]="bad() && !name().trim()">
          <input
            class="fin"
            placeholder="Например: Первая неделя"
            [value]="name()"
            (input)="name.set($any($event.target).value)"
          />
        </app-field>
        <app-field label="Длительность этапа" required full [filled]="!!days()" [error]="bad() && !+days()">
          <app-num-input [min]="1" [max]="365" placeholder="Дней" [(value)]="days" />
        </app-field>
      </div>
      @if (index() >= 0 && canDel()) {
        <button drwBtn class="btn dng" type="button" (click)="remove()">Удалить</button>
      }
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptStageForm implements OnInit {
  private readonly s = inject(AdaptStore);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  /** индекс этапа; −1 — новый */
  readonly index = input(-1);
  readonly closed = output<void>();

  protected readonly name = signal('');
  protected readonly days = signal('7');
  protected readonly bad = signal(false);

  protected canDel(): boolean {
    return this.s.stages().length > 1;
  }

  ngOnInit(): void {
    const i = this.index();
    if (i >= 0) {
      const st = this.s.stages()[i];
      if (st) {
        this.name.set(st.name);
        this.days.set(String(st.days));
      }
    }
  }

  protected save(): void {
    const name = this.name().trim();
    const days = +this.days();
    if (!name || !days) {
      this.bad.set(true);
      this.toast.show('Этап', 'Укажите наименование и длительность этапа.');
      return;
    }
    const err = this.s.saveStage(this.index(), { name, days });
    if (err) {
      this.bad.set(true);
      this.toast.show('Этап', err);
      return;
    }
    this.toast.show('Сохранено', name);
    this.closed.emit();
  }

  protected async remove(): Promise<void> {
    const i = this.index();
    if (i < 0) return;
    const st = this.s.stages()[i];
    if (!st) return;
    const n = this.s.plan().tasks.filter((t) => (t as { stage?: string }).stage === st.name).length;
    const text =
      n > 0
        ? `Этап **${st.name}** будет удален. ${n} ${n === 1 ? 'задача перейдет' : 'задач перейдут'} в соседний этап.`
        : `Этап **${st.name}** будет удален из плана.`;
    if (!(await this.confirm.ask({ title: 'Удалить этап?', text, ok: 'Удалить', danger: true }))) return;
    this.s.removeStage(i);
    this.toast.show('Этап удален', st.name);
    this.closed.emit();
  }
}
