import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { POLL_STATUS_TONE } from '../../../data/polls.data';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { PollsState, pplText } from '../../polls/polls.state';
import { PollstatsState } from '../pollstats.state';

/**
 * Шапка итогов: название, тип, статус, «Анонимный»; справа — выбор процедуры (если их несколько): «Все процедуры» или одна волна;
 * период и участников — опроса или выбранной процедуры; описание.
 */
@Component({
  selector: '[pollstats-head]',
  imports: [Icon, Select],
  template: `
    @let p = s.poll()!;
    <div class="cb">
      <div class="psht">
        <h2>{{ p.n }}</h2>
        <span class="bdg info">{{ p.kind || 'Опрос' }}</span>
        <span class="bdg" [class]="tone[p.sts]">{{ p.sts }}</span>
        @if (p.anon) {
          <span class="bdg psanon"><app-icon name="lock" />Анонимный</span>
        }
        @if (s.waves().length > 1) {
          <app-select class="pswsel" [options]="names()" allLabel="Все процедуры" placeholder="Все процедуры" valuePrefix="Процедура: " [value]="s.curWave()?.n ?? ''" (valueChange)="pick($event)" />
        }
      </div>
      <div class="psmeta">
        @if (s.curWave(); as w) {
          <span><app-icon name="calSm" />{{ w.date }}{{ w.time ? ' ' + w.time : '' }} — {{ w.end || p.end }}{{ w.end && w.endTime ? ' ' + w.endTime : '' }}</span>
          <span><app-icon name="userSm" />{{ ppl(w.total) }}</span>
        } @else {
          <span><app-icon name="calSm" />{{ p.start }} — {{ p.end }}</span>
          <span><app-icon name="userSm" />{{ ppl(p.total) }}</span>
          @if (s.waves().length > 1) {
            <span><app-icon name="refresh" />{{ s.waves().length }} {{ s.waves().length < 5 ? 'процедуры' : 'процедур' }}</span>
          }
        }
        <span><app-icon name="qSingle" />{{ polls.questions(p) }} вопр.</span>
        @if (s.test()) {
          <span><app-icon name="target" />Проходной балл {{ s.pass() }}%</span>
        }
      </div>
      @if (p.d) {
        <p class="psdesc">{{ p.d }}</p>
      }
    </div>
  `,
  host: { class: 'c pshead' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollstatsHead {
  protected readonly s = inject(PollstatsState);
  protected readonly polls = inject(PollsState);
  protected readonly tone = POLL_STATUS_TONE;
  protected readonly ppl = pplText;
  protected readonly names = computed(() => this.s.waves().map((w) => w.n));
  protected pick(n: string): void {
    this.s.wave.set(this.s.waves().find((w) => w.n === n)?.id ?? '');
  }
}
