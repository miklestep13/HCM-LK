/* Демо-данные главной «Мой кабинет → Обзор» — перенесены из прототипа.
   Меняйте тексты и значения здесь: блоки берут данные отсюда. */
import { Profile, Employee } from '../interface/employee';
import { ListBlock } from '../interface/task';
import { LearningItem } from '../interface/learning';

export const ME: { name: string; role: string; photo: string } = {
  name: 'Иванов Павел Сергеевич',
  role: 'Кредитный специалист',
  photo: 'assets/img/people/ivanov.webp',
};

export const PROFILE: Profile = {
  name: 'Иванов Павел Сергеевич',
  role: 'Кредитный специалист',
  photo: 'assets/img/people/ivanov.webp',
  rows: [
    {
      label: 'Департамент',
      value: 'Департамент розничного бизнеса',
    },
    {
      label: 'Город офиса',
      value: 'Санкт-Петербург',
    },
    {
      label: 'Телефон',
      value: '+7 910 111 77 44',
    },
    {
      label: 'Почта',
      value: 'pivanov@meridianbank.ru',
      link: true,
    },
    {
      label: 'Руководитель',
      value: 'Федорова Ю. С.',
    },
    {
      label: 'Стаж в компании',
      value: '6 лет 7 мес.',
    },
  ],
};

export const DEVELOPMENT = {
  quarters: [
    {
      period: 'I кв. 2026',
      tip: 'I кв. 2026|Результативность: Выше ожиданий|Ценности: Выше ожиданий',
      grades: [
        {
          text: 'B',
          tone: 'info',
        },
        {
          text: 'B',
          tone: 'info',
        },
      ],
    },
    {
      period: 'II кв. 2026',
      tip: 'II кв. 2026|Результативность: Соответствует ожиданиям|Ценности: Выше ожиданий',
      grades: [
        {
          text: 'C',
          tone: '',
        },
        {
          text: 'B',
          tone: 'info',
        },
      ],
    },
  ],
  nineBox: {
    cell: 1,
    tip: 'Позиция · II кв. 2026|Результат: C — соответствует ожиданиям|Ценности: B — выше ожиданий',
  },
  r360: {
    value: '3,0',
    tip: 'Оценка 360° · I полугодие 2026|3,0 из 5 · 14 респондентов|+0,2 к прошлому циклу',
  },
};

export const AWARDS: { title: string; image: string; count: number; tip: string }[] = [
  {
    title: 'Командная работа',
    image: 'assets/img/awards/award-1.svg',
    count: 150,
    tip: 'Командная работа · 150 раз',
  },
  {
    title: 'Клиентоориентированность',
    image: 'assets/img/awards/award-2.svg',
    count: 98,
    tip: 'Клиентоориентированность · 98 раз',
  },
  {
    title: 'Экспертиза',
    image: 'assets/img/awards/award-3.svg',
    count: 67,
    tip: 'Экспертиза · 67 раз',
  },
  {
    title: 'Наставничество',
    image: 'assets/img/awards/award-4.svg',
    count: 54,
    tip: 'Наставничество · 54 раза',
  },
  {
    title: 'Ответственность',
    image: 'assets/img/awards/award-5.svg',
    count: 41,
    tip: 'Ответственность · 41 раз',
  },
];

export const VACATION = {
  used: 21,
  total: 34,
  percent: 62,
  tip: '34 дня: 28 дней за 2026 год и 6 дней, перенесенных с прошлого периода. Перенесенные дни нужно использовать до 31.12.2026.',
  available: '13 дней',
  nearest: '12.10.2026 – 18.10.2026',
  nearestNote: '7 дней, из них авансовых 0',
};

export const TIME_OFF = {
  accrued: '1',
  accruedUnit: 'день',
  nearest: '—',
};

