import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_EVENT_FORMATS } from '../../../data/attest.data';
import { ME_PHOTO } from '../../../data/people.data';
import { AttEvent } from '../../../interface/attest';
import { DateRange, DateRangeField, EMPTY_RANGE, inRange } from '../../../shared/ui/date-range/date-range';
import { MultiSelect } from '../../../shared/ui/multi-select/multi-select';
import { Select } from '../../../shared/ui/select/select';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { NavService } from '../../../core/navigation/nav.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { AttncardCol } from '../attncard-col/attncard-col';
import { avFor, cDur, evAvCls, evFormat, evPerson, evWhen } from '../attncard.utils';

const ST = {
  done: ['ok', 'Проведено'],
  plan: ['info', 'Запланировано'],
  cancel: ['gry', 'Отменено'],
} as const;

/**
 * Мероприятия аттестации таблицей: поиск и формат; строка раскрывается — описание и ссылка на встречу;
 * участники — три аватарки и «+N» со списком; справа иконки «Редактировать» и «Удалить» (руководитель и HR — до заседания комиссии).
 */
@Component({
  selector: '[attncard-events]',
  imports: [AttncardCol, FilterBar, DateRangeField, MultiSelect, Select, Icon, Float, Tooltip],
  template: `
    <div class="ch">
      <button attncard-col="Мероприятия"></button>
      <h3>Мероприятия</h3>
      <span class="chip">{{ s.events().length }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по названию мероприятия" [(query)]="q">
      @if (s.canEditEvents()) {
        <!-- «Добавить» — последней в строке поиска, справа от фильтра -->
        <button ftAction class="btn pri" (click)="nav.go('eventnew', { type: 'Аттестация', from: 'attncard' })">Добавить</button>
      }
      <app-date-range label="Дата" [(value)]="dr" />
      <app-multi-select label="Участники" [options]="peopleOpts()" [meta]="peopleMeta()" [(value)]="ppl" />
      <app-select label="Статус" [options]="stOpts" allLabel="Все статусы" placeholder="Все статусы" [(value)]="st" />
      <app-select label="Формат" [options]="formats" allLabel="Все форматы" placeholder="Все форматы" [(value)]="f" />
    </app-filter-bar>
    <div class="cb">
      <div class="tw">
        <table class="tbl asttbl afevtbl">
          <thead>
            <tr><th>Наименование</th><th>Дата и время</th><th>Участники</th><th>Статус</th><th class="tact"></th></tr>
          </thead>
          <tbody>
            @for (e of rows(); track e) {
              @let st = st_[s.eventStatus(e)];
              <tr class="afrow afexp" [class.open]="opened().has(e)" (click)="toggle(e)">
                <td>
                  <span class="afcell"
                    ><span class="afchev"><app-icon name="chevDown" /></span
                    ><span
                      ><b class="asttp" [title]="e.t">{{ e.t }}</b><small class="astevs">{{ fmt(e.f) }}</small></span
                    ></span
                  >
                </td>
                <td>{{ when(e) }} <span class="gr afevdur">({{ dur(e.dur) }})</span></td>
                <td>
                  <span class="avs astavs afevav">
                    @for (x of e.p.slice(0, 3); track $index) {
                      @if (x === 'me') {
                        <img class="av" [src]="me" alt="" [appTip]="tip(x)" />
                      } @else {
                        <span class="av" [class]="av(x)" [appTip]="tip(x)"></span>
                      }
                    }
                    @if (e.p.length > 3) {
                      <button class="more" title="Все участники" (click)="openMore(e, $event)">+{{ e.p.length - 3 }}</button>
                    }
                  </span>
                </td>
                <td><span [class]="'bdg ' + st[0]">{{ st[1] }}</span></td>
                <td class="tact">
                  <span class="acts">
                    @if (s.canEditEvents()) {
                      <!-- действия строки иконками: «Редактировать» слева, «Удалить» справа -->
                      <button class="actb" title="Редактировать" aria-label="Редактировать мероприятие" (click)="$event.stopPropagation(); editEv(e)"><app-icon name="edit" /></button>
                      <button class="actb dg" title="Удалить" aria-label="Удалить мероприятие" (click)="$event.stopPropagation(); del(e)"><app-icon name="trashSm" /></button>
                    }
                  </span>
                </td>
              </tr>
              <tr class="afacc" [class.hidden]="!opened().has(e)">
                <td colspan="5">
                  <div class="afaccb afevacc">
                    <small>Описание</small>
                    <p>{{ e.s }}</p>
                    <small class="afaccd">Ссылка на встречу</small>
                    <p><a class="lnk" href="#" (click)="link(e, $event)">{{ e.u }}</a></p>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="gr curnone">Мероприятия не найдены. Измените запрос или фильтр.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    @if (more(); as m) {
      <div class="fpop selpop afpplpop" [appFloat]="m.a" (click)="$event.stopPropagation()">
        <div class="afppl">
          @for (x of m.e.p.slice(3); track $index) {
            @let p = person(x);
            <div class="afpi">
              @if (x === 'me') {
                <img class="av" [src]="me" alt="" />
              } @else {
                <span class="av" [class]="avName(x)"></span>
              }
              <span><b>{{ p.name }}</b><small>{{ p.post }}</small></span>
            </div>
          }
        </div>
      </div>
    }
  `,
  host: {
    class: 'afsect',
    '[class.afcold]': 's.isCold("Мероприятия")',
    '(document:click)': 'more.set(null)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardEvents {
  protected readonly nav = inject(NavService);
  protected readonly s = inject(AttestStore);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly me = ME_PHOTO;
  protected readonly formats = ATT_EVENT_FORMATS;
  protected readonly st_ = ST;
  protected readonly fmt = evFormat;
  protected readonly when = evWhen;
  protected readonly dur = cDur;
  protected readonly av = evAvCls;
  protected readonly person = evPerson;
  protected readonly avName = (x: string | number) => avFor(evPerson(x).name, evPerson(x).av);
  protected readonly q = signal('');
  protected readonly f = signal('');
  /** фильтры: период (дата мероприятия), участники (любой из выбранных), статус */
  protected readonly dr = signal<DateRange>(EMPTY_RANGE);
  protected readonly ppl = signal<string[]>([]);
  protected readonly st = signal('');
  protected readonly stOpts = Object.values(ST).map((x) => x[1]);
  protected readonly peopleOpts = computed(() => [...new Set(this.s.events().flatMap((e) => e.p.map((x) => evPerson(x).name)))]);
  /** в списке фильтра — фото и должность, в поле — только ФИО */
  protected readonly peopleMeta = computed(() =>
    Object.fromEntries(
      this.s.events().flatMap((e) =>
        e.p.map((x) => {
          const p = evPerson(x);
          return [p.name, x === 'me' ? { img: this.me, sub: p.post } : { av: avFor(p.name, p.av), sub: p.post }];
        }),
      ),
    ),
  );
  protected readonly opened = signal(new Set<AttEvent>());
  protected readonly more = signal<{ e: AttEvent; a: HTMLElement } | null>(null);
  /** «Редактировать» — страница мероприятия с данными строки; сохранение вернет на бланк */
  protected editEv(e: AttEvent): void {
    this.nav.go('eventnew', { type: 'Аттестация', from: 'attncard', aev: String(this.s.events().indexOf(e)) });
  }

  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(),
      f = this.f();
    const ppl = this.ppl(),
      st = this.st();
    return this.s
      .events()
      .filter(
        (e) =>
          (!q || (e.t + ' ' + e.ty).toLowerCase().includes(q)) &&
          (!f || e.f === f) &&
          inRange(this.dr(), e.d.split(' ')[0]) &&
          (!ppl.length || e.p.some((x) => ppl.includes(evPerson(x).name))) &&
          (!st || ST[this.s.eventStatus(e)][1] === st),
      );
  });
  protected tip(x: string | number): string {
    const p = evPerson(x);
    return p.name + '|' + p.post;
  }
  protected toggle(e: AttEvent): void {
    const s = new Set(this.opened());
    s.has(e) ? s.delete(e) : s.add(e);
    this.opened.set(s);
  }

  protected openMore(e: AttEvent, ev: Event): void {
    ev.stopPropagation();
    const a = ev.currentTarget as HTMLElement;
    this.more.set(this.more()?.a === a ? null : { e, a });
  }
  protected link(e: AttEvent, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.toast.show('Ссылка', 'Откроется ' + e.u);
  }


  protected async del(e: AttEvent): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Удалить мероприятие?',
      text: `Мероприятие **${e.t}** (${e.d.split(' ')[0]}) будет удалено из бланка, участники получат уведомление об отмене. Восстановить его не получится.`,
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.s.events.update((l) => l.filter((x) => x !== e));
    this.toast.show('Мероприятие удалено', e.t + ' — участники получат уведомление об отмене.');
  }
}
