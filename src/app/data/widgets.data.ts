import { LearnAction } from '../interface/learn';
import { COMM_POOL } from './comm.data';
import { Member } from '../interface/member';

/** Виджет в каталоге страницы «Виджеты» */
export interface WidgetInfo {
  /** ключ: папка в src/app/widgets */
  key: string;
  title: string;
  /** как подключить */
  use: string;
  desc: string;
  /** где используется */
  pages: string[];
}

/** Каталог общих виджетов (src/app/widgets): блоки, которые повторяются на нескольких страницах */
export const WIDGETS: WidgetInfo[] = [
  {
    key: 'plan-summary',
    title: 'Сводка плана',
    use: '<app-plan-summary [title] [status] [date] [progress] />',
    desc: 'Шапка плана: название, статус, срок и прогресс. Внутрь можно вставить свой блок (итоговая оценка).',
    pages: ['Мой кабинет — ИПР и карта целей', 'Бланк аттестации — ИПР'],
  },
  {
    key: 'employee-card',
    title: 'Карточка сотрудника',
    use: '<app-employee-card [card] />',
    desc: 'Фото, ФИО, должность, подразделение и статус сотрудника.',
    pages: ['Сотрудники', 'Оргструктура'],
  },
  {
    key: 'news-post',
    title: 'Новость',
    use: '<app-news-post [post] [compact] [admin] />',
    desc: 'Пост ленты: обложка, заголовок, текст, реакции; у администратора — правка и удаление.',
    pages: ['Обзор компании', 'Новости', 'Сообщество — лента'],
  },
  {
    key: 'comm-cover',
    title: 'Обложка сообщества',
    use: '<div app-comm-cover [comm] variant="card | wide | post"></div>',
    desc: 'Картинка сообщества или сгенерированная обложка по категории.',
    pages: ['Сообщества', 'Сообщество — шапка и лента'],
  },
  {
    key: 'learn-card',
    title: 'Карточка обучения',
    use: '<div learn-card [card] kind="crs | prog | ev"></div>',
    desc: 'Курс, программа или мероприятие: обложка, статус, срок, прогресс и кнопка действия.',
    pages: ['Обучение', 'Мероприятия'],
  },
  {
    key: 'learn-action',
    title: 'Кнопка действия обучения',
    use: '<div learn-action [action] (act)></div>',
    desc: 'Кнопка по статусу курса, программы или мероприятия, либо пометка «недоступно» с подсказкой.',
    pages: ['Карточка обучения', 'Курс', 'Программа'],
  },
  {
    key: 'events',
    title: 'Мероприятия',
    use: '<div app-events [events]></div>',
    desc: 'Карточка «Мероприятия» целиком: список с датой, временем и местом.',
    pages: ['Обзор компании', 'Сообщество'],
  },
  {
    key: 'poll',
    title: 'Опрос',
    use: '<app-poll [poll] />',
    desc: 'Вопрос с вариантами ответа; после голосования — результаты.',
    pages: ['Обзор компании', 'Новости'],
  },
  {
    key: 'comments',
    title: 'Комментарии',
    use: '<app-comments [items] (send) (like) (remove) />',
    desc: 'Лента комментариев с лайками и поле ввода.',
    pages: ['Магазин — товар', 'Новость'],
  },
  {
    key: 'members',
    title: 'Участники',
    use: '<app-members [people] edit="none | inline | drawer" view="cards | table | both" [fields] />',
    desc: 'Список участников: карточки или таблица; правка в строке или в сайдбаре; поля — фото, ФИО, должность, роль, вес.',
    pages: ['Сообщество', 'Мероприятие', 'Цель — форма и просмотр'],
  },
  {
    key: 'ppl-card',
    title: 'Участники формы',
    use: '<div ppl-card [(people)] [roles] [pool]></div>',
    desc: 'Карточка «Участники» со счетчиком и «Добавить»: таблица виджета «Участники» с правкой в строке.',
    pages: ['Мероприятие — форма и просмотр (админ)', 'Новое сообщество'],
  },
  {
    key: 'cover-upload',
    title: 'Загрузка обложки',
    use: '<div cover-upload [(value)]></div>',
    desc: 'Выбор картинки обложки с предпросмотром и удалением.',
    pages: ['Мероприятие — форма', 'Новое сообщество'],
  },
  {
    key: 'busy-chart',
    title: 'Участники с занятостью',
    use: '<div class="c" busy-chart [(people)] [pool] date="дд.мм.гггг" t1 t2 (move)></div>',
    desc: 'Участники и шкала дня 8–20 на всю ширину: «Добавить» (сотрудники, подразделения, команды), занятые интервалы, рамка времени встречи, предупреждение о пересечениях; группа занята весь день; клик по часу переносит встречу.',
    pages: ['Мероприятие и встреча — форма'],
  },
  {
    key: 'ipr-task-card',
    title: 'Задача ИПР',
    use: '<div ipr-task-card [task] [index] [status]></div>',
    desc: 'Задача плана развития: название, бейджи выполнения и просрочки, результат, материалы, компетенции, действия по статусу.',
    pages: ['ИПР', 'Бланк аттестации — ИПР'],
  },
  {
    key: 'ipr-comps',
    title: 'Компетенции ИПР',
    use: '<div ipr-comps [comps] [tasks]></div>',
    desc: 'Таблица развиваемых компетенций с текущим и целевым уровнем и связанными задачами.',
    pages: ['ИПР', 'Бланк аттестации — ИПР'],
  },
  {
    key: 'wallet-send',
    title: 'Перечислить валюту',
    use: 'inject(WalletSendService).open()',
    desc: 'Сайдбар перевода корпоративной валюты коллеге; стоит один раз в app.html, открывается из любой страницы.',
    pages: ['Кошелек', 'Профиль сотрудника', 'Мой кабинет'],
  },
];

/** демо для «Сводки плана» */
export const WIDGET_PLAN = { title: 'Карта целей · 2026', status: 'Утверждено', date: '01.01.2026 – 31.12.2026', progress: 64, caption: 'Выполнено 7 из 11 целей' };

/** демо для «Кнопки действия обучения» */
export const WIDGET_ACTIONS: LearnAction[] = [
  { kind: 'btn', act: 'start', label: 'Начать' },
  { kind: 'btn', act: 'cont', label: 'Продолжить обучение', raised: true },
  { kind: 'note', label: 'Доступен после курса «Основы банка»', tip: 'Сначала пройдите предыдущий курс программы', lock: true },
];

/** демо для «Занятости участников» */
export const WIDGET_BUSY = { date: '30.09.2026', t1: '14:00', t2: '15:30' };

/** демо для «Участников» */
export const WIDGET_ROLES = ['Организатор', 'Спикер', 'Участник'];
export const WIDGET_PEOPLE: Member[] = COMM_POOL.slice(0, 3).map((m, i) => ({ ...m, role: WIDGET_ROLES[i] }));
