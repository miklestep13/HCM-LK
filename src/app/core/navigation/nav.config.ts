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
        title: 'Справочники',
        children: [
          {
            title: 'Роли и грейды',
            page: 'ctrack',
            attrs: { ct: 'roles' },
          },
          {
            title: 'Компетенции',
            page: 'ctrack',
            attrs: { ct: 'comps' },
          },
        ],
      },
      { title: 'Роль', page: 'ctrole', hidden: true },
      { title: 'Компетенция', page: 'ctcomp', hidden: true },
      {
        title: 'Опросы',
        page: 'surveys',
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
        title: 'Задания',
        page: 'mytasks',
      },
      {
        title: 'Заявки',
        page: 'req',
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
        title: 'Календарь',
        children: [
          {
            title: 'Мой календарь',
            page: 'cal',
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
        title: 'Карьерный трек',
        page: 'career',
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
          {
            title: 'Адаптация',
            page: 'adaptation',
          },
        ],
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
    title: 'Управление персоналом',
    page: 'recruit',
    items: [
      {
        title: 'Обзор',
        page: 'recruit',
      },
      {
        title: 'Подбор персонала',
        children: [
          {
            title: 'План найма',
            page: 'recruit',
            attrs: {
              rt: 'plan',
            },
          },
          {
            title: 'Вакансии',
            page: 'recruit',
            attrs: {
              rt: 'vac',
            },
          },
          {
            title: 'Кандидаты',
            page: 'recruit',
            attrs: {
              rt: 'cand',
            },
          },
          {
            title: 'Кадровый резерв',
            page: 'reserve',
          },
        ],
      },
      {
        title: 'Аттестация',
        children: [
          {
            title: 'Адаптации',
            page: 'adapt',
          },
          {
            title: 'ИПР',
            page: 'attest',
          },
          {
            title: 'Бланки аттестации',
            page: 'attn',
          },
        ],
      },
      {
        title: 'Обучение',
        children: [
          {
            title: 'Курсы',
            page: 'learn',
            attrs: {
              et: 'cat',
            },
          },
          {
            title: 'Тренинги',
            page: 'learn',
            attrs: {
              et: 'trn',
            },
          },
          {
            title: 'Задания',
            page: 'learn',
            attrs: {
              et: 'task',
            },
          },
          {
            title: 'Проверки знаний',
            page: 'polls',
            attrs: {
              kind: 'test',
            },
          },
        ],
      },
      {
        title: 'Опросы',
        children: [
          {
            title: 'Список опросов',
            page: 'polls',
            attrs: {
              kind: 'poll',
            },
          },
          {
            title: 'Процедуры назначения',
            attrs: {
              todo: 'Процедуры назначения опросов — в разработке.',
            },
          },
          {
            title: 'Анкеты опросов',
            attrs: {
              todo: 'Анкеты опросов — в разработке.',
            },
          },
        ],
      },
      {
        title: 'Заявки',
        children: [
          {
            title: 'Все заявки',
            page: 'req',
          },
          {
            title: 'Типы заявок',
            page: 'reqtypes',
          },
          {
            title: 'Категории заявок',
            attrs: {
              todo: 'Категории заявок — в разработке.',
            },
          },
          {
            title: 'Процесс заявки',
            attrs: {
              todo: 'Процесс заявки — в разработке.',
            },
          },
        ],
      },
      {
        title: 'Целеполагание',
        children: [
          {
            title: 'Оценки',
            page: 'assess',
          },
          {
            title: 'Цели',
            page: 'goals',
          },
        ],
      },
      {
        title: 'Калибровка',
        page: 'calib',
      },
      {
        title: 'Профили должностей',
        page: 'careers',
      },
      {
        title: 'Карточка должности',
        page: 'careerhr',
        hidden: true,
      },
      {
        title: 'Матрица 9-box',
        page: 'hr9',
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
      {
        title: 'Настройки',
        page: 'settings',
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
