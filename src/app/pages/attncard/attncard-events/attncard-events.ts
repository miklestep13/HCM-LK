import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_EVENT_FORMATS } from '../../../data/attest.data';
import { ME_PHOTO } from '../../../data/people.data';
import { AttEvent } from '../../../interface/attest';
import { Chips } from '../../../shared/ui/chips/chips';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { AttncardCol } from '../attncard-col/attncard-col';
import { AttncardEventEdit } from '../attncard-event-edit/attncard-event-edit';
import { avFor, cDur, evAvCls, evFormat, evPerson, evWhen } from '../attncard.utils';

const ST = {
  done: ['ok', 'Проведено'],
  plan: ['info', 'Запланировано'],
  cancel: ['gry', 'Отменено'],
} as const;

/**
 * Мероприятия аттестации таблицей: поиск и формат; строка раскрывается — описание и ссылка на встречу;
 * участники — три аватарки и «+N» со списком; «…» — статус, ссылка, редактирование и удаление (руководитель и HR — до заседания комиссии).
 */
@Component({
  selector: '[attncard-events]',
  imports: [AttncardCol, FilterBar, Chips, Icon, Float, Tooltip, AttncardEventEdit],
  template: `
    <div class="ch">
      <button attncard-col="Мероприятия"></button>
      <h3>Мероприятия</h3>
      <span class="chip">{{ s.events().length }}</span>
      @if (s.canEditEvents()) {
        <button class="btn pri afevadd" (click)="edit.set({ ev: null })">Добавить</button>
      }
    </div>
    <app-filter-bar placeholder="Поиск по названию мероприятия" [(query)]="q">
      <app-chips label="Формат" [options]="formats" [(value)]="f" />
    </app-filter-bar>
    <div class="cb">
      <div class="tw">
        <table class="tbl asttbl afevtbl">
          <thead>
            <tr><th>Наименование</th><th>Дата и время</th><th>Участники</th><th>Статус</th><th></th></tr>
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
                <td>
                  <span class="acts"
                    ><button class="actb dots" title="Действия" (click)="openMenu(e, $event)"><app-icon name="dots" /></button
                  ></span>
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
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m.a" (click)="$event.stopPropagation()">
        @if (s.canEditEvents()) {
          @if (s.eventStatus(m.e) !== 'done') {
            <button class="ami" (click)="setSt(m.e, 'done')"><app-icon name="check" />Отметить проведенным</button>
          }
          @if (s.eventStatus(m.e) !== 'plan') {
            <button class="ami" (click)="setSt(m.e, 'plan')"><app-icon name="calendar" />Вернуть в запланированные</button>
          }
          <div class="kbmsep"></div>
        }
        <button class="ami" (click)="copy(m.e)"><app-icon name="copy" />Скопировать ссылку</button>
        @if (s.canEditEvents()) {
          <button class="ami" (click)="menu.set(null); edit.set({ ev: m.e })"><app-icon name="edit" />Редактировать</button>
          <button class="ami dg" (click)="del(m.e)"><app-icon name="trashSm" />Удалить</button>
        }
      </div>
    }
    @if (edit(); as ed) {
      <app-attncard-event-edit [event]="ed.ev" (closed)="edit.set(null)" />
    }
  `,
  host: {
    class: 'afsect',
    '[class.afcold]': 's.isCold("Мероприятия")',
    '(document:click)': 'menu.set(null); more.set(null)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardEvents {
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
  protected readonly opened = signal(new Set<AttEvent>());
  protected readonly menu = signal<{ e: AttEvent; a: HTMLElement } | null>(null);
  protected readonly more = signal<{ e: AttEvent; a: HTMLElement } | null>(null);
  protected readonly edit = signal<{ ev: AttEvent | null } | null>(null);

  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase(),
      f = this.f();
    return this.s.events().filter((e) => (!q || (e.t + ' ' + e.ty).toLowerCase().includes(q)) && (!f || e.f === f));
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
  protected openMenu(e: AttEvent, ev: Event): void {
    ev.stopPropagation();
    const a = ev.currentTarget as HTMLElement;
    this.more.set(null);
    this.menu.set(this.menu()?.a === a ? null : { e, a });
  }
  protected openMore(e: AttEvent, ev: Event): void {
    ev.stopPropagation();
    const a = ev.currentTarget as HTMLElement;
    this.menu.set(null);
    this.more.set(this.more()?.a === a ? null : { e, a });
  }
  protected link(e: AttEvent, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.toast.show('Ссылка', 'Откроется ' + e.u);
  }
  protected setSt(e: AttEvent, st: 'done' | 'plan'): void {
    this.menu.set(null);
    this.s.updateEvent(e, { stO: st });
    this.toast.show('Статус мероприятия изменен', `${e.t} — ${{ done: 'проведено', plan: 'запланировано' }[st]}.`);
  }
  protected copy(e: AttEvent): void {
    this.menu.set(null);
    try {
      navigator.clipboard?.writeText('https://' + e.u).catch(() => {});
    } catch {
      /* буфер обмена недоступен */
    }
    this.toast.show('Ссылка скопирована', e.u);
  }
  protected async del(e: AttEvent): Promise<void> {
    this.menu.set(null);
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
