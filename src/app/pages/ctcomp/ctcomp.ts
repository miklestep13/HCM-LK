import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, afterNextRender, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { CT_COMP, CT_COMPS, CT_COMP_LEVELS, CT_GRADES, CT_LEVELS, CT_LEVEL_DESC, CT_TPL_COMP, ctBehavior, ctSort } from '../../data/career-track.data';
import { NavService } from '../../core/navigation/nav.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { CtLearn } from '../ctrack/ct-learn';
import { CtLegend } from '../ctrack/ct-legend';
import { CtLevel } from '../ctrack/ct-level';
import { CtSort } from '../ctrack/ct-sort';

/**
 * Страница компетенции из справочника. Контент — шаблон «Кредитный анализ и оценка рисков»:
 * уровни, роли с требуемым уровнем, обучение.
 */
@Component({
  selector: 'app-ctcomp',
  imports: [PageHead, CtSort, CtLevel, CtLegend, CtLearn],
  templateUrl: './ctcomp.html',
  styleUrl: '../ctrack/career.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-ctcomp' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ctcomp {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  readonly id = input('');
  private readonly dsc = viewChild<ElementRef<HTMLElement>>('dsc');
  protected readonly comp = CT_COMPS.find((c) => c.id === CT_TPL_COMP)!;
  protected readonly detail = CT_COMP;
  protected readonly levels = CT_LEVELS;
  protected readonly grades = CT_GRADES;
  protected readonly heads = ['Роль', ...CT_GRADES];
  protected readonly levelDesc = CT_LEVEL_DESC;
  protected readonly behaviors = CT_COMP_LEVELS;
  protected readonly sub = CT_COMP.sub + '  Ролей: ' + CT_COMP.roles.length;
  protected readonly more = signal(false);
  protected readonly opened = signal(false);
  protected readonly q = signal('');
  protected readonly sortBy = signal<{ k: number; d: 1 | -1 }>({ k: 0, d: 1 });
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    const list = CT_COMP.roles.filter((r) => !q || r.name.toLowerCase().includes(q));
    const s = this.sortBy();
    const pick = (r: (typeof list)[0]) => (s.k === 0 ? r.name : CT_LEVELS.indexOf(r.levels[s.k - 1] || ''));
    return ctSort(list, pick, s.d);
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id && id !== CT_TPL_COMP) {
        const c = CT_COMPS.find((x) => x.id === id);
        untracked(() => this.toast.show('Шаблон компетенции', 'Компетенция «' + (c?.name || id) + '» пока заполнена по шаблону «Кредитный анализ и оценка рисков».'));
      }
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

  protected behavior(level: string): string {
    return ctBehavior(this.comp.name, level);
  }
  protected sort(i: number, e: Event): void {
    e.stopPropagation();
    const s = this.sortBy();
    this.sortBy.set(s.k === i ? { k: i, d: s.d === 1 ? -1 : 1 } : { k: i, d: 1 });
  }
  protected toggle(): void {
    const el = this.dsc()?.nativeElement;
    if (!el) return;
    const open = !this.opened();
    this.opened.set(open);
    const lh = parseFloat(getComputedStyle(el.querySelector('p') || el).lineHeight) || 22;
    el.style.maxHeight = open ? '' : lh * 4 + 'px';
  }
  protected openRole(id: string): void {
    this.nav.go('ctrole', { id });
  }
}
