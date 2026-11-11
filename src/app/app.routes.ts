import { Routes } from '@angular/router';

/**
 * Маршруты. Перенесенные страницы — свои компоненты (ленивая загрузка),
 * остальные открываются из старого прототипа через /legacy/:page.
 * Ключи страниц для меню — в core/navigation/pages.ts.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Мой кабинет · Q.HCM',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'company',
    title: 'Компания · Q.HCM',
    loadComponent: () => import('./pages/company/company').then((m) => m.Company),
  },
  {
    path: 'org',
    title: 'Структура компании · Q.HCM',
    loadComponent: () => import('./pages/org/org').then((m) => m.Org),
  },
  {
    path: 'docs',
    title: 'Мои документы · Q.HCM',
    loadComponent: () => import('./pages/docs/docs').then((m) => m.Docs),
  },
  {
    path: 'people',
    title: 'Сотрудники · Q.HCM',
    loadComponent: () => import('./pages/people/people').then((m) => m.People),
  },
  {
    path: 'news',
    title: 'Новости · Q.HCM',
    loadComponent: () => import('./pages/news/news').then((m) => m.News),
  },
  {
    path: 'comm',
    title: 'Сообщества · Q.HCM',
    loadComponent: () => import('./pages/comm/comm').then((m) => m.Comm),
  },
  {
    path: 'commone',
    title: 'Сообщество · Q.HCM',
    loadComponent: () => import('./pages/commone/commone').then((m) => m.Commone),
  },
  {
    path: 'kbhub',
    title: 'База знаний · Q.HCM',
    loadComponent: () => import('./pages/kbhub/kbhub').then((m) => m.Kbhub),
  },
  {
    path: 'map',
    title: 'Бронирование · Q.HCM',
    loadComponent: () => import('./pages/map/map').then((m) => m.Map),
  },
  {
    path: 'bkform',
    title: 'Бронирование · Q.HCM',
    loadComponent: () => import('./pages/bkform/bkform').then((m) => m.Bkform),
  },
  {
    path: 'shop',
    title: 'Корпоративный магазин · Q.HCM',
    loadComponent: () => import('./pages/shop/shop').then((m) => m.Shop),
  },
  {
    path: 'shop/prod/:id',
    title: 'Товар · Q.HCM',
    loadComponent: () => import('./pages/shop/shop-product/shop-product').then((m) => m.ShopProduct),
  },
  {
    path: 'shop/cart',
    title: 'Корзина · Q.HCM',
    loadComponent: () => import('./pages/shop/shop-cart/shop-cart').then((m) => m.ShopCart),
  },
  {
    path: 'shop/order/:k',
    title: 'Заказ · Q.HCM',
    loadComponent: () => import('./pages/shop/shop-order/shop-order').then((m) => m.ShopOrder),
  },
  {
    path: 'cur',
    title: 'Кошелек · Q.HCM',
    loadComponent: () => import('./pages/cur/cur').then((m) => m.Cur),
  },
  {
    path: 'about',
    title: 'О компании · Q.HCM',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'mygoallist',
    title: 'Список целей · Q.HCM',
    loadComponent: () => import('./pages/mygoallist/mygoallist').then((m) => m.Mygoallist),
  },
  {
    path: 'mygoals',
    title: 'Карта целей · Q.HCM',
    loadComponent: () => import('./pages/mygoals/mygoals').then((m) => m.Mygoals),
  },
  {
    path: 'req',
    title: 'Заявки · Q.HCM',
    loadComponent: () => import('./pages/req/req').then((m) => m.ReqPage),
  },
  {
    path: 'reqnew',
    title: 'Новая заявка · Q.HCM',
    loadComponent: () => import('./pages/reqnew/reqnew').then((m) => m.Reqnew),
  },
  {
    path: 'polls',
    title: 'Опросы · Q.HCM',
    loadComponent: () => import('./pages/polls/polls').then((m) => m.Polls),
  },
  {
    path: 'pollstats',
    title: 'Итоги опроса · Q.HCM',
    loadComponent: () => import('./pages/pollstats/pollstats').then((m) => m.Pollstats),
  },
  {
    path: 'pollnew',
    title: 'Опрос · Q.HCM',
    loadComponent: () => import('./pages/pollnew/pollnew').then((m) => m.Pollnew),
  },
  {
    path: 'coursenew',
    title: 'Добавление курса · Q.HCM',
    loadComponent: () => import('./pages/coursenew/coursenew').then((m) => m.Coursenew),
  },
  {
    path: 'survey',
    title: 'Опрос · Q.HCM',
    loadComponent: () => import('./pages/survey/survey').then((m) => m.Survey),
  },
  {
    path: 'surveys',
    title: 'Опросы · Q.HCM',
    loadComponent: () => import('./pages/surveys/surveys').then((m) => m.Surveys),
  },
  {
    path: 'mytasks',
    title: 'Задания · Q.HCM',
    loadComponent: () => import('./pages/mytasks/mytasks').then((m) => m.Mytasks),
  },
  {
    path: 'cal',
    title: 'Мой календарь · Q.HCM',
    loadComponent: () => import('./pages/cal/cal').then((m) => m.Cal),
  },
  {
    path: 'dev',
    title: 'Обучение · Q.HCM',
    loadComponent: () => import('./pages/dev/dev').then((m) => m.Dev),
  },
  {
    path: 'events',
    title: 'Мероприятия · Q.HCM',
    loadComponent: () => import('./pages/events/events').then((m) => m.Events),
  },
  {
    path: 'commnew',
    title: 'Сообщество · Q.HCM',
    loadComponent: () => import('./pages/commnew/commnew').then((m) => m.Commnew),
  },
  {
    path: 'absences',
    title: 'График отсутствий · Q.HCM',
    loadComponent: () => import('./pages/absences/absences').then((m) => m.Absences),
  },
  {
    path: 'widgets',
    title: 'Виджеты · Q.HCM',
    loadComponent: () => import('./pages/widgets/widgets').then((m) => m.Widgets),
  },
  {
    path: 'eventview',
    title: 'Мероприятие · Q.HCM',
    loadComponent: () => import('./pages/eventview/eventview').then((m) => m.Eventview),
  },
  {
    path: 'eventnew',
    title: 'Мероприятие · Q.HCM',
    loadComponent: () => import('./pages/eventnew/eventnew').then((m) => m.Eventnew),
  },
  {
    path: 'a360',
    title: 'Оценка 360 · Q.HCM',
    loadComponent: () => import('./pages/a360/a360').then((m) => m.A360),
  },
  {
    path: 'growth',
    title: 'Развитие · Q.HCM',
    loadComponent: () => import('./pages/growth/growth').then((m) => m.Growth),
  },
  {
    path: 'attncard',
    title: 'Аттестация · Q.HCM',
    loadComponent: () => import('./pages/attncard/attncard').then((m) => m.Attncard),
  },
  {
    path: 'ipr',
    title: 'ИПР · Q.HCM',
    loadComponent: () => import('./pages/ipr/ipr').then((m) => m.Ipr),
  },
  {
    path: 'mygoalview',
    title: 'Просмотр цели · Q.HCM',
    loadComponent: () => import('./pages/mygoalview/mygoalview').then((m) => m.Mygoalview),
  },
  {
    path: 'mygoalnew',
    title: 'Цель · Q.HCM',
    loadComponent: () => import('./pages/mygoalnew/mygoalnew').then((m) => m.Mygoalnew),
  },
  {
    path: 'course',
    title: 'Курс · Q.HCM',
    loadComponent: () => import('./pages/course/course').then((m) => m.Course),
  },
  {
    path: 'program',
    title: 'Программа · Q.HCM',
    loadComponent: () => import('./pages/program/program').then((m) => m.Program),
  },
  {
    path: 'player',
    title: 'Курс · Q.HCM',
    loadComponent: () => import('./pages/player/player').then((m) => m.Player),
  },
  {
    path: 'legacy/:page',
    title: 'Q.HCM',
    loadComponent: () => import('./pages/legacy-page/legacy-page').then((m) => m.LegacyPage),
  },
  { path: '**', redirectTo: 'home' },
];
