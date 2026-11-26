import { Injectable, signal } from '@angular/core';
import { IprStore } from '../../core/demo/ipr-store.service';
import {
  ADAPT_DESC,
  ADAPT_FROM,
  ADAPT_PLAN,
  ADAPT_STAGE_LIST,
  ADAPT_STAGES,
  AdaptStage,
  AdaptTask,
} from '../../data/adapt.data';
import { IprTask } from '../../interface/ipr';

const parse = (d: string): Date => {
  const [dd, mm, yyyy] = d.split('.').map(Number);
  return new Date(yyyy, mm - 1, dd);
};
const fmt = (d: Date): string =>
  String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();

/**
 * План адаптации. Под капотом тот же механизм, что у ИПР, но свой экземпляр:
 * переключатели этой страницы не меняют раздел «ИПР».
 * Этапы (недели) правятся отдельно — табы задач и срок «Выполнить до» от них зависят.
 */
@Injectable()
export class AdaptStore extends IprStore {
  /** этап, в который попадет новая задача */
  nextStage: string = ADAPT_STAGES[0];
  /** структура недель/этапов плана */
  readonly stages = signal<AdaptStage[]>(structuredClone(ADAPT_STAGE_LIST));

  constructor() {
    super();
    this.plan.set(structuredClone(ADAPT_PLAN));
    this.status.set('Утверждено');
    this.none.set(false);
    this.nf.set(null);
    this.fill.set('full');
    this.draftComps.set(structuredClone(ADAPT_PLAN.comps));
    this.att.set({});
    this.comments.set({});
    this.open.set(new Set());
    this.arole.set('emp');
  }

  /** срок задачи по этапу: дата начала плана + сумма длительностей до этого этапа включительно */
  dueFor(stageName: string): string {
    let days = 0;
    for (const s of this.stages()) {
      days += s.days;
      if (s.name === stageName) break;
    }
    const d = parse(ADAPT_FROM);
    d.setDate(d.getDate() + days);
    return fmt(d);
  }

  override saveTask(i: number, t: IprTask): void {
    const at = t as AdaptTask;
    const prev = i >= 0 ? (this.plan().tasks[i] as AdaptTask | undefined) : undefined;
    const stage = at.stage || prev?.stage || this.nextStage;
    const due = at.due || this.dueFor(stage);
    super.saveTask(i, { ...t, stage, due } as IprTask);
  }

  /** сохранить этап; пустая строка при ошибке имени — текст ошибки */
  saveStage(i: number, patch: { name: string; days: number }): string | null {
    const name = patch.name.trim();
    if (!name) return 'Укажите наименование.';
    if (!patch.days || patch.days < 1) return 'Укажите длительность этапа.';
    const list = this.stages();
    const clash = list.some((s, k) => s.name === name && k !== i);
    if (clash) return 'Этап с таким названием уже есть.';
    if (i < 0) {
      const id = 's' + (Date.now() % 100000);
      this.stages.set([...list, { id, name, days: patch.days }]);
      this.nextStage = name;
      return null;
    }
    const prev = list[i];
    if (!prev) return 'Этап не найден.';
    this.stages.set(list.map((s, k) => (k === i ? { ...s, name, days: patch.days } : s)));
    if (prev.name !== name) {
      this.plan.update((p) => ({
        ...p,
        tasks: p.tasks.map((t) => ((t as AdaptTask).stage === prev.name ? { ...t, stage: name } : t)),
      }));
      if (this.nextStage === prev.name) this.nextStage = name;
    }
    this.recalcDues();
    return null;
  }

  removeStage(i: number): void {
    const list = this.stages();
    if (list.length <= 1 || !list[i]) return;
    const gone = list[i];
    const next = list[i === 0 ? 1 : i - 1];
    this.stages.set(list.filter((_, k) => k !== i));
    this.plan.update((p) => ({
      ...p,
      tasks: p.tasks.map((t) => ((t as AdaptTask).stage === gone.name ? { ...t, stage: next.name } : t)),
    }));
    if (this.nextStage === gone.name) this.nextStage = next.name;
    this.recalcDues();
  }

  /** пересчитать «Выполнить до» у задач по длительности этапов */
  recalcDues(): void {
    this.plan.update((p) => ({
      ...p,
      tasks: p.tasks.map((t) => {
        const stage = (t as AdaptTask).stage;
        return stage ? { ...t, due: this.dueFor(stage) } : t;
      }),
    }));
  }

  override applyTemplate(tpl: string): void {
    super.applyTemplate(tpl);
    if (!tpl) return;
    const tasks = structuredClone(ADAPT_PLAN.tasks).map((t) => ({ ...t, done: false, doneAt: undefined }));
    this.plan.update((p) => ({ ...p, tasks }));
    this.stages.set(structuredClone(ADAPT_STAGE_LIST));
  }

  override startNew(): void {
    super.startNew();
    this.patchNew({ emp: 'Ершов Никита Павлович', kind: 'В основной роли', per: '4FQ2026' });
    this.stages.set(structuredClone(ADAPT_STAGE_LIST));
  }

  override saveNew(): 'emp' | 'expert' | null {
    const err = super.saveNew();
    if (err) return err;
    this.plan.update((p) => ({
      ...p,
      name: 'Адаптация нового сотрудника',
      author: 'Смирнова Виктория Олеговна',
      desc: p.desc || ADAPT_DESC,
      due: ADAPT_PLAN.due,
      tpl: p.tpl || 'Адаптация нового сотрудника',
    }));
    return null;
  }

  /** демо формы шаблона: пустой или заполненный mock */
  loadTplDemo(mode: 'empty' | 'filled'): void {
    if (mode === 'empty') {
      this.stages.set([]);
      this.nextStage = '';
      this.plan.update((p) => ({ ...p, tasks: [] }));
      this.open.set(new Set());
      this.att.set({});
      this.comments.set({});
      return;
    }
    this.stages.set(structuredClone(ADAPT_STAGE_LIST));
    this.nextStage = ADAPT_STAGES[0];
    this.plan.set(structuredClone(ADAPT_PLAN));
    this.draftComps.set(structuredClone(ADAPT_PLAN.comps));
    this.open.set(new Set());
    this.att.set({});
    this.comments.set({});
  }
}
