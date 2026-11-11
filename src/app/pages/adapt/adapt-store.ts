import { Injectable } from '@angular/core';
import { IprStore } from '../../core/demo/ipr-store.service';
import { ADAPT_DESC, ADAPT_PLAN, ADAPT_STAGES, AdaptTask } from '../../data/adapt.data';
import { IprTask } from '../../interface/ipr';

/**
 * План адаптации. Под капотом тот же механизм, что у ИПР, но свой экземпляр:
 * переключатели этой страницы не меняют раздел «ИПР».
 */
@Injectable()
export class AdaptStore extends IprStore {
  /** этап, в который попадет новая задача */
  nextStage: string = ADAPT_STAGES[0];

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

  override saveTask(i: number, t: IprTask): void {
    const prev = i >= 0 ? (this.plan().tasks[i] as AdaptTask | undefined) : undefined;
    const stage = prev?.stage || this.nextStage;
    super.saveTask(i, { ...t, stage } as IprTask);
  }

  override applyTemplate(tpl: string): void {
    super.applyTemplate(tpl);
    if (!tpl) return;
    const tasks = structuredClone(ADAPT_PLAN.tasks).map((t) => ({ ...t, done: false, doneAt: undefined }));
    this.plan.update((p) => ({ ...p, tasks }));
  }

  override startNew(): void {
    super.startNew();
    this.patchNew({ emp: 'Ершов Никита Павлович', kind: 'В основной роли', per: '4FQ2026' });
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
}
