import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, output } from '@angular/core';
import { CAL_MONTHS_GEN, CAL_MY, CAL_PEOPLE_AV, CAL_WDF } from '../../../data/cal.data';
import { personAvatar } from '../../../data/avatar';
import { CalEvent } from '../../../interface/cal';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Float } from '../../../shared/ui/float/float';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CalState } from '../cal.state';
import { cDur, cHM, cParse, cWd, calIsUrl, calPlace, calRepText } from '../cal.utils';

const ME = 'Иванов Павел Сергеевич';

/**
 * Карточка встречи (по клику на встречу): время, повтор, место или ссылка, организатор и участники, описание.
 * Приглашенный отвечает «Принять / Под вопросом / Отклонить», организатор — «Изменить» и «Удалить».
 */
@Component({
  selector: 'app-cal-pop',
  imports: [Float, NgTemplateOutlet],
  templateUrl: './cal-pop.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalPop {
  readonly ev = input.required<CalEvent>();
  readonly day = input.required<Date>();
  readonly anchor = input.required<HTMLElement>();
  readonly closed = output<void>();
  private readonly s = inject(CalState);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly av = (n: string) => personAvatar(n, CAL_PEOPLE_AV);
  protected readonly isUrl = calIsUrl;

  protected readonly isOrg = computed(() => this.ev().org === ME);
  protected readonly others = computed(() => this.ev().ppl.filter((n) => n !== this.ev().org));
  protected readonly place = computed(() => calPlace(this.ev()));
  protected readonly when = computed(() => {
    const e = this.ev(), d = this.day();
    return CAL_WDF[cWd(d)] + ', ' + d.getDate() + ' ' + CAL_MONTHS_GEN[d.getMonth()] + (e.all ? ' · весь день' : ' · ' + cHM(e.s) + '–' + cHM(e.e));
  });
  protected readonly dur = computed(() => (this.ev().all ? '' : cDur(this.ev().e - this.ev().s)));
  protected readonly rep = computed(() => calRepText(this.ev().rep, cParse(this.ev().d)));

  protected answer(my: string): void {
    const e = this.ev();
    this.s.update(e.id, { my });
    this.closed.emit();
    this.toast.show('Ответ отправлен', '«' + e.t + '»: ' + CAL_MY[my].toLowerCase() + '. Организатор получит уведомление.' + (my === 'no' ? ' Встреча скрыта из календаря — ее можно показать фильтром «Отклонено».' : ''));
  }
  protected edit(): void {
    this.closed.emit();
    this.s.form.set({ ev: this.ev() });
  }
  protected async remove(): Promise<void> {
    const e = this.ev();
    this.closed.emit();
    const ok = await this.confirm.ask({
      title: e.rep ? 'Удалить серию встреч?' : 'Удалить встречу?',
      text: (e.rep ? 'Будут удалены все повторения «' + e.t + '». ' : '«' + e.t + '» пропадет из календаря. ') + 'Участники получат уведомление об отмене.',
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.s.events.update((l) => l.filter((x) => x.id !== e.id));
    this.toast.show('Готово', 'Встреча «' + e.t + '» удалена.');
  }
}
