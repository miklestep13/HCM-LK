import { Injectable, signal } from '@angular/core';
import { BLD_CURATORS, bldId, bldModTemplates } from '../../data/builder.data';
import { BldModTemplate, BldModule } from '../../interface/builder';

const today = () => new Date().toLocaleDateString('ru-RU');

/** Шаблоны модулей курса (конструктор): сохраненные модули живут до перезагрузки страницы. */
@Injectable({ providedIn: 'root' })
export class BldTemplatesStore {
  readonly list = signal<BldModTemplate[]>(bldModTemplates());

  /** сохранить модуль в шаблоны (копия: дальнейшие правки модуля шаблон не меняют) */
  save(m: BldModule, au = BLD_CURATORS[3]): BldModTemplate {
    const c: BldModule = JSON.parse(JSON.stringify(m));
    const t: BldModTemplate = { id: bldId('t'), mk: c.mk ?? 'mod', t: c.t, d: c.d, blocks: c.blocks, test: c.test, task: c.task, au, date: today() };
    this.list.update((l) => [t, ...l]);
    return t;
  }
}
