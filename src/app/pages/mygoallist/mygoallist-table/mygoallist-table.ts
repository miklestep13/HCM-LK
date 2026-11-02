import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { DemoState } from '../../../core/demo/demo-state.service';
import { GoalsStore, goalFinal, goalForm, goalLevel, goalNum, goalResult, goalType, goalUnit } from '../../../core/demo/goals-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { MY_GOAL_LIST } from '../../../data/goals.data';
import { shortFio } from '../../../data/org.data';
import { GOAL_STAGES, GoalListRow, goalStatusOf } from '../../../interface/goal';
import { NgTemplateOutlet } from '@angular/common';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';

interface Row {
  g: GoalListRow;
  /** уровень вложенности (отступ 28px) */
  lv: number;
  /** есть видимые подчиненные цели */
  kids: boolean;
  /** не подходит под поиск, но показана как родитель найденной */
  dim: boolean;
}
interface Group {
  name: string;
  sub: string;
  av: number;
  rows: Row[];
}
const LEVEL_ORDER: Record<string, number> = { Компания: 0, Подразделение: 1 };
const STATUS_TONE: Record<string, string> = Object.fromEntries(GOAL_STAGES.map((s) => [s.label, s.tone]));

/**
 * Блок «Список целей»: вкладки, поиск и таблица с горизонтальным скроллом.
 * «По цели» — дерево компания → подразделение → индивидуальная, «По сотруднику» — группы по сотрудникам.
 * Статус и действия моих текущих целей зависят от этапа карты целей (dev-панель «Демо»).
 * Просмотр, оценка и редактирование цели пока открываются в старом прототипе.
 */
@Component({
  selector: '[mygoallist-table]',
  imports: [FilterBar, Select, NgTemplateOutlet],
  templateUrl: './mygoallist-table.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoallistTable {
  private readonly demo = inject(DemoState);
  private readonly nav = inject(NavService);
  protected readonly short = shortFio;
  protected readonly tab = signal<'goal' | 'emp'>('goal');
  protected readonly q = signal('');
  protected readonly fold = signal(new Set<string>());
  private readonly goals = inject(GoalsStore);
  private readonly me = MY_GOAL_LIST.find((g) => g.mine)!.owner;
  /** цели текущей карты — из общего хранилища (изменения в карте и в форме цели видны и здесь), прошлые и чужие — из данных */
  private readonly rows = computed<GoalListRow[]>(() => {
    const cur = this.goals.current().map((g): GoalListRow => {
      const F = goalForm(g), A = goalFinal(g), r = goalResult(g);
      return {
        id: g.id, title: g.t, parent: g.par || '', level: goalLevel(g), mine: true, current: true, owner: this.me, type: goalType(g),
        period: 'IV квартал 2026', weight: (g.w || 0) + '%', due: 'до ' + (g.due || this.goals.period.to),
        result: F.kind === 'num' && r != null ? goalNum(r) + (F.u === '%' ? '%' : ' ' + goalUnit(F.u)) : F.kind === 'str' && A ? A.n : '—',
        grade: A?.o || '', gradeName: A?.n || '', kind: F.kind, rated: !!g.self,
      };
    });
    return [...cur, ...MY_GOAL_LIST.filter((g) => !g.current)];
  });
  private get all(): GoalListRow[] {
    return this.rows();
  }

  // фильтры по колонкам таблицы
  protected readonly fEmp = signal('');
  protected readonly fType = signal('');
  protected readonly fPer = signal('');
  protected readonly fGrade = signal('');
  protected readonly fSt = signal('');
  private readonly opts = (k: (g: GoalListRow) => string) => computed(() => [...new Set(this.rows().map(k).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru')));
  protected readonly empOpts = this.opts((g) => g.owner.name);
  protected readonly typeOpts = this.opts((g) => g.type);
  protected readonly perOpts = this.opts((g) => g.period);
  protected readonly gradeOpts = this.opts((g) => g.grade);
  protected readonly stOpts = this.opts((g) => this.status(g));

  private hit(g: GoalListRow, q: string): boolean {
    return (
      (!q || g.title.toLowerCase().includes(q) || g.owner.name.toLowerCase().includes(q)) &&
      (!this.fEmp() || g.owner.name === this.fEmp()) &&
      (!this.fType() || g.type === this.fType()) &&
      (!this.fPer() || g.period === this.fPer()) &&
      (!this.fGrade() || g.grade === this.fGrade()) &&
      (!this.fSt() || this.status(g) === this.fSt())
    );
  }
  /** дерево «По цели»: найденные цели и их родители */
  protected readonly tree = computed<Row[]>(() => {
    const q = this.q().trim().toLowerCase(), fold = this.fold();
    const keep = (g: GoalListRow): boolean => this.hit(g, q) || this.all.some((k) => k.parent === g.id && keep(k));
    const kids = (id: string) => this.all.filter((g) => g.parent === id && keep(g));
    const roots = this.all
      .filter((g) => keep(g) && (!g.parent || !this.all.some((x) => x.id === g.parent)))
      .sort((a, b) => (LEVEL_ORDER[a.level] ?? 2) - (LEVEL_ORDER[b.level] ?? 2));
    const out: Row[] = [];
    const walk = (g: GoalListRow, lv: number) => {
      const K = kids(g.id);
      out.push({ g, lv, kids: K.length > 0, dim: !this.hit(g, q) });
      if (!fold.has(g.id)) K.forEach((k) => walk(k, lv + 1));
    };
    roots.forEach((g) => walk(g, 0));
    return out;
  });
  /** «По сотруднику»: сначала я, затем остальные по алфавиту */
  protected readonly groups = computed<Group[]>(() => {
    const q = this.q().trim().toLowerCase(), by: Record<string, GoalListRow[]> = {};
    this.all.filter((g) => this.hit(g, q)).forEach((g) => (by[g.owner.name] ??= []).push(g));
    return Object.keys(by)
      .sort((a, b) => (a === this.me.name ? -1 : b === this.me.name ? 1 : a.localeCompare(b)))
      .map((name) => {
        const o = by[name][0].owner;
        return { name, sub: o.role + (o.unit ? ' · ' + o.unit : ''), av: o.av, rows: by[name].map((g) => ({ g, lv: 1, kids: false, dim: false })) };
      });
  });

  /** статус карты: у моих текущих целей — этап карты, у прошлых — «Итог», у чужих — нет */
  protected status(g: GoalListRow): string {
    if (!g.mine) return '';
    if (!g.current) return 'Завершена';
    return GOAL_STAGES.find((s) => s.value === goalStatusOf(this.demo.goalStage()))!.label;
  }
  protected tone(st: string): string {
    return STATUS_TONE[st] || '';
  }
  protected canEdit(g: GoalListRow): boolean {
    const s = this.demo.goalStage();
    return g.current && s === 'draft';
  }
  protected canRate(g: GoalListRow): boolean {
    const s = this.demo.goalStage();
    return g.current && (s === 'self' || (s === 'cust' && g.kind === 'txt'));
  }
  protected rateLabel(g: GoalListRow): string {
    return this.demo.goalStage() === 'self' && g.rated ? 'Изменить оценку' : 'Оценить';
  }

  protected toggle(k: string): void {
    this.fold.update((f) => {
      const n = new Set(f);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  }
  protected open(g: GoalListRow, mode: 'view' | 'edit' = 'view'): void {
    this.nav.go('mygoalview', { gl: g.id, mode, ev: this.demo.goalStage() });
  }
  protected edit(g: GoalListRow): void {
    this.nav.go('mygoalnew', { edit: g.id, ev: this.demo.goalStage() });
  }
}
