import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { IdeasStore } from '../../../core/demo/ideas-store.service';
import { IDEA_STATUS_TONE } from '../../../data/kb.data';
import { Idea } from '../../../interface/kb';
import { Icon } from '../../../shared/ui/icon/icon';
import { KbhubIdeaNew } from '../kbhub-idea-new/kbhub-idea-new';
import { KbhubIdeaView } from '../kbhub-idea-view/kbhub-idea-view';

const key = (d: string) => d.slice(6, 10) + d.slice(3, 5) + d.slice(0, 2);

/** Блок «Банк идей»: вкладки «Мои идеи» / «Идеи коллег» (голос за идею), просмотр и «Предложить» — в сайдбарах. */
@Component({
  selector: '[kbhub-ideas]',
  imports: [Icon, KbhubIdeaNew, KbhubIdeaView],
  templateUrl: './kbhub-ideas.html',
  styleUrl: './kbhub-ideas.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbhubIdeas {
  private readonly store = inject(IdeasStore);
  protected readonly tab = signal<'my' | 'all'>('my');
  protected readonly tone = IDEA_STATUS_TONE;
  protected readonly newOpen = signal(false);
  protected readonly viewId = signal<string | null>(null);
  protected readonly list = computed(() => {
    const my = this.tab() === 'my';
    return this.store
      .list()
      .filter((i) => (my ? i.my : !i.my && i.status !== 'На модерации'))
      .sort((a, b) => (my ? (key(a.date) < key(b.date) ? 1 : -1) : b.votes - a.votes))
      .slice(0, 4);
  });
  protected readonly short = (n?: string) => (n ?? '').split(' ').slice(0, 2).join(' ');
  protected vote(i: Idea, e: Event): void {
    e.stopPropagation();
    this.store.vote(i.id);
  }
  protected created(): void { this.tab.set('my'); }
}
