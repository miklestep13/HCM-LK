/* Меню шапки — как в прототипе. page — ключ страницы (data-go прототипа), attrs — доп. параметры (например, вкладка обучения). */
export interface NavItem {
  title?: string;
  page?: string;
  attrs?: Record<string, string>;
  danger?: boolean;
  value?: string;
  sep?: boolean;
  children?: NavItem[];
  /** скрыт в меню (страница остается доступной по переходам) */
  hidden?: boolean;
}
export interface NavTab {
  title: string;
  page: string;
  items: NavItem[];
}

export const NAV_TABS: NavTab[] = [
  {
    title: 'Компания',
    page: 'company',
    items: [
      {
        title: 'Обзор',
        page: 'company',
      },
      {
        title: 'Структура компании',
        page: 'org',
      },
      {
        title: 'Сотрудники',
        page: 'people',
      },
      {
        title: 'Новости',
        page: 'news',
      },
      {
        title: 'Сообщества',
        page: 'comm',
      },
      {
        title: 'База знаний',
        page: 'kb',
      },
      {
        title: 'Бронирование',
        page: 'map',
      },
      {
        title: 'Корпоративный магазин',
        page: 'shop',
      },
      {
        title: 'Кошелек',
        page: 'cur',
      },
      {
        title: 'О компании',
        page: 'about',
      },
    ],
  },
  {
    title: 'Мой кабинет',
    page: 'home',
    items: [
      {
        title: 'Обзор',
        page: 'home',
      },
      {
        title: 'Целеполагание',
        children: [
          {
            title: 'Список целей',
            page: 'mygoallist',
          },
          {
            title: 'Карта целей',
            page: 'mygoals',
          },
        ],
      },
      {
        title: 'Задания',
        page: 'mytasks',
      },
      {
        title: 'Календарь',
        children: [
          {
            title: 'Мой календарь',
            page: 'cal',
          },
          {
            title: 'Мероприятия',
            page: 'events',
          },
          {
            title: 'График отсутствий',
            page: 'absences',
          },
        ],
      },
      {
        title: 'Обучение',
        children: [
          {
            title: 'Мое обучение',
            page: 'dev',
            attrs: {
              lt: 'my',
            },
          },
          {
            title: 'Каталог обучения',
            page: 'dev',
            attrs: {
              lt: 'cat',
            },
          },
        ],
      },
      {
        title: 'Оценка 360',
        page: 'a360',
      },
      {
        title: 'Развитие',
        page: 'growth',
        hidden: true,
      },
      {
        title: 'Аттестация',
        children: [
          {
            title: 'Бланк аттестации',
            page: 'attncard',
          },
          {
            title: 'ИПР',
            page: 'ipr',
          },
        ],
      },
      {
        title: 'Заявки',
        page: 'req',
        hidden: true,
      },
      {
        title: 'Документы',
        page: 'docs',
        hidden: true,
      },
      {
        title: 'Доходы и льготы',
        page: 'benef',
      },
    ],
  },
  {
    title: 'Управление сотрудниками',
    page: 'team9',
    items: [
      {
        title: 'Матрица 9-box',
        page: 'team9',
      },
    ],
  },
  {
    title: 'Управление персоналом',
    page: 'recruit',
    items: [
      {
        title: 'Обзор',
        page: 'recruit',
      },
      {
        title: 'Подбор',
        page: 'recruit',
      },
      {
        title: 'Адаптация',
        page: 'adapt',
      },
      {
        title: 'Обучение',
        page: 'learn',
      },
      {
        title: 'Оценка',
        page: 'assess',
      },
      {
        title: 'Калибровка',
        page: 'calib',
      },
      {
        title: 'Цели',
        page: 'goals',
      },
      {
        title: 'ИПР сотрудников',
        page: 'attest',
      },
      {
        title: 'Аттестация',
        page: 'attn',
      },
      {
        title: 'Матрица 9-box',
        page: 'hr9',
      },
      {
        title: 'Кадровый резерв',
        page: 'reserve',
      },
      {
        title: 'Опросы',
        page: 'polls',
      },
      {
        title: 'Аналитика персонала',
        page: 'staff',
      },
      {
        title: 'Отчеты',
        page: 'reports',
        hidden: true,
      },
    ],
  },
];

export const ME_MENU: NavItem[] = [
  {
    title: 'Профиль',
    page: 'prof',
  },
  {
    title: 'Виджеты',
    page: 'widgets',
  },
  {
    title: 'Русский',
    attrs: {
      lang: '',
    },
    value: 'Русский',
  },
  {
    sep: true,
  },
  {
    title: 'Выйти из аккаунта',
    attrs: {
      todo: 'Выход из аккаунта — в разработке.',
    },
    danger: true,
  },
];
