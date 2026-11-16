import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ctLearn } from '../../data/career-track.data';
import { LearnStore } from '../../core/demo/learn-store.service';
import { NavService } from '../../core/navigation/nav.service';
import { CtLearnItem } from '../../interface/career-track';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../shared/ui/select/select';
import { LearnActionButton } from '../../widgets/learn-action/learn-action';

/** «Возможности для обучения»: отдельный остров, фильтры как в каталоге */
@Component({
  selector: 'ct-learn',
  imports: [FilterBar, Select, LearnActionButton],
  template: `
    <div class="c mt ctlrn">
      <div class="ch">
        <h3>Возможности для обучения<span class="chip">{{ shown().length }}</span></h3>
      </div>
      <app-filter-bar placeholder="Поиск по названию" [(query)]="q" [(opened)]="opened">
        <app-select ftName="Тип" label="Тип" allLabel="Все" [options]="types" [(value)]="type" />
        <app-select ftName="Грейд" label="Грейд" allLabel="Все" [options]="grades()" [(value)]="grade" />
        <app-select ftName="Раздел каталога" label="Раздел каталога" allLabel="Все" [options]="sections()" [(value)]="section" />
        <app-select ftName="Тег" label="Тег" allLabel="Все" [options]="tags()" [(value)]="tag" />
      </app-filter-bar>
      @if (shown().length) {
        <div class="cb">
          <div class="cgrid ctcards">
            @for (c of shown(); track c.kind + c.id) {
              <div class="ccard cw">
                <div class="cbody" (click)="open(c)">
                  <img [src]="c.img" alt="" />
                  <div class="cc2">
                    <b>{{ c.title }}</b>
                    <div class="cmeta"><span>{{ c.type }} · {{ c.line }}</span></div>
                  </div>
                </div>
                <div class="cact" learn-action [action]="action(c)" (act)="run(c, $event)"></div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="empty sm"><b>Ничего не найдено</b><small>Измените поиск или условия фильтров</small></div>
      }
    </div>
  `,
  styles: [':host{display:block}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtLearn {
  readonly scope = input.required<'role' | 'comp'>();
  private readonly nav = inject(NavService);
  private readonly store = inject(LearnStore);
  private readonly list = computed(() => ctLearn(this.scope()));
  protected readonly q = signal('');
  protected readonly opened = signal(false);
  protected readonly type = signal('');
  protected readonly grade = signal('');
  protected readonly section = signal('');
  protected readonly tag = signal('');
  protected readonly types = ['Курс', 'Мероприятие'];
  protected readonly grades = computed(() => uniq(this.list().map((x) => x.grade)));
  protected readonly sections = computed(() => uniq(this.list().map((x) => x.section)));
  protected readonly tags = computed(() => uniq(this.list().map((x) => x.tag)));
  protected readonly shown = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.list().filter(
      (x) =>
        (!q || x.title.toLowerCase().includes(q)) &&
        (!this.type() || x.type === this.type()) &&
        (!this.grade() || x.grade === this.grade()) &&
        (!this.section() || x.section === this.section()) &&
        (!this.tag() || x.tag === this.tag()),
    );
  });

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

function uniq(list: string[]): string[] {
  return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'));
}
