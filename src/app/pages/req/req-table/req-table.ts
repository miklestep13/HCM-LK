import { Pager, paginate } from '../../../shared/ui/pager/pager';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NavService } from '../../../core/navigation/nav.service';
import { ME_PHOTO } from '../../../data/people.data';
import { REQ_STATUS_TONE, REQ_TYPES, reqLegacyStatus } from '../../../data/req.data';
import { Req, ReqTab } from '../../../interface/req';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Rating } from '../../../shared/ui/rating/rating';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ReqState, reqEnd, reqResult } from '../req.state';

/** время действия в демо: «сегодня» 30.09.2026 */
const NOW_TEXT = '30.09.2026 12:00';

/**
 * Таблица заявок: чек-бокс и «Выбрать все», №, тип заявки, состояние (без этапа), автор, ответственный за этап, дата и время создания,
 * уточнение к результату обработки, дата окончания (срок открытой — красным, если прошел);
 * справа «⋯» — действия по вкладке.
 * Над таблицей при выборе строк — панель массовых действий. Клик по строке — просмотр заявки (pages/reqnew, только чтение).
 */
@Component({
  selector: '[req-table]',
  imports: [Pager, NgTemplateOutlet, Float, Icon, Rating],
  template: `
    @let sel = s.sel();
    @if (sel.size) {
      <div class="mtbulk rqbulk">
        <b>Выбрано: {{ sel.size }}</b><button class="lnk" (click)="s.selectAll(false)">Снять выделение</button><span class="mtsp"></span>
        @for (b of bulk(); track b[0]) {
          <button class="btn raised" (click)="bulkAct(b[0])">{{ b[1] }}</button>
        }
      </div>
    }
    <div class="tw">
      <table class="tbl rtbl mttbl rqtbl">
        <thead>
          <tr>
            <th class="chk">
              <label class="ckb" title="Выбрать все на странице"
                ><input type="checkbox" [checked]="allOn()" [indeterminate]="someOn()" [disabled]="!pg.view().length" (change)="pageAll($any($event.target).checked)" /><i></i
              ></label>
            </th>
            @for (c of cols(); track c[0]) {
              <th [style.width.px]="c[2] || null">
                <span class="thh"
                  >{{ c[1]
                  }}<button class="sortb mts" [class.on]="s.sort().k === c[0]" title="Сортировать" [style.transform]="s.sort().k === c[0] && s.sort().dir < 0 ? 'scaleY(-1)' : null" (click)="s.sortBy(c[0])">
                    <svg viewBox="0 0 12 12" fill="none"><path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /><path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg></button
                ></span>
              </th>
            }
            <th class="tact rqact"></th>
          </tr>
        </thead>
        <tbody>
          @for (r of pg.view(); track r.id) {
            <tr [class.on]="sel.has(r.id)" (click)="open(r)">
              <td class="chk" (click)="$event.stopPropagation()">
                <label class="ckb"><input type="checkbox" [checked]="sel.has(r.id)" (change)="s.toggle(r.id)" /><i></i></label>
              </td>
              @for (c of cols(); track c[0]) {
                @switch (c[0]) {
                  @case ('id') {
                    <td class="rqid">{{ r.id }}</td>
                  }
                  @case ('n') {
                    <td>
                      <b class="rqn">{{ r.n }}</b>
                    </td>
                  }
                  @case ('ini') {
                    <td><ng-container *ngTemplateOutlet="who; context: { $implicit: r.ini }" /></td>
                  }
                  @case ('resp') {
                    <!-- ответственный за текущий этап; у завершенных — прочерк -->
                    <td>
                      @if (r.resp && !s.final(r)) {
                        <ng-container *ngTemplateOutlet="who; context: { $implicit: r.resp }" />
                      } @else {
                        <span class="gr">—</span>
                      }
                    </td>
                  }
                  @case ('cr') {
                    <td class="gr">{{ r.created }}</td>
                  }
                  @case ('st') {
                    <!-- состояние — только статус, без этапа -->
                    <td><span class="bdg" [class]="tone[r.st]">{{ r.st }}</span></td>
                  }
                  @case ('res') {
                    <td [class.gr]="!result(r)">{{ result(r) || '—' }}</td>
                  }
                  @case ('end') {
                    <!-- дата окончания: у открытой — срок (просрочен — красным), у завершенной — дата завершения -->
                    <td [class]="s.overdue(r) ? 'dgt' : 'gr'">{{ end(r) || '—' }}</td>
                  }
                }
              }
              <!-- действия строки закреплены справа: «Редактировать» левее «⋯» -->
              <td class="tact">
                <span class="acts">
                  @if (s.tab() === 'act') {
                    <!-- «Требуют действия»: вместо карандаша — иконка «Обработать» (открывает заявку на согласование / доработку) -->
                    <button class="actb" title="Обработать" aria-label="Обработать заявку" (click)="$event.stopPropagation(); open(r)"><app-icon name="mTask" /></button>
                  } @else {
                    <button class="actb" title="Редактировать" aria-label="Редактировать заявку" (click)="$event.stopPropagation(); open(r)"><app-icon name="edit" /></button>
                  }
                  <button class="actb dots" title="Действия" aria-label="Действия" [class.on]="menu()?.r === r" (click)="toggleMenu(r, $event)"><app-icon name="dots" /></button>
                </span>
              </td>
            </tr>
          } @empty {
            <tr><td [attr.colspan]="cols().length + 2" class="empty sm">По этим условиям заявок нет</td></tr>
          }
        </tbody>
      </table>
    </div>
    <app-pager [p]="pg" />

    <ng-template #who let-p>
      <span class="rqwho">
        <span class="av" [class]="'av ' + p.av" [style.background-image]="p.av === 'me' ? 'url(' + mePhoto + ')' : null"></span>
        <span><b>{{ p.n }}</b><small>{{ p.pos }}</small></span>
      </span>
    </ng-template>

    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m.a" (click)="$event.stopPropagation()">
        @for (a of acts(m.r); track a[0]) {
          <button class="ami" [class.dg]="a[3]" (click)="act(a[0], m.r)"><app-icon [name]="a[2]" />{{ a[1] }}</button>
        }
      </div>
    }
    @if (rate(); as x) {
      <div class="fpop rqratep" [appFloat]="x.a" (click)="$event.stopPropagation()">
        <div class="rqrph">Оцените выполнение заявки</div>
        <app-rating [value]="null" (valueChange)="rated(x.r, $event)" />
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { '(document:click)': 'menu.set(null); rate.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqTable {
  protected readonly s = inject(ReqState);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly tone = REQ_STATUS_TONE;
  protected readonly mePhoto = ME_PHOTO;
  /** постранично: «Выбрать все» — записи текущей страницы */
  protected readonly pg = paginate(() => this.s.rows());
  protected pageAll(on: boolean): void {
    this.s.sel.set(on ? new Set(this.pg.view().map((r) => r.id)) : new Set());
  }
  protected readonly menu = signal<{ r: Req; a: HTMLElement } | null>(null);
  protected readonly rate = signal<{ r: Req; a: HTMLElement } | null>(null);

  /** столбцы — одинаковые на всех вкладках (как в реестре заявок): №, тип, состояние, автор, ответственный, создание, уточнение, окончание */
  protected readonly cols = computed((): [string, string, number?][] => [
    ['id', '№', 110],
    ['n', 'Тип заявки', 260],
    ['st', 'Состояние', 160],
    ['ini', 'Автор', 300],
    ['resp', 'Ответственный', 300],
    ['cr', 'Дата и время создания', 190],
    ['res', 'Уточнение к результату обработки', 320],
    ['end', 'Дата окончания', 150],
  ]);
  protected readonly result = reqResult;
  /** дата окончания: открытая — срок, завершенная — дата завершения (без времени) */
  protected end(r: Req): string {
    return reqEnd(r).split(' ')[0];
  }
  protected readonly allOn = computed(() => {
    const R = this.pg.view(), S = this.s.sel();
    return !!R.length && R.every((r) => S.has(r.id));
  });
  protected readonly someOn = computed(() => this.s.sel().size > 0 && !this.allOn());
  /** массовые действия по вкладке */
  protected readonly bulk = computed((): [string, string][] => {
    const t = this.s.tab();
    if (t === 'act') return [['approve', 'Согласовать'], ['reject', 'Отклонить']];
    if (t === 'watch') return [['unwatch', 'Перестать наблюдать']];
    return [['remind', 'Напомнить'], ['recall', 'Отозвать']];
  });

  /** действия «⋯»: ключ, название, иконка, красное */
  protected acts(r: Req): [string, string, string, boolean?][] {
    const t = this.s.tab(), open = !this.s.final(r);
    if (t === 'act') {
      if (r.ini.av === 'me') return [['edit', 'Дополнить заявку', 'edit'], ['recall', 'Отозвать заявку', 'cross', true]];
      return [['approve', 'Согласовать', 'check'], ['back', 'Вернуть на доработку', 'refresh'], ['reject', 'Отклонить', 'cross', true]];
    }
    if (t === 'watch') return [['link', 'Скопировать ссылку', 'copyLink'], ['unwatch', 'Перестать наблюдать', 'eye']];
    const A: [string, string, string, boolean?][] = [];
    if (r.st === 'Черновик') A.push(['edit', 'Продолжить заполнение', 'edit']);
    else if (open) A.push(['remind', 'Напомнить исполнителю', 'bell']);
    A.push(['repeat', 'Повторить заявку', 'copy']);
    if (open) A.push(['recall', 'Отозвать заявку', 'cross', true]);
    return A;
  }

  protected toggleMenu(r: Req, e: MouseEvent): void {
    e.stopPropagation();
    this.rate.set(null);
    this.menu.set(this.menu()?.r === r ? null : { r, a: e.currentTarget as HTMLElement });
  }
  protected rateOpen(r: Req, e: MouseEvent): void {
    this.menu.set(null);
    this.rate.set(this.rate()?.r === r ? null : { r, a: e.currentTarget as HTMLElement });
  }
  protected rated(r: Req, v: number | null): void {
    if (!v) return;
    this.rate.set(null);
    this.s.patch([r.id], { rate: v });
    this.toast.show('Спасибо за оценку', 'Заявка ' + r.id + ' — ' + v + ' из 5.');
  }

  protected act(a: string, r: Req): void {
    this.menu.set(null);
    this.apply(a, [r]);
  }
  protected bulkAct(a: string): void {
    const S = this.s.sel();
    const R = this.s.rows().filter((r) => S.has(r.id));
    this.s.selectAll(false);
    this.apply(a, R);
  }
  private apply(a: string, R: Req[]): void {
    const ids = R.map((r) => r.id), one = R.length === 1 ? 'Заявка ' + R[0].id : 'Заявок: ' + R.length;
    const open = R.filter((r) => !this.s.final(r)).map((r) => r.id);
    switch (a) {
      case 'edit':
        return this.open(R[0]);
      case 'repeat':
        this.toast.show('Новая заявка', 'Поля заполнены по заявке ' + R[0].id + '.');
        return this.nav.go('reqnew', { type: REQ_TYPES.includes(R[0].n) ? R[0].n : '' });
      case 'remind':
        return this.toast.show('Напоминание отправлено', open.length ? one + ' — ответственный за этап получит уведомление.' : 'Среди выбранных нет открытых заявок.');
      case 'recall':
        this.s.patch(open, { st: 'Отозвана', closed: NOW_TEXT, due: undefined });
        return this.toast.show('Заявка отозвана', open.length ? one + ' — статус «Отозвана».' : 'Среди выбранных нет открытых заявок.');
      case 'approve':
        this.s.patch(ids, { st: 'В работе', tab: 'watch' as ReqTab, step: R[0].step + 1 > R[0].steps ? R[0].steps : R[0].step + 1 });
        return this.toast.show('Заявка согласована', one + ' передана на следующий этап и перенесена в «Наблюдаю».');
      case 'back':
        this.s.patch(ids, { st: 'На доработке', tab: 'watch' as ReqTab });
        return this.toast.show('Возвращено на доработку', one + ' — инициатор получит уведомление.');
      case 'reject':
        this.s.patch(ids, { st: 'Отклонена', closed: NOW_TEXT, tab: 'watch' as ReqTab });
        return this.toast.show('Заявка отклонена', one + ' — инициатор получит уведомление.');
      case 'unwatch':
        this.s.patch(ids, { tab: 'x' as ReqTab });
        return this.toast.show('Вы больше не наблюдаете', one + ' убрана из списка.');
      case 'link':
        return this.toast.show('Ссылка скопирована', 'Ссылку на заявку можно отправить коллеге.');
    }
  }

  /** просмотр заявки — та же форма, что «Новая заявка», только для чтения (pages/reqnew, ?rq=) */
  protected open(r: Req): void {
    this.nav.go('reqnew', { rq: r.id });
  }
}
