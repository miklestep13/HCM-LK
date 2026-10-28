import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import { Poll as PollData } from '../../interface/news';
import { COMPANY_POLL } from '../../data/news.data';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { PollState } from './poll.state';

/**
 * Опрос: вопрос и варианты. Результаты (полосы и проценты) видны только после своего голоса.
 * Хост — тело карточки (.cb). Используется в «Компания → Обзор» и в «Новостях».
 */
@Component({
  selector: 'app-poll',
  template: `
    @let p = poll();
    @let v = state.vote();
    <p class="pollq">{{ p.question }}</p>
    <div class="polls" [class.done]="v !== null">
      @for (o of p.options; track o.text; let i = $index) {
        <button class="pollo" [class.on]="v === i" (click)="choose(i)">
          <span class="pollb" [style.width.%]="v === null ? 0 : o.pct"></span>
          <span class="polll">{{ o.text }}</span>
          <span class="pollv">{{ v === null ? '' : o.pct + '%' }}</span>
        </button>
      }
    </div>
    <small class="pollf"
      >Опрос закроется {{ p.closes }} ·
      {{
        v === null
          ? 'результаты видны после голосования'
          : 'проголосовали ' + p.votedTotal + ' человек'
      }}</small
    >
  `,
  styleUrl: './poll.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-poll', style: 'display:block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Poll {
  readonly poll = input<PollData>(COMPANY_POLL);
  protected readonly state = inject(PollState);
  private readonly toast = inject(ToastService);

  protected choose(i: number): void {
    if (this.state.vote() !== null) return;
    this.state.vote.set(i);
    this.toast.show('Голос учтен', 'Спасибо! Теперь виден текущий расклад голосов.');
  }
}
