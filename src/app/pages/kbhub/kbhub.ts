import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { KbhubArticles } from './kbhub-articles/kbhub-articles';
import { KbhubFaq } from './kbhub-faq/kbhub-faq';
import { KbhubIdeas } from './kbhub-ideas/kbhub-ideas';

/** Страница «База знаний» (ключ прототипа: kbhub): «Статьи» и «Банк идей» 50/50, ниже «Часто задаваемые вопросы». */
@Component({
  selector: 'app-kbhub',
  imports: [PageHead, KbhubArticles, KbhubIdeas, KbhubFaq],
  template: `
    <app-page-head title="База знаний" backTo="company" />
    <div class="hubg">
      <div class="c" kbhub-articles></div>
      <div class="c hubic" kbhub-ideas></div>
    </div>
    <div class="c mt" kbhub-faq></div>
  `,
  styleUrl: './kbhub.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-kbhub' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Kbhub {}
