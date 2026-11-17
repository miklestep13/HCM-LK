import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { REQ_CATS, REQ_PICK } from '../../data/req.data';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Tooltip } from '../../shared/ui/tooltip/tooltip';

/**
 * «Заявки → Добавить»: выбор типа. Вкладки — группы заявок, первая «Все».
 * Поиск по названию без кнопки фильтров. Карточка: иконка, название, описание в одну строку.
 * Щелчок открывает форму добавления с этим типом.
 */
@Component({
  selector: 'app-reqpick',
  imports: [PageHead, Icon, Tooltip],
  template: `
    <app-page-head title="Добавление заявки" backTo="req" backLabel="К заявкам" />
    <div class="c">
      <div class="ctabs">
        @for (t of tabs; track t) {
          <span [class.on]="tab() === t" (click)="tab.set(t)">{{ t }}</span>
        }
      </div>
      <div class="rqfind">
        <input class="tsearch" placeholder="Поиск по названию" autocomplete="off" [value]="q()" (input)="q.set($any($event.target).value)" />
      </div>
      @if (shown().length) {
        <div class="rqgrid">
          @for (x of shown(); track x.n) {
            <button class="rqp" type="button" (click)="go(x.n)">
              <span class="ic"><app-icon [name]="x.icon" /></span>
              <span class="cnt">
                <b>{{ x.n }}</b>
                <small [appTip]="x.d">{{ x.d }}</small>
              </span>
            </button>
          }
        </div>
      } @else {
        <div class="empty">
          <div class="wipi"><app-icon name="cross" /></div>
          <b>Ничего не найдено</b>
          <small>Типов заявок с&nbsp;таким названием нет. Измените поиск или&nbsp;выберите другую группу.</small>
        </div>
      }
    </div>
  `,
  styleUrl: './reqpick.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-reqpick' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reqpick {
  private readonly nav = inject(NavService);
  protected readonly tabs = ['Все', ...REQ_CATS];
  protected readonly tab = signal('Все');
  protected readonly q = signal('');
  protected readonly shown = computed(() => {
    const q = this.q().trim().toLowerCase();
    const tab = this.tab();
    return REQ_PICK.filter((x) => (tab === 'Все' || x.cat === tab) && (!q || x.n.toLowerCase().includes(q)));
  });

  protected go(type: string): void {
    this.nav.go('reqnew', { type });
  }
}
