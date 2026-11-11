import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { REQS, REQ_CATS, REQ_STATUSES, REQ_TABS } from '../../data/req.data';
import { ME_PHOTO } from '../../data/people.data';
import { DateRangeField } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { MultiSelect, MultiSelectMeta } from '../../shared/ui/multi-select/multi-select';
import { Select } from '../../shared/ui/select/select';
import { ReqQuick } from './req-quick/req-quick';
import { ReqTable } from './req-table/req-table';
import { ReqState } from './req.state';

/**
 * «Мой кабинет → Заявки» (перенесено из прототипа pg-req, таблица собрана по примерам рынка):
 * «Добавить» справа от заголовка — каталог заявок; быстрые заявки; вкладки «Мои заявки / Требуют действия / Наблюдаю» со счетчиками;
 * поиск по номеру или типу; фильтры по колонкам: тип заявки, автор, ответственный (фото и должность в списке), дата создания, состояние, дата окончания.
 * «Добавить» — форма «Новая заявка» (pages/reqnew); карточка заявки пока в старом прототипе (rqcard).
 */
@Component({
  selector: 'app-req',
  imports: [PageHead, FilterBar, Select, MultiSelect, DateRangeField, ReqQuick, ReqTable],
  template: `
    <app-page-head title="Заявки" [noBack]="true">
      <button class="btn pri" (click)="nav.go('reqnew')">Добавить</button>
    </app-page-head>
    <div req-quick></div>
    <div class="c full">
      <div class="svtabs">
        @for (t of tabs; track t[0]) {
          <span [class.on]="s.tab() === t[0]" (click)="s.setTab(t[0])">{{ t[1] }}<span class="pntc">{{ s.count()[t[0]] }}</span></span>
        }
      </div>
      <!-- фильтры — по колонкам таблицы, все одного вида («Подпись: значение») -->
      <app-filter-bar placeholder="Поиск по номеру или типу заявки" [(query)]="s.q" [(opened)]="s.opened">
        <app-select label="Тип заявки" allLabel="Все" [options]="cats" [(value)]="s.cat" />
        <app-multi-select label="Автор" [options]="authorOpts()" [meta]="people()" [(value)]="s.authors" />
        <app-multi-select label="Ответственный" [options]="respOpts()" [meta]="people()" [(value)]="s.resps" />
        <app-date-range label="Дата создания" [(value)]="s.created" />
        <app-select label="Состояние" allLabel="Все" [options]="statuses" [(value)]="s.status" />
        <app-date-range label="Дата окончания" [(value)]="s.ended" />
      </app-filter-bar>
      <div class="cb" style="padding-top: 4px" req-table></div>
    </div>
  `,
  styleUrl: './req.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-req' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqPage {
  protected readonly s = inject(ReqState);
  protected readonly nav = inject(NavService);
  protected readonly tabs = REQ_TABS;
  protected readonly cats = REQ_CATS;
  protected readonly statuses = REQ_STATUSES;
  /** авторы и ответственные вкладки — для фильтров */
  protected readonly authorOpts = computed(() => [...new Set(this.s.inTab().map((r) => r.ini.n))]);
  protected readonly respOpts = computed(() => [...new Set(this.s.inTab().flatMap((r) => (r.resp ? [r.resp.n] : [])))]);
  /** в списке фильтра — фото и должность */
  protected readonly people = computed(() =>
    Object.fromEntries(
      REQS.flatMap((r) => (r.resp ? [r.ini, r.resp] : [r.ini])).map((p): [string, MultiSelectMeta] => [p.n, p.av === 'me' ? { img: ME_PHOTO, sub: p.pos } : { av: p.av, sub: p.pos }]),
    ),
  );
  protected readonly countText = computed(() => {
    const n = this.s.inTab().length, k = this.s.rows().length;
    return `Показано ${k} из ${n} ${n % 10 === 1 && n % 100 !== 11 ? 'заявки' : 'заявок'}`;
  });
}
