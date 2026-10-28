import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import {
  ORG_BY_ID,
  ORG_ME,
  orgCard,
  orgKids,
  orgPath,
  orgTotal,
  shortFio,
} from '../../../data/org.data';
import { EmployeeCard as EmployeeCardData } from '../../../interface/org';
import { EmployeeCard } from '../../../widgets/employee-card/employee-card';
import { OH, OW, OrgState } from '../org.state';

/**
 * Блок «Схема»: дерево карточек с линиями, перетаскивание и масштаб колесом,
 * «Уровень выше» и хлебные крошки, кнопки масштаба, всплывающая карточка сотрудника по клику.
 */
import { avCls } from '../../../data/people.data';
@Component({
  selector: '[org-chart]',
  imports: [EmployeeCard],
  templateUrl: './org-chart.html',
  styleUrl: './org-chart.scss',
  encapsulation: ViewEncapsulation.None,
  host: { '(document:click)': 'docClick($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgChart {
  protected readonly avCls = avCls;
  protected readonly s = inject(OrgState);
  private readonly nav = inject(NavService);
  private readonly map = viewChild.required<ElementRef<HTMLElement>>('map');

  protected readonly me = ORG_ME;
  protected readonly node = (id: string) => ORG_BY_ID[id];
  protected readonly kids = (id: string) => orgKids(id).length;
  protected readonly total = orgTotal;
  protected readonly short = (id: string) => shortFio(ORG_BY_ID[id].name);
  protected readonly crumbs = computed(() => orgPath(this.s.root()));
  protected readonly hasUp = computed(() => !!ORG_BY_ID[this.s.root()].parent);
  protected readonly transform = computed(
    () => `translate(${this.s.x()}px, ${this.s.y()}px) scale(${this.s.z()})`,
  );

  protected readonly drag = signal(false);
  private dragAt = 0;
  /** всплывающая карточка сотрудника */
  protected readonly pop = signal<{
    id: string;
    card: EmployeeCardData;
    left: number;
    top: number;
  } | null>(null);

  constructor() {
    // размер окна и подгонка масштаба после отрисовки
    afterRenderEffect(() => {
      const el = this.map().nativeElement;
      this.s.vw.set(el.clientWidth);
      this.s.vh.set(el.clientHeight);
      if (!this.s.z()) this.s.fit();
    });
  }

  protected wheel(e: WheelEvent): void {
    e.preventDefault();
    const r = this.map().nativeElement.getBoundingClientRect();
    this.s.zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - r.left, e.clientY - r.top);
  }

  protected down(e: PointerEvent): void {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.ogzm,.ogtop,.fpop')) return;
    const sx = e.clientX,
      sy = e.clientY,
      ox = this.s.x(),
      oy = this.s.y();
    let mv = false;
    const mm = (ev: PointerEvent) => {
      const dx = ev.clientX - sx,
        dy = ev.clientY - sy;
      if (!mv && Math.hypot(dx, dy) < 5) return;
      if (!mv) {
        mv = true;
        this.pop.set(null);
        this.drag.set(true);
      }
      this.s.pan(ox + dx, oy + dy);
    };
    const up = () => {
      removeEventListener('pointermove', mm);
      removeEventListener('pointerup', up);
      this.drag.set(false);
      if (mv) this.dragAt = Date.now();
    };
    addEventListener('pointermove', mm);
    addEventListener('pointerup', up);
  }

  /** клик сработал после перетаскивания — игнорируем */
  private dragged(): boolean {
    return Date.now() - this.dragAt < 250;
  }

  protected toggle(id: string, e: Event): void {
    e.stopPropagation();
    if (this.dragged()) return;
    this.pop.set(null);
    this.s.toggle(id);
  }
  protected up(): void {
    this.pop.set(null);
    this.s.up();
  }
  protected crumb(id: string): void {
    this.pop.set(null);
    this.s.crumb(id);
  }
  protected zoom(k: 'in' | 'out' | 'fit'): void {
    k === 'fit' ? this.s.fit() : this.s.zoom(k === 'in' ? 1.2 : 1 / 1.2);
  }

  /** клик по карточке — карточка из «Сотрудников» справа от узла (если не помещается — слева) */
  protected openCard(id: string, e: MouseEvent): void {
    e.stopPropagation();
    if (this.dragged()) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect(),
      w = 340,
      h = 420;
    const left = r.right + 12 + w < innerWidth - 12 ? r.right + 12 : Math.max(12, r.left - w - 12);
    this.pop.set({
      id,
      card: orgCard(id),
      left,
      top: Math.max(12, Math.min(r.top - 40, innerHeight - h - 12)),
    });
  }
  protected openProfile(id: string): void {
    this.pop.set(null);
    if (id === ORG_ME) this.nav.go('prof');
    else this.nav.go('emp', { emp: ORG_BY_ID[id].name });
  }
  protected docClick(e: Event): void {
    if (this.pop() && !(e.target as HTMLElement).closest('.ogecp')) this.pop.set(null);
  }
  protected closePop(): void {
    if (!this.dragged()) this.pop.set(null);
  }

  protected readonly OW = OW;
  protected readonly OH = OH;
}
