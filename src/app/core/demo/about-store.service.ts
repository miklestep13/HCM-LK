import { Injectable, inject } from '@angular/core';
import { ABOUT_POSTS } from '../../data/about-articles.data';
import { LegacyService } from '../legacy/legacy.service';

/** Статьи «О компании» отдаем прототипу, чтобы клик по карточке открывал страницу новости. */
@Injectable({ providedIn: 'root' })
export class AboutStore {
  constructor() {
    inject(LegacyService).share('about', {
      get: () => ({ posts: ABOUT_POSTS }),
      set: () => undefined,
    });
  }
}
