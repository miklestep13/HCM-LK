/**
 * Страницы, уже перенесенные в Angular: ключ страницы прототипа → путь роутера.
 * Все остальные ключи открываются из старого прототипа (мост, см. core/legacy).
 * Перенесли новую страницу — добавьте ее сюда и в app.routes.ts.
 */
export const ANGULAR_PAGES: Record<string, string> = {
  home: '/home',
  company: '/company',
  org: '/org',
  people: '/people',
  news: '/news',
  comm: '/comm',
  kbhub: '/kbhub',
  map: '/map',
  bkform: '/bkform',
  shop: '/shop',
  cur: '/cur',
  about: '/about',
  mygoallist: '/mygoallist',
  mygoals: '/mygoals',
  mytasks: '/mytasks',
  cal: '/cal',
  dev: '/dev',
  growth: '/growth',
  attncard: '/attncard',
  ipr: '/ipr',
  mygoalview: '/mygoalview',
  mygoalnew: '/mygoalnew',
  course: '/course',
  program: '/program',
  player: '/player',
};
