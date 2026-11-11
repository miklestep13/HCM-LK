import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject, input, output, signal } from '@angular/core';
import { IPR_ARTICLES, IPR_COMP_OPTIONS } from '../../data/ipr.data';
import { LEARN_COURSES } from '../../data/learn.data';
import { IprTask } from '../../interface/ipr';
import { ChipSelect } from '../../shared/ui/chip-select/chip-select';
import { DateField } from '../../shared/ui/date-field/date-field';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { Field } from '../../shared/ui/field/field';
import { Icon } from '../../shared/ui/icon/icon';
import { Select } from '../../shared/ui/select/select';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Tooltip } from '../../shared/ui/tooltip/tooltip';
import { IprCompPick } from './ipr-comp-pick/ipr-comp-pick';

const NONE = '—';

/**
 * Сайдбар «Добавление задачи» / «Задача ИПР»: формулировка, ожидаемый результат, срок, компетенции (лупа — справочник),
 * способы развития (курс, ссылка, статья). В утвержденном плане поля только для чтения, внизу — блок «Выполнение».
 * Общий для страницы ИПР и бланка аттестации («Пройдена с условиями»): данные — через [task] / (saved), хранилище — у страницы.
 *   <app-ipr-task-form [task]="t | null" [readonly]="утвержден" due0="31.12.2026" (saved)="…" (closed)="…" />
 */
@Component({
  selector: 'app-ipr-task-form',
  imports: [Drawer, Field, Select, DateField, ChipSelect, Icon, Tooltip, IprCompPick],
  template: `
    <app-drawer [title]="task() ? 'Задача ИПР' : 'Добавление задачи'" panel="ipw" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="frm ipfrm">
        <app-field label="Формулировка задачи" required full [filled]="!!t()" [class.dis]="ro">
          <input class="fin" placeholder="Например: освоить кредитный анализ и оценку заемщика" [value]="t()" [disabled]="ro" (input)="t.set($any($event.target).value)" />
        </app-field>
        <app-field label="Ожидаемый результат" required full [filled]="!!res()" [class.dis]="ro">
          <textarea class="fta" rows="3" placeholder="Чем подтверждается выполнение" [value]="res()" [disabled]="ro" (input)="res.set($any($event.target).value)"></textarea>
        </app-field>
        <app-field label="Выполнить до" required full [filled]="!!due()" [class.dis]="ro">
          <app-date-field [(value)]="due" />
        </app-field>
        <app-field label="Развиваемые компетенции" full [filled]="!!comps().length" [class.dis]="ro">
          <app-chip-select class="mselq" [options]="compOpts" placeholder="Выберите компетенции" [(value)]="comps" />
          <button class="mselsr" type="button" appTip="Выбрать из справочника" aria-label="Выбрать из справочника" (click)="pick.set(true)"><app-icon name="loupe" /></button>
        </app-field>
        <div class="ipsec full">
          <div class="ipsech">Способы развития</div>
          <div class="frm ipfrm">
            <app-field label="Курс из каталога" full [filled]="!!crs()" [class.dis]="ro">
              <app-select [class.dis]="ro" [search]="true" [options]="courses" [value]="crs()" (valueChange)="crs.set($event === none ? '' : $event)" />
            </app-field>
            <app-field label="Ссылка на внешний курс или ресурс" full [filled]="!!link()" [class.dis]="ro">
              <input class="fin" placeholder="https://" [value]="link()" [disabled]="ro" (input)="link.set($any($event.target).value)" />
            </app-field>
            <app-field label="Статья из базы знаний" full [filled]="!!art()" [class.dis]="ro">
              <app-select [class.dis]="ro" [search]="true" [options]="arts" [value]="art()" (valueChange)="art.set($event === none ? '' : $event)" />
            </app-field>
          </div>
        </div>
        @if (ro) {
          <div class="ipsec full ipdone">
            <div class="iptdh">
              <b class="ipsech">Выполнение</b
              ><label class="swt"><span>Завершить</span><input type="checkbox" [checked]="done()" (change)="done.set($any($event.target).checked)" /><i></i></label>
            </div>
            <div class="frm ipfrm">
              <app-field label="Комментарий" full [filled]="!!note()">
                <textarea class="fta" rows="2" [value]="note()" (input)="note.set($any($event.target).value)"></textarea>
              </app-field>
            </div>
          </div>
        }
      </div>
    </app-drawer>
    @if (pick()) {
      <app-ipr-comp-pick [has]="comps()" (picked)="comps.set([...comps(), ...$event])" (closed)="pick.set(false)" />
    }
  `,
  styleUrl: './ipr-task-form.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'iptf' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprTaskForm implements OnInit {
  private readonly toast = inject(ToastService);
  /** задача; null — новая */
  readonly task = input<IprTask | null>(null);
  /** план утвержден: поля только для чтения, можно завершить задачу */
  readonly readonly = input(false);
  /** «Выполнить до» у новой задачи — конец периода плана */
  readonly due0 = input('');
  readonly saved = output<IprTask>();
  readonly closed = output<void>();

  protected readonly none = NONE;
  protected readonly compOpts = IPR_COMP_OPTIONS;
  protected readonly courses = [NONE, ...Object.values(LEARN_COURSES).map((c) => c.t)];
  protected readonly arts = [NONE, ...IPR_ARTICLES];
  protected ro = false;
  private src: IprTask | null = null;

  protected readonly t = signal('');
  protected readonly res = signal('');
  protected readonly due = signal('');
  protected readonly comps = signal<string[]>([]);
  protected readonly crs = signal('');
  protected readonly link = signal('');
  protected readonly art = signal('');
  protected readonly done = signal(false);
  protected readonly note = signal('');
  protected readonly pick = signal(false);

  ngOnInit(): void {
    const t = this.task();
    this.ro = !!t && this.readonly();
    this.src = t;
    this.t.set(t?.t ?? '');
    this.res.set(t?.res ?? '');
    this.due.set(t?.due ?? this.due0());
    this.comps.set([...(t?.comps ?? [])]);
    this.crs.set(t?.crs ? (LEARN_COURSES[t.crs]?.t ?? '') : '');
    this.link.set(t?.link ?? '');
    this.art.set(t?.art ?? '');
    this.done.set(!!t?.done);
    this.note.set(t?.note ?? '');
  }

  protected save(): void {
    const t = this.t().trim(),
      res = this.res().trim(),
      due = this.due().trim();
    if (!t || !res || !due) return this.toast.show('Задание', 'Заполните формулировку, ожидаемый результат и дату «Выполнить до».');
    const o = this.src,
      crs = this.crs() ? Object.keys(LEARN_COURSES).find((k) => LEARN_COURSES[k].t === this.crs()) : undefined;
    const nt: IprTask = {
      t,
      res,
      crs,
      link: this.link().trim() || undefined,
      art: this.art() || undefined,
      due,
      done: this.ro ? this.done() : !!o?.done,
      doneAt: o?.doneAt,
      comps: this.comps(),
      by: o?.by ?? 'Иванов П. С.',
      moved: o ? o.moved || due !== o.due : undefined,
      note: this.ro ? this.note().trim() : o?.note,
    };
    this.saved.emit(nt);
    this.closed.emit();
    this.toast.show('Сохранено', nt.t);
  }
}
