import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { CompanyBanner } from './company-banner/company-banner';
import { CompanyThanks } from './company-thanks/company-thanks';
import { CompanyCommunities } from './company-communities/company-communities';
import { CompanyBirthdays } from './company-birthdays/company-birthdays';
import { CompanyHelp } from './company-help/company-help';
import { CompanyFeed } from './company-feed/company-feed';
import { CompanyPoll } from './company-poll/company-poll';
import { CompanyCourses } from './company-courses/company-courses';
import { CompanyArticles } from './company-articles/company-articles';
import { CompanyShop } from './company-shop/company-shop';
import { Events } from '../../widgets/events/events';

/** Страница «Компания — обзор» (ключ прототипа: company). Собрана из блоков; порядок и раскладка — в company.html. */
@Component({
  selector: 'app-company',
  imports: [
    CompanyBanner,
    CompanyThanks,
    CompanyCommunities,
    CompanyBirthdays,
    CompanyHelp,
    CompanyFeed,
    Events,
    CompanyPoll,
    CompanyCourses,
    CompanyArticles,
    CompanyShop,
  ],
  templateUrl: './company.html',
  styleUrl: './company.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-company' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Company {
  protected readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
}
