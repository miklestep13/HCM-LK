import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { LearnStore } from '../../../core/demo/learn-store.service';
import { NavService } from '../../../core/navigation/nav.service';
import { CP_LEARN, CP_RECOMMEND, cpLearnItem } from '../../../data/career-path.data';
import { CtLearnItem } from '../../../interface/career-track';
import { LearnActionButton } from '../../../widgets/learn-action/learn-action';

/**
 * «Рекомендуем изучить»: материалы каталога по компетенциям, которых не хватает до выбранного грейда
 * (первый материал каждой компетенции, не больше трех). Действия — как в «Каталоге обучения».
 */
@Component({
  selector: '[career-learn]',
  imports: [LearnActionButton],
  template: `
    <div class="ch"><h3>Рекомендуем изучить<span class="chip">{{ items().length }}</span></h3></div>
    <div class="cb">
      @for (c of items(); track c.kind + c.id) {
        <div class="cplc">
          <img [src]="c.img" alt="" (click)="open(c)" />
          <div class="cplct">
            <b (click)="open(c)">{{ c.title }}</b>
            <small>{{ c.type }} · {{ c.line }}</small>
            <small class="cplcf">{{ compOf(c) }}</small>
          </div>
          <span class="cplca" learn-action [action]="action(c)" (act)="run(c, $event)"></span>
        </div>
      } @empty {
        <div class="cplnone"><b>Все компетенции на нужном уровне</b><small>Новые материалы появятся, когда откроете требования другого грейда</small></div>
      }
      <button type="button" class="lnk cplall" (click)="nav.go('dev', { lt: 'cat' })">Весь каталог обучения</button>
    </div>
  `,
  styleUrl: './career-learn.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-learn' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerLearn {
  private readonly s = inject(CareerStore);
  private readonly store = inject(LearnStore);
  protected readonly nav = inject(NavService);

  /** по одному доступному материалу на компетенцию «Не хватает» или «Не оценен»; если таких нет — рекомендованный набор */
  protected readonly items = computed<CtLearnItem[]>(() => {
    const lack = this.s.rows().filter((r) => r.status === 'Не хватает' || r.status === 'Не оценен');
    const picked = lack.map((r) => (CP_LEARN[r.comp] || []).map((id) => cpLearnItem(id)).find((c) => c && this.available(c))).filter((x): x is CtLearnItem => !!x);
    const list = picked.length ? picked : CP_RECOMMEND.map((id) => cpLearnItem(id)).filter((x): x is CtLearnItem => !!x);
    return list.slice(0, 3);
  });

  /** материал можно пройти или подать заявку (не закрыт по грейду) */
  private available(c: CtLearnItem): boolean {
    const a = this.action(c);
    return !a || a.kind === 'btn' || !a.lock;
  }

  protected compOf(c: CtLearnItem): string {
    return Object.keys(CP_LEARN).find((k) => CP_LEARN[k].includes(c.id)) || '';
  }
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
