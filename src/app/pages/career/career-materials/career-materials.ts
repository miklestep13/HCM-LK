import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, output } from '@angular/core';
import { LearnStore } from '../../../core/demo/learn-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { CP_LEARN, cpLearnItem } from '../../../data/career-path.data';
import { CpReqRow } from '../../../interface/career-path';
import { CtLearnItem } from '../../../interface/career-track';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { LearnActionButton } from '../../../widgets/learn-action/learn-action';

/**
 * Всплывающая панель «Материалы уровня»: до трех карточек каталога по компетенции с теми же действиями,
 * что в «Каталоге обучения», и ссылка на все материалы компетенции.
 */
@Component({
  selector: 'app-career-materials',
  imports: [Float, Icon, LearnActionButton],
  template: `
    <div class="fpop cpmat" [appFloat]="anchor()" (click)="$event.stopPropagation()">
      <div class="cpmath">
        <div>
          <b>Материалы уровня «{{ row().need }}»</b>
          <small>{{ row().comp }}</small>
        </div>
        <button type="button" class="actb" title="Закрыть" (click)="closed.emit()"><app-icon name="closeSm" /></button>
      </div>
      @for (c of items(); track c.kind + c.id) {
        <div class="cpmi">
          <img [src]="c.img" alt="" (click)="open(c)" />
          <div class="cpmit" (click)="open(c)">
            <b>{{ c.title }}</b>
            <small>{{ c.type }} · {{ c.line }}</small>
          </div>
          <span class="cpmia" learn-action [action]="action(c)" (act)="run(c, $event)"></span>
        </div>
      } @empty {
        <div class="cpmnone">Материалов в каталоге пока нет</div>
      }
      <button type="button" class="lnk cpmall" (click)="nav.go('ctcomp', { id: row().id })">Все материалы компетенции</button>
    </div>
  `,
  styleUrl: './career-materials.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-materials', '(document:click)': 'closed.emit()', '(document:keydown.escape)': 'closed.emit()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerMaterials {
  readonly row = input.required<CpReqRow>();
  readonly anchor = input.required<HTMLElement>();
  readonly closed = output<void>();
  protected readonly nav = inject(NavService);
  private readonly store = inject(LearnStore);

  protected readonly items = computed(() =>
    (CP_LEARN[this.row().comp] || [])
      .map((id) => cpLearnItem(id))
      .filter((x): x is CtLearnItem => !!x)
      .slice(0, 3),
  );

  protected action(c: CtLearnItem) {
    const st = this.store.status(c.kind, c.id, 'cat');
    return c.kind === 'ev' ? this.store.eventAction(st, c.id, false) : this.store.courseAction(st, c.id);
  }
  protected open(c: CtLearnItem): void {
    this.nav.go('course', c.kind === 'ev' ? { crs: c.id, kind: 'trn' } : { crs: c.id });
  }
  protected run(c: CtLearnItem, act: string): void {
    this.store.run(c.kind, c.id, act);
  }
}
