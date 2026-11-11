import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, afterNextRender, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { personAvatar } from '../../data/avatar';
import { CT_COMPS, CT_GRADES, CT_GRADES_TOP, CT_LEVELS, CT_ME, CT_ROLE, CT_ROLES, CT_TPL_ROLE, ctPlural, ctSort } from '../../data/career-track.data';
import { NavService } from '../../core/navigation/nav.service';
import { CtPerson } from '../../interface/career-track';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { CtLearn } from '../ctrack/ct-learn';
import { CtLevel } from '../ctrack/ct-level';
import { CtSort } from '../ctrack/ct-sort';

/**
 * Страница роли из справочника. Контент — шаблон «Кредитный специалист»:
 * шапка с KPI по грейдам, лидер и эксперты, требования к грейдам, уровни компетенций, сотрудники, обучение.
 */
@Component({
  selector: 'app-ctrole',
  imports: [PageHead, FilterBar, Select, CtSort, CtLevel, CtLearn, Icon],
  templateUrl: './ctrole.html',
  styleUrl: '../ctrack/career.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-ctrole' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ctrole {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  readonly id = input('');
  private readonly dsc = viewChild<ElementRef<HTMLElement>>('dsc');
  protected readonly role = CT_ROLES.find((r) => r.id === CT_TPL_ROLE)!;
  protected readonly detail = CT_ROLE;
  protected readonly grades = CT_GRADES;
  protected readonly compHeads = ['Компетенция', 'Группа', ...CT_GRADES];
  protected readonly updated = 'Обновлено: 01.09.2026';
  protected readonly leaderName = CT_ROLE.people.find((p) => p.tag === 'Лидер роли')?.name || '—';
  protected readonly sizes = ['10', '20', '50'];
  protected readonly desc = [
    CT_ROLE.desc,
    'Ключевые задачи: ' + CT_ROLE.tasks.map((t, i) => (i ? t.charAt(0).toLowerCase() + t.slice(1) : t)).join('; ') + '.',
    'Показатели роли: ' + CT_ROLE.kpi.charAt(0).toLowerCase() + CT_ROLE.kpi.slice(1) + '.',
  ];
  protected readonly kpis = CT_GRADES_TOP.map((g) => {
    const n = CT_ROLE.people.filter((p) => p.grade === g).length;
    return { g, n, d: ctPlural(n, 'сотрудник', 'сотрудника', 'сотрудников') };
  });
  protected readonly more = signal(false);
  protected readonly opened = signal(false);
  protected readonly lq = signal('');
  protected readonly lg = signal('');
  protected readonly lu = signal('');
  protected readonly ls = signal<{ k: number; d: 1 | -1 }>({ k: 0, d: 1 });
  protected readonly lPage = signal(0);
  protected readonly lSize = signal(10);
  protected readonly kq = signal('');
  protected readonly kg = signal('');
  protected readonly kOpen = signal(false);
  protected readonly ks = signal<{ k: number; d: 1 | -1 }>({ k: 0, d: 1 });
  protected readonly pq = signal('');
  protected readonly pg = signal('');
  protected readonly pu = signal('');
  protected readonly ps = signal<{ k: number; d: 1 | -1 }>({ k: 0, d: 1 });
  protected readonly pPage = signal(0);
  protected readonly pSize = signal(10);
  protected readonly leadGrades = present(CT_ROLE.people.filter((p) => p.tag), (p) => p.grade);
  protected readonly pplGrades = present(CT_ROLE.people, (p) => p.grade);
  protected readonly units = present(CT_ROLE.people, (p) => p.unit);
  protected readonly compGroups = present(CT_ROLE.comps, (c) => c.group);
  protected readonly leaders = computed(() => this.people(CT_ROLE.people.filter((p) => p.tag), this.lq(), this.lg(), this.lu(), this.ls()));
  protected readonly leaderPages = computed(() => pagesOf(this.leaders().length, this.lSize()));
  protected readonly leaderCur = computed(() => Math.min(this.lPage(), this.leaderPages().length - 1));
  protected readonly leaderRows = computed(() => slice(this.leaders(), this.leaderCur(), this.lSize()));
  protected readonly staff = computed(() => this.people(CT_ROLE.people, this.pq(), this.pg(), this.pu(), this.ps()));
  protected readonly staffPages = computed(() => pagesOf(this.staff().length, this.pSize()));
  protected readonly staffCur = computed(() => Math.min(this.pPage(), this.staffPages().length - 1));
  protected readonly staffRows = computed(() => slice(this.staff(), this.staffCur(), this.pSize()));
  protected readonly comps = computed(() => {
    const q = this.kq().trim().toLowerCase(), g = this.kg();
    const rows = CT_ROLE.comps.filter((c) => (!q || c.name.toLowerCase().includes(q)) && (!g || c.group === g));
    const s = this.ks();
    const pick = (c: (typeof rows)[0]) => (s.k === 0 ? c.name : s.k === 1 ? c.group : CT_LEVELS.indexOf(c.levels[s.k - 2] || ''));
    return ctSort(rows, pick, s.d);
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id && id !== CT_TPL_ROLE) {
        const r = CT_ROLES.find((x) => x.id === id);
        untracked(() => this.toast.show('Шаблон роли', 'Роль «' + (r?.name || id) + '» пока заполнена по шаблону «Кредитный специалист».'));
      }
    });
    effect(() => {
      this.lq();
      this.lg();
      this.lu();
      this.lSize();
      untracked(() => this.lPage.set(0));
    });
    effect(() => {
      this.pq();
      this.pg();
      this.pu();
      this.pSize();
      untracked(() => this.pPage.set(0));
    });
    afterNextRender(() => {
      const el = this.dsc()?.nativeElement;
      if (!el) return;
      const lh = parseFloat(getComputedStyle(el.querySelector('p') || el).lineHeight) || 22;
      if (el.scrollHeight > lh * 4 + 4) {
        this.more.set(true);
        el.style.maxHeight = lh * 4 + 'px';
      }
    });
  }

  protected av(name: string) {
    return personAvatar(name);
  }
  protected sort(which: 'l' | 'k' | 'p', i: number, e: Event): void {
    e.stopPropagation();
    const sig = which === 'l' ? this.ls : which === 'k' ? this.ks : this.ps;
    const s = sig();
    sig.set(s.k === i ? { k: i, d: s.d === 1 ? -1 : 1 } : { k: i, d: 1 });
  }
  protected toggle(): void {
    const el = this.dsc()?.nativeElement;
    if (!el) return;
    const open = !this.opened();
    this.opened.set(open);
    const lh = parseFloat(getComputedStyle(el.querySelector('p') || el).lineHeight) || 22;
    el.style.maxHeight = open ? '' : lh * 4 + 'px';
  }
  protected openComp(name: string): void {
    const id = CT_COMPS.find((c) => c.name === name)?.id || 'k1';
    this.nav.go('ctcomp', { id });
  }
  protected openPerson(name: string): void {
    if (name === CT_ME) this.nav.go('prof');
    else this.nav.go('emp', { emp: name });
  }

  private people(src: CtPerson[], q: string, g: string, u: string, s: { k: number; d: 1 | -1 }): CtPerson[] {
    const query = q.trim().toLowerCase();
    const rows = src.filter((p) => (!query || p.name.toLowerCase().includes(query)) && (!g || p.grade === g) && (!u || p.unit === u));
    const pick = (p: CtPerson) => (s.k === 1 ? CT_GRADES.indexOf(p.grade) : s.k === 2 ? p.unit : s.k === 3 ? p.tag : p.name);
    return ctSort(rows, pick, s.d);
  }
}

function present<T>(rows: T[], pick: (row: T) => string): string[] {
  return [...new Set(rows.map(pick))].sort((a, b) => a.localeCompare(b, 'ru'));
}
function pagesOf(total: number, size: number): number[] {
  return Array.from({ length: Math.max(1, Math.ceil(total / size)) }, (_, i) => i);
}
function slice<T>(rows: T[], page: number, size: number): T[] {
  return rows.slice(page * size, page * size + size);
}
