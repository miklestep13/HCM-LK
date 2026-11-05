import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { absCount, absDate } from '../../../core/demo/absence-store.service';
import { TODAY } from '../../../shared/ui/date-range/date-range';
import { ABS_DAY_COUNT, ABS_DAY_COUNT_LABEL, ABS_KIND_LABEL, ABS_REQ_GROUP, ABS_STATUS_TONE } from '../../../data/absence.data';
import { plural } from '../../../data/org.data';
import { ME, ME_PHOTO, PEOPLE, avCls } from '../../../data/people.data';
import { Attach } from '../../../shared/ui/attach/attach';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { NavService } from '../../../core/navigation/nav.service';
import { AbsencesState } from '../absences.state';

/**
 * Сайдбар отсутствия (клик по полосе), поля «подпись — значение» как в просмотре задачи: сотрудник, период, продолжительность
 * и способ подсчета дней, статус; у отпуска — остаток, у отгула — баланс, у больничного — открыт ли листок, у командировки —
 * время, работа в выходные, место, организация, цель, транспорт, проживание; у дополнительного отпуска — причина
 * (и дата сдачи крови), у учебного — оплата; у отпусков — заместитель; основание (документ и файлы), комментарий.
 * У своей заявки в черновике или на согласовании — «Отменить заявку»; у своей незавершенной — «Редактировать» справа от «Закрыть»:
 * изменения, как и новые отсутствия, — только заявкой (общая форма заявок, группа календарно-табельного учета).
 */