export const TASKS: ListBlock = {
  total: 12,
  items: [
    {
      id: 't13',
      title: 'Проверить заявку на реструктуризацию',
      meta: [
        {
          text: 'до 05.10.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'Эскалация',
        tone: 'dg',
      },
    },
    {
      id: 't1',
      title: 'Пройти оценку 360',
      meta: [
        {
          text: 'до 10.10.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'В обработке',
        tone: 'warn',
      },
    },
    {
      id: 't2',
      title: 'Заполнить самооценку по карте целей',
      meta: [
        {
          text: 'до 19.09.2026',
          icon: 'calendar',
          danger: true,
        },
      ],
      badge: {
        text: 'В обработке',
        tone: 'warn',
      },
    },
    {
      id: 't16',
      title: 'Подтвердить ознакомление с регламентом кредитования',
      meta: [
        {
          text: 'до 13.10.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'В обработке',
        tone: 'warn',
      },
    },
    {
      id: 't9',
      title: 'Ознакомиться с политикой информационной безопасности',
      meta: [
        {
          text: 'до 04.10.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'В обработке',
        tone: 'warn',
      },
    },
    {
      id: 't5',
      title: 'Подписать приказ об отпуске',
      meta: [
        {
          text: 'до 04.10.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'Визирование',
        tone: 'warn',
      },
    },
    {
      id: 't4',
      title: 'Перезвонить клиентам по одобренным заявкам',
      meta: [
        {
          text: 'до 18.09.2026',
          icon: 'calendar',
          danger: true,
        },
      ],
      badge: {
        text: 'Делегирование',
        tone: 'info',
      },
    },
  ],
};

export const REQUESTS: ListBlock = {
  total: 8,
  items: [
    {
      id: 'REQ-4830',
      title: 'Приказ об отпуске',
      meta: [
        {
          text: '12.05.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'Зарегистрирована',
        tone: 'info',
      },
    },
    {
      id: 'REQ-4799',
      title: 'Доступ к АБС «Меридиан»',
      meta: [
        {
          text: '05.05.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'В работе',
        tone: 'warn',
      },
    },
    {
      id: 'REQ-4821',
      title: 'Заявление на отпуск 25–31.12',
      meta: [
        {
          text: '11.05.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'Зарегистрирована',
        tone: 'info',
      },
    },
    {
      id: 'REQ-4812',
      title: 'Справка 2-НДФЛ за 2025',
      meta: [
        {
          text: '09.05.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'В работе',
        tone: 'warn',
      },
    },
    {
      id: 'REQ-4805',
      title: 'Заказ канцелярии',
      meta: [
        {
          text: '07.05.2026',
          icon: 'calendar',
        },
      ],
      badge: {
        text: 'В работе',
        tone: 'warn',
      },
    },
  ],
};


export const COLLEAGUES: Employee[] = [
  {
    name: 'Федорова Юлия Сергеевна',
    role: 'Директор департамента розничного бизнеса',
    photo: 'assets/img/people/colleague-1.webp',
    tags: [
      {
        text: 'Руководитель',
        tone: '',
      },
    ],
  },
  {
    name: 'Гусева Нина Павловна',
    role: 'Менеджер продукта',
    photo: 'assets/img/people/colleague-2.webp',
    tags: [],
  },
  {
    name: 'Крылов Михаил Петрович',
    role: 'Специалист по кредитованию',
    photo: 'assets/img/people/colleague-3.webp',
    tags: [],
  },
  {
    name: 'Кузьмин Петр Иванович',
    role: 'Ведущий специалист по кредитованию',
    photo: 'assets/img/people/colleague-4.webp',
    tags: [
      {
        text: 'День рождения сегодня',
        tone: 'info',
      },
    ],
  },
  {
    name: 'Лебедев Артем Сергеевич',
    role: 'Старший специалист по кредитованию',
    photo: 'assets/img/people/colleague-5.webp',
    tags: [
      {
        text: 'Отпуск с 28.12',
        tone: '',
      },
    ],
  },
  {
    name: 'Белова Мария Андреевна',
    role: 'Методолог',
    photo: 'assets/img/people/colleague-6.webp',
    tags: [],
  },
  {
    name: 'Мельник Артур Русланович',
    role: 'Специалист казначейских операций',
    photo: 'assets/img/people/colleague-4.webp',
    tags: [
      {
        text: 'Командировка до 18.10',
        tone: '',
      },
    ],
  },
  {
    name: 'Павлова Елена Викторовна',
    role: 'Финансовый аналитик',
    photo: 'assets/img/people/colleague-8.webp',
    tags: [],
  },
];
