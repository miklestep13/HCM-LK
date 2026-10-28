import { Injectable, computed, inject, signal } from '@angular/core';
import { NewsStore } from '../../core/demo/news-store.service';
import { NewsPost } from '../../interface/news';
import { DateRange, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';

export const NEWS_SORTS = ['Сначала новые', 'Сначала старые', 'По просмотрам', 'По лайкам'];
export const NEWS_AUTHORS = [
  'Федорова Юлия Сергеевна',
  'Орлов Дмитрий Викторович',
  'Титова Ольга Андреевна',
  'Лебедев Артем Сергеевич',
];
export const NEWS_TAGS = [
  'Офисы',
  'Развитие',
  'Казань',
  'Результаты',
  'Розница',
  'Обучение',
  'Наставничество',
  'HR',
  'Корпоратив',
  'Лето',
  'Юбилей',
  'Праздник',
  'Кредитование',
  'МСБ',
  'Процессы',
];

const ts = (n: NewsPost) => {
  const d = n.date.split('.');
  return +new Date(+d[2], +d[1] - 1, +d[0]) + (parseInt(n.time, 10) || 0);
};
const SORT: Record<string, (x: NewsPost, y: NewsPost) => number> = {
  'Сначала новые': (x, y) => ts(y) - ts(x),
  'Сначала старые': (x, y) => ts(x) - ts(y),
  'По просмотрам': (x, y) => y.vw - x.vw,
  'По лайкам': (x, y) => y.lk - x.lk,
};

/** Фильтры и сортировка ленты «Новости» (общие для шапки и ленты) */
@Injectable()
export class NewsState {
  private readonly store = inject(NewsStore);
  readonly q = signal('');
  readonly author = signal('');
  readonly tag = signal('');
  readonly range = signal<DateRange>(EMPTY_RANGE);
  readonly sort = signal(NEWS_SORTS[0]);

  readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(),
      a = this.author(),
      t = this.tag(),
      r = this.range();
    return this.store
      .list()
      .filter(
        (n) =>
          (!q || (n.title + ' ' + n.lead + ' ' + n.tags.join(' ')).toLowerCase().includes(q)) &&
          (!a || n.authorFio === a) &&
          (!t || n.tags.includes(t)) &&
          inRange(r, n.date),
      )
      .sort(SORT[this.sort()]);
  });
}
