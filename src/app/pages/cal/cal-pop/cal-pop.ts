import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, output } from '@angular/core';
import { personAvatar } from '../../../data/avatar';
import { CAL_MONTHS_GEN, CAL_PEOPLE_AV, CAL_WDF } from '../../../data/cal.data';
import { CalEvent } from '../../../interface/cal';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { CalState } from '../cal.state';
import { CalTime } from '../cal-time/cal-time';
import { cParse, cWd, calIsUrl, calPlace, calRepText } from '../cal.utils';

const ME = 'Иванов Павел Сергеевич';

/**
 * Краткая информация о встрече (клик по встрече): дата и время (единый формат cal-time), повтор, место или ссылка, организатор.
 * Кнопка раскрытия (как в быстром создании) и двойной клик — полная форма встречи на просмотр (eventnew, view).
 * Приглашенный отвечает «Принять / Под вопросом / Отклонить» (отклоненная удаляется), организатор — «Изменить» и «Удалить».
 */
@Component({
  selector: 'app-cal-pop',
  imports: [Float, Icon, CalTime],
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
  protected readonly isUrl = calIsUrl;
  protected readonly av = (n: string) => personAvatar(n, CAL_PEOPLE_AV);

  protected readonly isOrg = computed(() => this.ev().org === ME);
  protected readonly place = computed(() => calPlace(this.ev()));
  protected readonly date = computed(() => {
    const d = this.day();
    return CAL_WDF[cWd(d)] + ', ' + d.getDate() + ' ' + CAL_MONTHS_GEN[d.getMonth()];
  });
  protected readonly rep = computed(() => calRepText(this.ev().rep, cParse(this.ev().d)));

  protected answer(my: string): void {
    this.closed.emit();
    this.s.answer(this.ev(), my);
  }
  protected edit(): void {
    this.closed.emit();
    this.s.edit(this.ev());
  }
  /** кнопка раскрытия — полная форма встречи на просмотр */
  protected open(): void {
    this.closed.emit();
    this.s.preview(this.ev(), this.day());
  }
  protected remove(): void {
    this.closed.emit();
    this.s.remove(this.ev());
  }
}
