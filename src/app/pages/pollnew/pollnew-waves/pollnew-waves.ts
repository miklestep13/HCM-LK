import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EVENT_TIMES } from '../../../data/events.data';
import { MemberField } from '../../../interface/member';
import { PollWave } from '../../../interface/poll';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { DateField } from '../../../shared/ui/date-field/date-field';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { Suggest } from '../../../shared/ui/suggest/suggest';
import { Audience } from '../../../widgets/audience/audience';
import { Members } from '../../../widgets/members/members';
import { PollnewState } from '../pollnew.state';

/**
 * Шаг «Процедуры опроса»: опрос назначается волнами. Каждая процедура — скрываемая карточка (шеврон слева, в шапке — дата назначения
 * и число участников, корзина справа, если процедур больше одной): название, дата и время назначения (обязательна дата), дата и время окончания;
 * «Условия отбора» (widgets/audience) и таблица участников (widgets/members: подобранные по условиям и добавленные вручную).
 * Внизу — «Добавить процедуру». В итогах опроса статистика — по всем процедурам или по одной.
 */
@Component({
  selector: '[pollnew-waves]',
  imports: [Field, DateField, Suggest, Icon, Audience, Members],
  template: `
    <div class="c pnwhint">
      <div class="cb">
        <p class="svchint">Процедура — волна опроса: в дату назначения опрос получат ее участники. Добавьте несколько процедур, чтобы сразу запланировать повторные волны или разные группы сотрудников. В итогах опроса статистика доступна по всем процедурам вместе и по каждой отдельно.</p>
      </div>
    </div>
    @for (w of s.waves(); track w.id; let i = $index) {
      @let open = s.openWave() === w.id;
      <div class="c cfold pnwave" [class.cold]="!open">
        <div class="ch" [title]="open ? 'Свернуть' : 'Развернуть'" (click)="s.openWave.set(open ? null : w.id)">
          <span class="actb cfar"><app-icon name="chevSm" /></span>
          <h3>{{ w.n || 'Процедура ' + (i + 1) }}</h3>
          <span class="pnwmeta">
            <span><app-icon name="calSm" />{{ w.date ? w.date + (w.time ? ' ' + w.time : '') : 'Дата не указана' }}{{ w.end ? ' — ' + w.end + (w.endTime ? ' ' + w.endTime : '') : '' }}</span>
            <span><app-icon name="userSm" />{{ s.waveCount(w) }}</span>
          </span>
          @if (s.waves().length > 1) {
            <button class="actb dg pnwdel" title="Удалить процедуру" (click)="$event.stopPropagation(); del(w)"><app-icon name="trashSm" /></button>
          }
        </div>
        @if (open) {
          <div class="cb">
            <div class="frm pnwfrm">
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
            <h4 class="pnwsub">Условия отбора</h4>
            <p class="svchint">Опрос получат сотрудники, которые подходят под условия. В условии можно выбрать несколько значений — подойдет любое; условия в группе работают через «и», группы — через «или».</p>
            <div app-audience [groups]="w.rules" (groupsChange)="s.setWave(w, { rules: $event })" [pool]="s.pool"></div>
            <h4 class="pnwsub">Участники <span class="pntc">{{ s.waveCount(w) }}</span></h4>
            <app-members edit="inline" view="table" [toolbar]="true" [flat]="true" [pickNew]="true" [fields]="fields" [pool]="s.pool" [people]="s.waveList().get(w.id) ?? []" (peopleChange)="s.setWaveMembers(w, $event)" [pageSize]="10"
              addTitle="Добавить участника" empty="Добавьте условия отбора или участников вручную." />
          </div>
        }
      </div>
    }
    <button class="btn raised radd pnwadd" (click)="s.addWave()"><app-icon name="plus" />Добавить процедуру</button>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollnewWaves {
  protected readonly s = inject(PollnewState);
  private readonly confirm = inject(ConfirmService);
  protected readonly fields: MemberField[] = ['av', 'name', 'pos'];
  protected readonly times = EVENT_TIMES;
  protected async del(w: PollWave): Promise<void> {
    if (await this.confirm.ask({ title: 'Удалить процедуру?', text: 'Процедура **' + w.n + '** и ее участники будут удалены из опроса.', ok: 'Удалить', danger: true })) this.s.delWave(w);
  }
}
