import { Injectable, computed, inject, signal } from '@angular/core';
import { CommStore } from '../../core/demo/comm-store.service';
import { COMM_SORTS } from '../../data/comm.data';
import { CommCat, Community } from '../../interface/comm';

const MON = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const ts = (c: Community) => { const x = c.since.split(' '); return (+x[1] || 0) * 12 + Math.max(0, MON.indexOf(x[0])); };
const SORT: Record<string, (x: Community, y: Community) => number> = {
  'Сначала новые': (x, y) => ts(y) - ts(x),
  'Сначала старые': (x, y) => ts(x) - ts(y),
  'По числу участников': (x, y) => y.members - x.members,
  'По названию': (x, y) => x.name.localeCompare(y.name, 'ru'),
};

/** Поиск, категория и сортировка списка сообществ */
@Injectable()
export class CommState {
  private readonly store = inject(CommStore);
  readonly q = signal('');
  readonly cat = signal<CommCat | ''>('');
  readonly sort = signal(COMM_SORTS[0]);
  readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(), cat = this.cat();
    return this.store
      .list()
      .filter((c) => (!q || (c.name + ' ' + c.short).toLowerCase().includes(q)) && (!cat || c.cat === cat))
      .sort(SORT[this.sort()]);
  });
}
