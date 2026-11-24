import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AdaptTask } from '../../../data/adapt.data';
import { IPR_ARTICLES } from '../../../data/ipr.data';
import { LEARN_COURSES } from '../../../data/learn.data';
import { IprTask } from '../../../interface/ipr';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AdaptStore } from '../adapt-store';

const NONE = '—';

/**
 * Сайдбар «Добавление задачи» / «Задача адаптации»: формулировка, результат, этап (select),
 * «Выполнить до» — только чтение (считается от этапа), способы развития. Без компетенций.
 */
@Component({
  selector: 'app-adapt-task-form',
  imports: [Drawer, Field, Select],
  template: `
    <app-drawer [title]="index() >= 0 ? 'Задача адаптации' : 'Добавление задачи'" panel="ipw" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="frm ipfrm">
        <app-field label="Формулировка задачи" required full [filled]="!!t()" [class.dis]="ro">
          <input class="fin" placeholder="Например: освоить кредитный анализ и оценку заемщика" [value]="t()" [disabled]="ro" (input)="t.set($any($event.target).value)" />
        </app-field>
        <app-field label="Ожидаемый результат" required full [filled]="!!res()" [class.dis]="ro">
          <textarea class="fta" rows="3" placeholder="Чем подтверждается результат" [value]="res()" [disabled]="ro" (input)="res.set($any($event.target).value)"></textarea>
        </app-field>
        <app-field label="Этап" required full [filled]="!!stage()" [class.dis]="ro">
          <app-select [class.dis]="ro" [options]="stageOpts()" [value]="stage()" (valueChange)="setStage($event)" />
        </app-field>
        <app-field label="Выполнить до" required full filled class="dis">
          <input class="fin" [value]="due()" disabled />
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptTaskForm implements OnInit {
  private readonly s = inject(AdaptStore);
  private readonly toast = inject(ToastService);
  /** индекс задачи; -1 — новая */
  readonly index = input(-1);
  readonly closed = output<void>();

  protected readonly none = NONE;
  protected readonly courses = [NONE, ...Object.values(LEARN_COURSES).map((c) => c.t)];
  protected readonly arts = [NONE, ...IPR_ARTICLES];
  /** утвержденный план: поля только для чтения, можно завершить задачу */
  protected ro = false;
  private src: AdaptTask | null = null;

  protected readonly t = signal('');
  protected readonly res = signal('');
  protected readonly stage = signal('');
  protected readonly due = signal('');
  protected readonly crs = signal('');
  protected readonly link = signal('');
  protected readonly art = signal('');
  protected readonly done = signal(false);
  protected readonly note = signal('');

  protected readonly stageOpts = computed(() => this.s.stages().map((x) => x.name));

  ngOnInit(): void {
    const i = this.index(),
      P = this.s.plan();
    this.ro = i >= 0 && this.s.st() === 'Утверждено';
    const t = i >= 0 ? (P.tasks[i] as AdaptTask | undefined) : null;
    this.src = t ?? null;
    this.t.set(t?.t ?? '');
    this.res.set(t?.res ?? '');
    const st = t?.stage || this.s.nextStage || this.s.stages()[0]?.name || '';
    this.stage.set(st);
    this.due.set(st ? this.s.dueFor(st) : t?.due ?? '');
    this.crs.set(t?.crs ? (LEARN_COURSES[t.crs]?.t ?? '') : '');
    this.link.set(t?.link ?? '');
    this.art.set(t?.art ?? '');
    this.done.set(!!t?.done);
    this.note.set(t?.note ?? '');
  }

  protected setStage(name: string): void {
    this.stage.set(name);
    if (name) this.due.set(this.s.dueFor(name));
  }

  protected save(): void {
    const t = this.t().trim(),
      res = this.res().trim(),
      stage = this.stage().trim(),
      due = this.due().trim();
    if (!t || !res || !stage) return this.toast.show('Задание', 'Заполните формулировку, ожидаемый результат и этап.');
    const o = this.src,
      crs = this.crs() ? Object.keys(LEARN_COURSES).find((k) => LEARN_COURSES[k].t === this.crs()) : undefined;
    const nt: AdaptTask = {
      t,
      res,
      crs,
      link: this.link().trim() || undefined,
      art: this.art() || undefined,
      due,
      done: this.ro ? this.done() : !!o?.done,
      doneAt: o?.doneAt,
      comps: o?.comps ?? [],
      by: o?.by ?? 'Иванов П. С.',
      moved: o ? o.moved || due !== o.due : undefined,
      note: this.ro ? this.note().trim() : o?.note,
      stage,
    };
    this.s.saveTask(this.index(), nt as IprTask);
    this.closed.emit();
    this.toast.show('Сохранено', nt.t);
  }
}