@Component({
  selector: 'app-absences-entry',
  imports: [Drawer, Attach],
  template: `
    @if (s.entry(); as e) {
      <app-drawer [title]="title()" okLabel="" cancelLabel="Закрыть" [open]="true" (openChange)="s.entry.set(null)">
        @if (canCancel()) {
          <button drwBtn class="btn dng" (click)="cancel()">Отменить заявку</button>
        }
        @if (canEdit()) {
          <button drwBtn class="btn pri" (click)="edit()">Редактировать</button>
        }
        <div class="abv">
          <div class="abwho">
            <span class="av" [class]="av(e.p.n, e.p.av)" [style.background-image]="e.mine ? 'url(' + mePhoto + ')' : null"></span>
            <span class="cnm"><b>{{ e.p.n }}</b><small>{{ e.p.pos }}</small></span>
          </div>
          <div class="abvf"><span class="l">Статус</span><span class="bdg" [class]="tone[e.x.status]">{{ e.x.status }}</span></div>
          <div class="abvf">
            <span class="l">Период</span>
            @if (e.x.open) {
              с {{ e.x.from }} · листок открыт
            } @else if (e.x.from === e.x.to) {
              {{ e.x.from }}
            } @else {
              {{ e.x.from }} – {{ e.x.to }}
            }
          </div>
          <div class="abvf">
            <span class="l">Продолжительность</span>{{ days() }} {{ word(days()) }}{{ e.x.open ? ' на сегодня' : '' }} · {{ count() }}
          </div>
          @switch (e.x.kind) {
            @case ('vac') {
              <div class="abvf"><span class="l">Остаток отпуска</span>{{ e.p.vacLeft }} из {{ e.p.vacTotal }} дней</div>
            }
            @case ('off') {
              <div class="abvf"><span class="l">Баланс отгулов</span>осталось {{ e.p.offLeft }} {{ word(e.p.offLeft) }}</div>
            }
          }
          @if (e.x.reason) {
            <div class="abvf"><span class="l">Причина</span>{{ e.x.reason }}</div>
          }
          @if (e.x.donorDate) {
            <div class="abvf"><span class="l">Дата сдачи крови</span>{{ e.x.donorDate }}</div>
          }
          @if (e.x.kind === 'study') {
            <div class="abvf"><span class="l">Оплата</span>{{ e.x.unpaid ? 'Неоплачиваемый' : 'Оплачиваемый' }}</div>
          }
          @if (e.x.deputy; as d) {
            <div class="abvf">
              <span class="l">Заместитель</span>
              <div class="abwho">
                <span class="av sm" [class]="av(d, deputyAv(d))" [style.background-image]="d === me ? 'url(' + mePhoto + ')' : null"></span>
                <span class="cnm"><b>{{ d }}</b><small>{{ deputyPos(d) }}</small></span>
              </div>
            </div>
          }
          @if (e.x.trip; as t) {
            @if (t.t1 || t.t2) {
              <div class="abvf"><span class="l">Время</span>{{ t.t1 || '—' }} – {{ t.t2 || '—' }}</div>
            }
            @if (t.workDays?.length) {
              <div class="abvf"><span class="l">Работа в выходной день</span>{{ dayList(t.workDays!) }}</div>
            }
            <div class="abvf"><span class="l">Место назначения</span>{{ t.city }}</div>
            @if (t.org) {
              <div class="abvf"><span class="l">Организация</span>{{ t.org }}</div>
            }
            <div class="abvf"><span class="l">Цель командировки</span>{{ t.goal }}</div>
            <div class="abvf"><span class="l">Транспорт</span>{{ t.transport }}</div>
            <div class="abvf"><span class="l">Проживание</span>{{ t.hotel ? 'Нужна гостиница' : 'Без гостиницы' }}</div>
          }
          <div class="abvf">
            <span class="l">Основание (документ)</span>{{ e.x.basis || '—' }}
            @if (e.x.files?.length) {
              <app-attach compact [files]="e.x.files!" />
            }
          </div>
          @if (e.x.note) {
            <div class="abvf"><span class="l">Комментарий</span>{{ e.x.note }}</div>
          }
          @if (e.mine && !canEdit() && e.x.kind !== 'sick' && e.x.status !== 'Использовано') {
            <p class="abhint">Изменить согласованное отсутствие можно через новую заявку или обращение к руководителю.</p>
          }
        </div>
      </app-drawer>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbsencesEntry {
  protected readonly s = inject(AbsencesState);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(NavService);
  protected edit(): void {
    this.s.entry.set(null);
    this.nav.go('reqpick', { grp: ABS_REQ_GROUP, back: 'absences' });
  }
  protected readonly kind = ABS_KIND_LABEL;
  protected readonly tone = ABS_STATUS_TONE;
  protected readonly av = avCls;
  protected readonly mePhoto = ME_PHOTO;
  /** «28.11 (сб), 29.11 (вс)» */
  protected readonly dayList = (l: string[]) => l.map((v) => v.slice(0, 5) + (absDate(v)!.getDay() ? ' (сб)' : ' (вс)')).join(', ');
  protected readonly me = ME[0];
  /** заместитель: фото и должность по ФИО */
  protected readonly deputyAv = (n: string) => PEOPLE.find((p) => p[0] === n)?.[3] ?? 0;
  protected readonly deputyPos = (n: string) => (n === ME[0] ? ME[1] : (PEOPLE.find((p) => p[0] === n)?.[1] ?? ''));
  protected readonly word = (n: number) => plural(n, 'день', 'дня', 'дней');
  protected readonly title = computed(() => {
    const x = this.s.entry()?.x;
    return x ? this.kind[x.kind] : '';
  });
  protected readonly days = computed(() => (this.s.entry() ? absCount(this.s.entry()!.x) : 0));
  protected readonly count = computed(() => (this.s.entry() ? ABS_DAY_COUNT_LABEL[ABS_DAY_COUNT[this.s.entry()!.x.kind]].toLowerCase() : ''));
  /** своя заявка, которая еще не закончилась и не отклонена, — можно изменить (та же форма заявки, поля заполнены) */
  protected readonly canEdit = computed(() => {
    const e = this.s.entry();
    return !!e && e.mine && e.x.status !== 'Отклонено' && e.x.status !== 'Использовано' && (e.x.open || absDate(e.x.to)! >= TODAY);
  });
  protected readonly canCancel = computed(() => {
    const e = this.s.entry();
    return !!e && e.mine && (e.x.status === 'Черновик' || e.x.status === 'Согласование');
  });

  protected async cancel(): Promise<void> {
    const e = this.s.entry()!;
    if (!(await this.confirm.ask({ title: 'Отменить заявку?', text: this.kind[e.x.kind] + ' **' + e.x.from + ' – ' + e.x.to + '** будет убран из графика.', ok: 'Отменить заявку', danger: true }))) return;
    this.s.store.cancel(e.x.id);
    this.s.entry.set(null);
    this.toast.show('Заявка отменена', this.kind[e.x.kind] + ' ' + e.x.from + ' – ' + e.x.to);
  }
}
