import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { IPR_TODAY } from '../../../data/ipr.data';
import { LEARN_COURSES } from '../../../data/learn.data';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Сайдбар «Выполнение задачи» (план в работе): параметры задачи только для чтения, отметка «Выполнено», дата выполнения и комментарий */
@Component({
  selector: 'app-ipr-task-run',
  imports: [Drawer, Field, DateField],
  template: `
    <app-drawer title="Выполнение задачи" panel="ipw" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="iprun">
        @for (r of kv(); track r[0]) {
          @if (r[0] === '') {
            <div class="ipsech">Способы развития</div>
          } @else if (r[1]) {
            <div class="iprd iprunkv"><span class="l">{{ r[0] }}</span>{{ r[1] }}</div>
          }
        }
        <div class="ipsech">Выполнение задачи</div>
        <label class="swt iprsw"><input type="checkbox" [checked]="done()" (change)="done.set($any($event.target).checked)" /><i></i><span>Выполнено</span></label>
        <div class="frm ipfrm">
          <app-field label="Дата выполнения" required full [filled]="!!at()">
            <app-date-field [(value)]="at" />
          </app-field>
          <app-field label="Комментарий" full [filled]="!!note()">
            <textarea class="fta" rows="3" [value]="note()" (input)="note.set($any($event.target).value)"></textarea>
          </app-field>
        </div>
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprTaskRun implements OnInit {
  private readonly s = inject(IprStore);
  private readonly toast = inject(ToastService);
  readonly index = input.required<number>();
  readonly closed = output<void>();
  protected readonly done = signal(false);
  protected readonly at = signal('');
  protected readonly note = signal('');

  private readonly task = computed(() => this.s.plan().tasks[this.index()]);
  /** строки «подпись — значение»; пустая подпись — заголовок «Способы развития» */
  protected readonly kv = computed<[string, string][]>(() => {
    const t = this.task(),
      crs = t.crs && LEARN_COURSES[t.crs] ? '«' + LEARN_COURSES[t.crs].t + '»' : '';
    const rows: [string, string][] = [
      ['Формулировка задачи', t.t],
      ['Ожидаемый результат', t.res],
      ['Развиваемые компетенции', t.comps.join(', ')],
      ['Выполнить до', t.due],
    ];
    if (crs || t.link || t.art)
      rows.push(['', ''], ['Курс из каталога', crs], ['Ссылка на внешний курс или ресурс', (t.link || '').replace(/^https?:\/\//, '')], ['Статья из базы знаний', t.art || '']);
    return rows;
  });

  ngOnInit(): void {
    const t = this.task();
    this.done.set(t.done);
    this.at.set(t.doneAt || IPR_TODAY);
    this.note.set(t.note || '');
  }

  protected save(): void {
    const d = this.done(),
      at = this.at().trim();
    if (d && !/^\d{2}\.\d{2}\.\d{4}$/.test(at)) return this.toast.show('Дата выполнения', 'Укажите дату в формате дд.мм.гггг.');
    const t = { ...this.task(), done: d, doneAt: d ? at : undefined, note: this.note().trim() };
    this.s.saveTask(this.index(), t);
    this.closed.emit();
    this.toast.show(d ? 'Задача выполнена' : 'Задача в работе', t.t);
  }
}
