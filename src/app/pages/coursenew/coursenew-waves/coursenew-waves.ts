import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EVENT_TIMES } from '../../../data/events.data';
import { EvCol } from '../../../interface/member';
import { PollWave } from '../../../interface/poll';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { Suggest } from '../../../shared/ui/suggest/suggest';
import { Audience } from '../../../widgets/audience/audience';
import { EventMembers, EvWho } from '../../../widgets/event-members/event-members';
import { CoursenewState } from '../coursenew.state';

/**
 * Шаг «Процедуры назначения»: курс назначается волнами. Каждая процедура — скрываемая карточка (шеврон слева, в шапке — дата
 * и число участников, корзина справа, если процедур больше одной): название, дата и время назначения, дата и время окончания;
 * «Условия отбора» (widgets/audience, без групп «или») и таблица участников (widgets/event-members: колонки «Сотрудник» и «Роль»).
 * Внизу — «Добавить процедуру».
 */
@Component({
  selector: '[coursenew-waves]',
  imports: [Field, DateField, Suggest, Icon, Audience, EventMembers],
  template: `
    @for (w of s.waves(); track w.id; let i = $index) {
      @let open = s.openWave() === w.id;
      <div class="c cfold cnwave" [class.cold]="!open">
        <div class="ch" [title]="open ? 'Свернуть' : 'Развернуть'" (click)="s.openWave.set(open ? null : w.id)">
          <span class="actb cfar"><app-icon name="chevSm" /></span>
          <div class="cnwhd">
            <h3>{{ w.n || 'Процедура ' + (i + 1) }}</h3>
            <span class="cnwmeta">
              <span><app-icon name="calSm" />{{ w.date ? w.date + (w.time ? ' ' + w.time : '') : 'Дата не указана' }}{{ w.end ? ' — ' + w.end + (w.endTime ? ' ' + w.endTime : '') : '' }}</span>
              <span><app-icon name="userSm" />{{ s.waveCount(w) }}</span>
            </span>
          </div>
          @if (s.waves().length > 1) {
            <button class="actb dg cnwdel" title="Удалить процедуру" (click)="$event.stopPropagation(); del(w)"><app-icon name="trashSm" /></button>
          }
        </div>
        @if (open) {
          <div class="cb">
            <div class="frm cnwfrm">
              <app-field label="Название" full [filled]="!!w.n">
                <input class="fin" placeholder="Например: Центральный офис" [value]="w.n" (input)="s.setWave(w, { n: $any($event.target).value })" />
              </app-field>
              <app-field label="Дата назначения" required [filled]="!!w.date" [error]="s.isBad('wdate') && !w.date">
                <app-date-field [value]="w.date" (valueChange)="s.setWave(w, { date: $event })" />
              </app-field>
              <app-field label="Время назначения" [filled]="!!w.time">
                <div class="entm">
                  <input #t1 class="fin" placeholder="чч:мм" [appSuggest]="times" [suggestAll]="true" [value]="w.time" (input)="s.setWave(w, { time: $any($event.target).value })" (suggestPick)="s.setWave(w, { time: $event })" />
                  <app-icon name="chevDown" (click)="t1.focus()" />
                </div>
              </app-field>
              <app-field label="Дата окончания" [filled]="!!w.end" [error]="s.isBad('wend') && !!w.end">
                <app-date-field [value]="w.end" (valueChange)="s.setWave(w, { end: $event })" />
              </app-field>
              <app-field label="Время окончания" [filled]="!!w.endTime">
                <div class="entm">
                  <input #t2 class="fin" placeholder="чч:мм" [appSuggest]="times" [suggestAll]="true" [value]="w.endTime" (input)="s.setWave(w, { endTime: $any($event.target).value })" (suggestPick)="s.setWave(w, { endTime: $event })" />
                  <app-icon name="chevDown" (click)="t2.focus()" />
                </div>
              </app-field>
            </div>
            <h4 class="cnwsub">Условия отбора</h4>
            <p class="cnwhint">Курс получат сотрудники, которые подходят под условия. В условии можно выбрать несколько значений — подойдет любое; условия работают через «и».</p>
            <div app-audience [groups]="w.rules" (groupsChange)="s.setWave(w, { rules: $event })" [pool]="s.pool" [orGroups]="false"></div>
            <div
              class="c cnwevm"
              event-members
              title="Участники"
              memberLabel="Сотрудник"
              [rows]="s.waveRows().get(w.id) ?? []"
              (rowsChange)="s.setWaveRows(w, $event)"
              [pool]="s.pool"
              [roles]="s.roles"
              [cols]="cols"
              [who]="who"
              roleMode="single"
              edit="all"
              filters
              addAt="toolbar"
            ></div>
          </div>
        }
      </div>
    }
    <button class="btn onbg radd cnwadd" (click)="s.addWave()"><app-icon name="plus" />Добавить процедуру</button>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursenewWaves {
  protected readonly s = inject(CoursenewState);
  private readonly confirm = inject(ConfirmService);
  protected readonly cols: EvCol[] = ['member', 'role'];
  protected readonly who: EvWho[] = ['av', 'pos'];
  protected readonly times = EVENT_TIMES;
  protected async del(w: PollWave): Promise<void> {
    if (await this.confirm.ask({ title: 'Удалить процедуру?', text: 'Процедура **' + w.n + '** и ее участники будут удалены из курса.', ok: 'Удалить', danger: true })) this.s.delWave(w);
  }
}
