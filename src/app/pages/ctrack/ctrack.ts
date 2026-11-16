import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CT_COMPS, CT_ROLES, ctSort } from '../../data/career-track.data';
import { CtCompRow, CtRoleRow } from '../../interface/career-track';
import { NavService } from '../../core/navigation/nav.service';
import { Icon } from '../../shared/ui/icon/icon';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { CtSort } from './ct-sort';

/**
 * «Компания → Справочники»: «Роли и грейды» и «Компетенции» — разные страницы меню, не вкладки.
 * Строка открывает страницу роли или компетенции.
 */
@Component({
  selector: 'app-ctrack',
  imports: [PageHead, FilterBar, Select, CtSort, Icon],
  templateUrl: './ctrack.html',
  styleUrl: './career.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-ctrack' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ctrack {
  private readonly nav = inject(NavService);
  private readonly docTitle = inject(Title);
  /** страница из адреса: roles | comps */
  readonly ct = input('');

  protected readonly sizes = ['10', '20', '50'];
  protected readonly tab = computed(() => (this.ct() === 'comps' ? 'comps' : 'roles'));
  protected readonly head = computed(() => (this.tab() === 'comps' ? 'Компетенции' : 'Роли и грейды'));
  protected readonly opened = signal(false);

  protected readonly rq = signal('');
  protected readonly rt = signal('');
  protected readonly rl = signal('');
  protected readonly rs = signal<{ k: number; d: 1 | -1 }>({ k: 0, d: 1 });
  protected readonly rPage = signal(0);
  protected readonly rSize = signal(10);

  protected readonly cq = signal('');
  protected readonly cg = signal('');
  protected readonly cs = signal<{ k: number; d: 1 | -1 }>({ k: 0, d: 1 });
  protected readonly cPage = signal(0);
  protected readonly cSize = signal(10);

  protected readonly kinds = ['Основная', 'Дополнительная'];
  protected readonly leaders = uniq(CT_ROLES.map((r) => r.leader));
  protected readonly groups = uniq(CT_COMPS.map((c) => c.group));

  protected readonly roles = computed(() => {
    const q = this.rq().trim().toLowerCase(), t = this.rt(), l = this.rl();
    const rows = CT_ROLES.filter((r) => (!q || r.name.toLowerCase().includes(q)) && (!t || r.kind === t) && (!l || r.leader === l));
    const s = this.rs();
    const picks: ((r: CtRoleRow) => string | number)[] = [(r) => r.name, (r) => r.leader, (r) => r.kind, (r) => r.people];
    return ctSort(rows, picks[s.k], s.d);
  });
  protected readonly comps = computed(() => {
    const q = this.cq().trim().toLowerCase(), g = this.cg();
    const rows = CT_COMPS.filter((c) => (!q || (c.name + ' ' + c.desc).toLowerCase().includes(q)) && (!g || c.group === g));
    const s = this.cs();
    const picks: ((c: CtCompRow) => string | number)[] = [(c) => c.name, (c) => c.group, (c) => c.roles];
    return ctSort(rows, picks[s.k], s.d);
  });

  protected readonly rolePages = computed(() => pagesOf(this.roles().length, this.rSize()));
  protected readonly roleCur = computed(() => Math.min(this.rPage(), this.rolePages().length - 1));
  protected readonly roleRows = computed(() => slice(this.roles(), this.roleCur(), this.rSize()));
  protected readonly compPages = computed(() => pagesOf(this.comps().length, this.cSize()));
  protected readonly compCur = computed(() => Math.min(this.cPage(), this.compPages().length - 1));
  protected readonly compRows = computed(() => slice(this.comps(), this.compCur(), this.cSize()));

  constructor() {
    effect(() => {
      this.rq();
      this.rt();
      this.rl();
      this.rSize();
      untracked(() => this.rPage.set(0));
    });
    effect(() => {
      this.cq();
      this.cg();
      this.cSize();
      untracked(() => this.cPage.set(0));
    });
    effect(() => this.docTitle.setTitle(this.head() + ' · Q.HCM'));
  }

  protected sortRoles(i: number, e: Event): void {
    e.stopPropagation();
    const s = this.rs();
    this.rs.set(s.k === i ? { k: i, d: s.d === 1 ? -1 : 1 } : { k: i, d: 1 });
  }
  protected sortComps(i: number, e: Event): void {
    e.stopPropagation();
    const s = this.cs();
    this.cs.set(s.k === i ? { k: i, d: s.d === 1 ? -1 : 1 } : { k: i, d: 1 });
  }
  protected setRoleSize(v: string): void {
    this.rSize.set(+v || 10);
  }
  protected setCompSize(v: string): void {
    this.cSize.set(+v || 10);
  }
  protected openRole(id: string): void {
    this.nav.go('ctrole', { id });
  }
  protected openComp(id: string): void {
    this.nav.go('ctcomp', { id });
  }
}

function uniq(list: string[]): string[] {
  return [...new Set(list)].sort((a, b) => a.localeCompare(b, 'ru'));
}
function pagesOf(total: number, size: number): number[] {
  return Array.from({ length: Math.max(1, Math.ceil(total / size)) }, (_, i) => i);
}
function slice<T>(rows: T[], page: number, size: number): T[] {
  return rows.slice(page * size, page * size + size);
}
