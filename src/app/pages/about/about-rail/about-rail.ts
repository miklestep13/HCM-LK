import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';

/** Горизонтальный ряд статей: справа край обрезан, по наведению — стрелки прокрутки. */
@Component({
  selector: 'div[about-rail]',
  imports: [Icon],
  template: `
    <div class="ab-rail" #sc (scroll)="sync()">
      <ng-content />
    </div>
    @if (hot() && canBack()) {
      <button type="button" class="ib2 ab-arr ab-arr-l" aria-label="Назад" (click)="move(-1)">
        <app-icon name="pgPrev" />
      </button>
    }
    @if (hot() && canFwd()) {
      <button type="button" class="ib2 ab-arr ab-arr-r" aria-label="Дальше" (click)="move(1)">
        <app-icon name="pgNext" />
      </button>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ab-railh',
    '(mouseenter)': 'hot.set(true)',
    '(mouseleave)': 'hot.set(false)',
  },
})
export class AboutRail {
  private readonly sc = viewChild<ElementRef<HTMLElement>>('sc');
  protected readonly hot = signal(false);
  protected readonly canBack = signal(false);
  protected readonly canFwd = signal(false);

  constructor() {
    afterNextRender(() => this.sync());
  }

  protected sync(): void {
    const el = this.sc()?.nativeElement;
    if (!el) return;
    this.canBack.set(el.scrollLeft > 4);
    this.canFwd.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  protected move(dir: number): void {
    const el = this.sc()?.nativeElement;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.npost');
    const step = card ? card.offsetWidth + 16 : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
}
