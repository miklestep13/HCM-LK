import { BldBlock, BldBlockType, BldKind, BldKindConf, BldMaterial, BldModKind, BldModTemplate, BldModule, BldPaletteItem, BldTaskSet, BldTestSet } from '../interface/builder';
import { PEOPLE } from './people.data';
import { PollQType, PollSection } from '../interface/poll';
import { POLLS, POLL_QICON, POLL_QNAME, POLL_QTYPES, POLL_TEMPLATES, newPollQuestion } from './polls.data';

/** Конструктор учебных материалов (widgets/builder): виды материалов, палитра блоков, примеры */

let seq = 0;
export const bldId = (p = 'b'): string => p + Date.now().toString(36) + (seq++).toString(36);

/** название и иконка блока (вопрос — по типу вопроса) */
export const BLD_BLOCK: Record<Exclude<BldBlockType, 'q'>, { name: string; icon: string; hint: string }> = {
  text: { name: 'Текст', icon: 'mText', hint: 'Абзацы, списки, выделенная врезка' },
  video: { name: 'Видео', icon: 'mMedia', hint: 'Файл или ссылка, длительность' },
  pdf: { name: 'Документ', icon: 'mDoc', hint: 'PDF или презентация для просмотра' },
  files: { name: 'Файлы для скачивания', icon: 'clip', hint: 'Шаблоны, регламенты, раздатка' },
  image: { name: 'Изображение', icon: 'fileImg', hint: 'Схема или иллюстрация с подписью' },
  kb: { name: 'Статья из базы знаний', icon: 'mKb', hint: 'Карточка статьи со ссылкой на нее' },
  task: { name: 'Задание', icon: 'mTask', hint: 'Ответ файлом или текстом, проверяет автор' },
  course: { name: 'Курс из каталога', icon: 'course', hint: 'Курс как шаг программы' },
};
export function bldBlockName(b: BldBlock): string {
  return b.k === 'q' ? POLL_QNAME[b.q!.t] : BLD_BLOCK[b.k].name;
}
/** подпись блока в структуре: текст вопроса, начало текста, название файла или видео */
export function bldBlockLabel(b: BldBlock): string {
  if (b.k === 'q') return b.q!.n;
  if (b.k === 'text' || b.k === 'task') return (b.html || '').replace(/<\/(p|li|div)>|<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
  return b.title || b.files?.[0]?.name || '';
}
export function bldBlockIcon(b: BldBlock): string {
  return b.k === 'q' ? POLL_QICON[b.q!.t] : BLD_BLOCK[b.k].icon;
}

const C = (k: Exclude<BldBlockType, 'q'>): BldPaletteItem => ({ k, ...BLD_BLOCK[k] });
const Q = (qt: PollQType): BldPaletteItem => ({ k: 'q', qt, name: POLL_QNAME[qt], icon: POLL_QICON[qt] });
const CONTENT = [C('text'), C('video'), C('pdf'), C('files'), C('image'), C('kb')];
/** типы вопросов с верным ответом (тест, проверка знаний в курсе) */
export const BLD_CHECKABLE: PollQType[] = ['single', 'multi', 'yesno', 'drop'];

export const BLD_KINDS: Record<BldKind, BldKindConf> = {
  course: { name: 'Курс', gen: 'курса', mod: 'Модуль', levels: 3, correct: true, groups: [
    { t: 'Контент', items: CONTENT },
    { t: 'Практика', items: [C('task')] },
    { t: 'Вопросы', items: POLL_QTYPES.map(Q) },
  ] },
  test: { name: 'Тест', gen: 'теста', mod: 'Модуль', levels: 2, one: true, correct: true, groups: [
    { t: 'Вопросы', items: ['single', 'multi', 'yesno', 'drop', 'rank', 'matrix', 'short', 'long', 'rating'].map((t) => Q(t as PollQType)) },
    { t: 'Контент', items: [C('text'), C('image')] },
  ] },
  poll: { name: 'Опрос', gen: 'опроса', mod: 'Модуль', levels: 2, one: true, groups: [
    { t: 'Вопросы', items: POLL_QTYPES.map(Q) },
    { t: 'Контент', items: [C('text'), C('image')] },
  ] },
  task: { name: 'Задание', gen: 'задания', mod: 'Шаг', levels: 2, groups: [
    { t: 'Задание', items: [C('task')] },
    { t: 'Контент', items: CONTENT },
  ] },
  program: { name: 'Программа', gen: 'программы', mod: 'Этап', levels: 2, groups: [
    { t: 'Обучение', items: [C('course'), C('task')] },
    { t: 'Контент', items: [C('text'), C('video'), C('files')] },
  ] },
};
export const BLD_KIND_LIST: BldKind[] = ['course', 'test', 'poll', 'task', 'program'];

/** типы вопросов модуля «Тестирование» — с верным ответом или оценкой */
const TEST_QTYPES: PollQType[] = ['single', 'multi', 'yesno', 'drop', 'rank', 'matrix', 'short', 'long'];

/**
 * Виды модулей курса: название, иконка, подсказка в меню «Добавить модуль» и палитра блоков —
 * что можно добавить в модуль этого вида.
 */
export const BLD_MOD_KINDS: Record<BldModKind, { name: string; icon: string; hint: string; groups: { t: string; items: BldPaletteItem[] }[] }> = {
  mod: { name: 'Модуль', icon: 'mText', hint: 'Учебный контент: текст, видео, документы, файлы', groups: [{ t: 'Контент', items: CONTENT }] },
  task: { name: 'Задание', icon: 'mTask', hint: 'Практическое задание, проверяет куратор', groups: [{ t: 'Задание', items: [C('task')] }] },
  test: { name: 'Тестирование', icon: 'mQuiz', hint: 'Контент и вопросы с верными ответами', groups: [
    { t: 'Контент', items: CONTENT },
    { t: 'Вопросы', items: TEST_QTYPES.map(Q) },
  ] },
  poll: { name: 'Опрос', icon: 'poll', hint: 'Контент и вопросы для обратной связи', groups: [
    { t: 'Контент', items: CONTENT },
    { t: 'Вопросы', items: POLL_QTYPES.map(Q) },
  ] },
};
export const BLD_MOD_KIND_LIST: BldModKind[] = ['mod', 'task', 'test', 'poll'];
/** вид оценки тестирования */
export const BLD_SCORES = ['Проценты', 'Баллы'];
/** алгоритм определения куратора задания */
export const BLD_CUR_ALGS = ['Вручную', 'Руководитель сотрудника', 'Автор курса'];
/** кураторы — сотрудники банка */
export const BLD_CURATORS = PEOPLE.map((p) => p[0]);
export const newTestSet = (): BldTestSet => ({ score: 'Проценты', pass: 100, tries: null, time: '', allSeen: false, report: true, reportAns: true });
export const newTaskSet = (): BldTaskSet => ({ alg: 'Вручную', cur: '', pts: 1, reject: false });

/** картинки примеров (обложки видео и курсов, изображение в примере курса) */
export const BLD_IMAGES = ['assets/img/courses/crs-1.webp', 'assets/img/courses/crs-2.webp', 'assets/img/courses/crs-3.webp', 'assets/img/courses/prog-3.webp'];

/** новый блок с настройками по умолчанию */
export function newBlock(k: BldBlockType, qt?: PollQType): BldBlock {
  const b: BldBlock = { id: bldId(), k };
  if (k === 'q') b.q = newPollQuestion(qt || 'single');
  if (k === 'text') Object.assign(b, { html: '', view: 'plain' });
  if (k === 'video') Object.assign(b, { title: '', dur: '', url: '', files: [] });
  if (k === 'pdf') Object.assign(b, { title: '', files: [] });
  if (k === 'files') Object.assign(b, { title: 'Материалы для скачивания', files: [] });
  if (k === 'image') Object.assign(b, { img: '', title: '', files: [] });
  if (k === 'task') Object.assign(b, { html: '', ans: 'file' });
  if (k === 'kb') b.art = '';
  if (k === 'course') Object.assign(b, { crs: '', req: true });
  return b;
}
export function newModule(n: number, unit = 'Модуль'): BldModule {
  return { id: bldId('m'), t: unit + ' ' + n, d: '', blocks: [] };
}
/** новый модуль курса вида mk: название по виду, настройки тестирования и задания — по умолчанию; у задания сразу блок «Задание» */
export function newKindModule(mk: BldModKind, n: number): BldModule {
  const m: BldModule = { ...newModule(n, BLD_MOD_KINDS[mk].name), mk };
  if (mk === 'test') m.test = newTestSet();
  if (mk === 'task') {
    m.task = newTaskSet();
    m.blocks.push(newBlock('task'));
  }
  return m;
}
/** модуль из шаблона: копия блоков с новыми id и настройки шаблона */
export function moduleFromTemplate(t: BldModTemplate): BldModule {
  const c: BldModTemplate = JSON.parse(JSON.stringify(t));
  c.blocks.forEach((b) => (b.id = bldId()));
  return { id: bldId('m'), t: c.t, d: c.d, blocks: c.blocks, mk: c.mk, test: c.test, task: c.task };
}
/** пустой материал: курс — раздел с модулем, остальные (два уровня) — один модуль */
export function newMaterial(kind: BldKind, t = ''): BldMaterial {
  const flat = BLD_KINDS[kind].levels === 2;
  return { kind, t, flat, paging: 'module', order: 'free', pass: kind === 'test' ? 80 : undefined,
    secs: [{ id: bldId('s'), t: flat ? '' : 'Раздел 1', mods: [newModule(1, BLD_KINDS[kind].mod)] }] };
}

// ——— опрос и тест: разделы опроса (PollSection) ↔ модули конструктора ———
/** разделы опроса → материал без разделов: раздел опроса — модуль, вопрос — блок */
export function pollToMaterial(sec: PollSection[], kind: 'poll' | 'test', t = ''): BldMaterial {
  return { kind, t, flat: true, paging: 'module', pass: kind === 'test' ? 80 : undefined,
    secs: [{ id: bldId('s'), t: '', mods: sec.map((s) => ({ id: bldId('m'), t: s.name, d: s.d || '', blocks: s.q.map((q) => ({ id: bldId(), k: 'q', q })) })) }] };
}
/** материал → разделы опроса (текстовые блоки в опросе не сохраняются) */
export function materialToPoll(m: BldMaterial): PollSection[] {
  return m.secs.flatMap((s) => s.mods).map((md) => ({ name: md.t, d: md.d, q: md.blocks.filter((b) => b.q).map((b) => b.q!) }));
}

// ——— примеры для каталога виджетов и формы курса ———
const T = (html: string, view: 'plain' | 'note' = 'plain'): BldBlock => ({ id: bldId(), k: 'text', html, view });
const V = (title: string, dur: string): BldBlock => ({ id: bldId(), k: 'video', title, dur, url: '', files: [] });
/** дата загрузки файлов в примерах */
const FD = '01.09.2026';
const D = (title: string, name: string, size: number): BldBlock => ({ id: bldId(), k: 'pdf', title, files: [{ id: bldId('f'), name, size, st: 'ok', date: FD }] });
const F = (title: string, files: [string, number][]): BldBlock => ({ id: bldId(), k: 'files', title, files: files.map(([name, size]) => ({ id: bldId('f'), name, size, st: 'ok', date: FD })) });
const QB = (t: PollQType, n: string, x: object = {}): BldBlock => ({ id: bldId(), k: 'q', q: newPollQuestion(t, { n, ...x }) });
const M = (t: string, d: string, blocks: BldBlock[]): BldModule => ({ id: bldId('m'), t, d, blocks });

/** пример курса «Бизнес-анализ в банке» */
export function bldDemoCourse(): BldMaterial {
  return { kind: 'course', t: 'Бизнес-анализ в банке: от запроса до требований', flat: false, paging: 'module', order: 'seq', secs: [
    { id: bldId('s'), t: 'Принципы работы и ответственность аналитика', mods: [
      M('Роль аналитика в банке', 'Чем аналитик отличается от разработчика и владельца продукта и за какие решения отвечает.', [
        T('<p>Бизнес-аналитик — связующее звено между заказчиком и командой разработки. Он отвечает не за код, а за то, <b>чтобы команда сделала то, что действительно нужно бизнесу</b>.</p><ul><li>выявляет и формализует потребности;</li><li>согласует требования с заказчиком и ИТ;</li><li>проверяет, что результат решает исходную задачу.</li></ul>'),
        V('Кто такой бизнес-аналитик: разбор на примере кредитного конвейера', '12 мин'),
        T('<p><b>Важно.</b> Аналитик не принимает решение за заказчика, но обязан показать последствия каждого варианта.</p>', 'note'),
      ]),
      { ...M('Зоны ответственности', 'RACI для типового проекта изменения банковского продукта.', [
        D('Матрица RACI проекта изменения продукта', 'RACI_изменение_продукта.pdf', 412_000),
        QB('single', 'Кто утверждает бизнес-требования к изменению продукта?', { opts: ['Бизнес-аналитик', 'Владелец продукта', 'Архитектор', 'Тестировщик'], ok: [1] }),
      ]), mk: 'test', test: { ...newTestSet(), pass: 80, tries: 3 } },
    ] },
    { id: bldId('s'), t: 'Работа с требованиями', mods: [
      M('Сбор требований', 'Интервью, наблюдение, анализ документов: когда какой метод.', [
        V('Интервью с заказчиком: подготовка и вопросы', '18 мин'),
        F('Шаблоны для интервью', [['Чек-лист интервью.docx', 48_000], ['Шаблон протокола встречи.docx', 36_000]]),
      ]),
      { ...M('Практика: описание требования', 'Опишите требование к доработке и приложите файл.', [
        { id: bldId(), k: 'task', html: 'Опишите требование к доработке «Досрочное погашение в мобильном приложении» по шаблону: контекст, пользователь, сценарий, критерии приемки.', ans: 'both' },
      ]), mk: 'task', task: { ...newTaskSet(), cur: PEOPLE[0][0], pts: 10 } },
    ] },
  ] };
}
/** пример теста — проверка знаний по ИБ (опрос № 8) */
export function bldDemoTest(): BldMaterial {
  return pollToMaterial(JSON.parse(JSON.stringify(POLLS.find((p) => p.idx === 8)!.sec)), 'test', 'Проверка знаний по информационной безопасности');
}
/** пример опроса — вовлеченность (шаблон) */
export function bldDemoPoll(): BldMaterial {
  return pollToMaterial(JSON.parse(JSON.stringify(POLL_TEMPLATES[1].sec)), 'poll', POLL_TEMPLATES[1].n);
}
/** пример задания */
export function bldDemoTask(): BldMaterial {
  return { kind: 'task', t: 'Разбор кредитной заявки', flat: true, paging: 'module', secs: [{ id: bldId('s'), t: '', mods: [
    M('Исходные данные', 'Изучите заявку и выписку клиента.', [
      T('<p>Клиент — ИП, розничная торговля, запрашивает кредит на пополнение оборотных средств 3 млн ₽ на 24 месяца.</p>'),
      F('Документы по заявке', [['Анкета заемщика.pdf', 210_000], ['Выписка по счету за 12 мес.xlsx', 96_000]]),
    ]),
    M('Ваше заключение', 'Подготовьте заключение по шаблону и приложите расчет.', [
      { id: bldId(), k: 'task', html: 'Оцените платежеспособность заемщика и предложите решение: одобрить, одобрить с условиями или отказать. Приложите расчет в Excel.', ans: 'both' },
    ]),
  ] }] };
}
/** пример программы адаптации */
export function bldDemoProgram(): BldMaterial {
  const crs = (crs: string, req = true): BldBlock => ({ id: bldId(), k: 'course', crs, req });
  return { kind: 'program', t: 'Адаптация кредитного специалиста', flat: true, paging: 'module', order: 'seq', secs: [{ id: bldId('s'), t: '', mods: [
    M('Первая неделя', 'Знакомство с банком и рабочими системами.', [crs('c1'), crs('c2'), crs('c5')]),
    M('Первый месяц', 'Продукты и работа с клиентом.', [crs('c12'), crs('c11', false), crs('c15', false)]),
    M('Итог испытательного срока', 'Практическое задание и встреча с наставником.', [
      { id: bldId(), k: 'task', html: 'Проведите полный цикл оформления потребительского кредита под контролем наставника и опишите, что было сложным.', ans: 'text' },
    ]),
  ] }] };
}
/**
 * Курс-витрина для проверки: перед примером курса — раздел «Примеры видов модулей», по модулю каждого вида с теми блоками, которые в нем доступны:
 * «Модуль» — весь контент, «Задание» — задание, «Тестирование» — контент и вопросы с верным ответом, «Опрос» — контент и вопросы опроса.
 */
export function bldDemoAllBlocks(): BldMaterial {
  const mod: BldModule = M('Знакомство с кредитным конвейером', 'Как заявка проходит путь от клиента до выдачи: этапы, участники, документы.', [
    T('<p>Кредитный конвейер — это последовательность этапов, через которые проходит каждая заявка: <b>прием</b>, <b>проверка</b>, <b>решение</b> и <b>выдача</b>.</p><ul><li>прием — менеджер собирает документы;</li><li>проверка — служба рисков и безопасность;</li><li>решение — кредитный комитет или скоринг.</li></ul>'),
    T('<p><b>Важно.</b> На каждом этапе заявка может вернуться на доработку — срок рассмотрения считается заново.</p>', 'note'),
    V('Как устроен кредитный конвейер', '12 мин'),
    D('Регламент кредитования физических лиц', 'Регламент_кредитования.pdf', 1_240_000),
    { id: bldId(), k: 'image', img: BLD_IMAGES[1], title: 'Схема кредитного конвейера', files: [{ id: bldId('f'), name: 'Схема кредитного конвейера.webp', size: 184_000, st: 'ok', date: FD, url: BLD_IMAGES[1] }] },
    F('Шаблоны документов', [['Шаблон заявки.docx', 52_000], ['Тарифы.xlsx', 88_000]]),
    { id: bldId(), k: 'kb', art: 'k1' },
  ]);
  const task: BldModule = {
    ...M('Практика: схема процесса выдачи', 'Опишите процесс выдачи кредита по шагам и приложите схему.', [
      { id: bldId(), k: 'task', html: 'Опишите процесс выдачи потребительского кредита по шагам: кто участвует, какие документы нужны, где возможны задержки. Приложите схему процесса.', ans: 'both' },
    ]),
    mk: 'task', task: { ...newTaskSet(), cur: PEOPLE[1][0], pts: 10, reject: true },
  };
  const test: BldModule = {
    ...M('Проверка знаний: кредитный конвейер', 'Короткий тест по материалам модуля — проходной процент 80.', [
      T('<p>Ответьте на вопросы. У вас три попытки, после теста будет отчет с правильными ответами.</p>'),
      QB('single', 'Кто принимает решение по заявке выше лимита скоринга?', { opts: ['Менеджер', 'Кредитный комитет', 'Клиент'], ok: [1] }),
      QB('multi', 'Какие этапы входят в кредитный конвейер?', { opts: ['Прием', 'Проверка', 'Реклама', 'Выдача'], ok: [0, 1, 3] }),
      QB('yesno', 'Можно ли выдать кредит без проверки службы безопасности?', { opts: ['Да', 'Нет'], ok: [1] }),
      QB('drop', 'Какое подразделение проверяет платежеспособность?', { opts: ['Розничный бизнес', 'Управление рисков', 'ИТ', 'HR'], ok: [1] }),
      QB('rank', 'Расставьте этапы по порядку', { opts: ['Прием заявки', 'Проверка', 'Решение', 'Выдача'] }),
      QB('short', 'Сколько рабочих дней по регламенту рассматривается заявка?'),
    ]),
    mk: 'test', test: { ...newTestSet(), pass: 80, tries: 3, time: '15 мин' },
  };
  const poll: BldModule = {
    ...M('Обратная связь по модулю', 'Помогите нам сделать курс лучше — опрос займет 3 минуты.', [
      T('<p>Ответы анонимные и используются только для улучшения курса.</p>'),
      QB('rating', 'Насколько понятен материал?', { lo: 'Непонятно', hi: 'Все ясно' }),
      { id: bldId(), k: 'q', q: newPollQuestion('enps') },
      QB('matrix', 'Оцените утверждения о курсе'),
      QB('slider', 'Какую долю материала вы уже применяете в работе?'),
      QB('date', 'Когда планируете применить знания?', { req: false }),
      QB('file', 'Приложите пример своей работы', { ph: 'PDF, DOCX', max: '10', req: false }),
      QB('long', 'Что было самым полезным?', { req: false }),
    ]),
    mk: 'poll',
  };
  const m = bldDemoCourse();
  m.secs.unshift({ id: bldId('s'), t: 'Примеры видов модулей', mods: [mod, task, test, poll] });
  return m;
}
export const BLD_DEMO: Record<BldKind, () => BldMaterial> = { course: bldDemoCourse, test: bldDemoTest, poll: bldDemoPoll, task: bldDemoTask, program: bldDemoProgram };

/** шаблоны модулей (демо): по одному-два каждого вида — выбираются в окне «Шаблоны модулей» при добавлении модуля */
export function bldModTemplates(): BldModTemplate[] {
  const tp = (mk: BldModKind, t: string, d: string, blocks: BldBlock[], au: string, date: string, x: Partial<BldModTemplate> = {}): BldModTemplate =>
    ({ id: bldId('t'), mk, t, d, blocks, au, date, ...x });
  return [
    tp('mod', 'Знакомство с банком', 'Миссия, ценности и структура «Меридиан Банка».', [
      T('<p>«Меридиан Банк» — универсальный банк для частных и корпоративных клиентов.</p>'),
      V('Обращение председателя правления', '6 мин'),
    ], PEOPLE[3][0], '12.08.2026'),
    tp('mod', 'Регламенты и документы', 'Основные внутренние документы для новых сотрудников.', [
      D('Кодекс корпоративной этики', 'Кодекс_этики.pdf', 640_000),
      F('Шаблоны документов', [['Служебная записка.docx', 32_000], ['Заявление на отпуск.docx', 28_000]]),
    ], PEOPLE[3][0], '02.09.2026'),
    tp('test', 'Итоговый тест по информационной безопасности', 'Проверка знаний правил работы с данными клиентов.', [
      QB('single', 'Куда сообщать о подозрительном письме?', { opts: ['Коллегам', 'В службу ИБ', 'Никуда'], ok: [1] }),
      QB('yesno', 'Можно ли передавать пароль руководителю?', { opts: ['Да', 'Нет'], ok: [1] }),
    ], PEOPLE[1][0], '20.08.2026', { test: { ...newTestSet(), pass: 80, tries: 2 } }),
    tp('test', 'Проверка знаний: кредитные продукты', 'Условия потребительского кредита и ипотеки.', [
      QB('multi', 'Что влияет на ставку по кредиту?', { opts: ['Срок', 'Сумма', 'Цвет карты', 'Кредитная история'], ok: [0, 1, 3] }),
    ], PEOPLE[0][0], '05.09.2026', { test: { ...newTestSet(), pass: 70, tries: 3 } }),
    tp('task', 'Практика: разбор кредитной заявки', 'Оценка платежеспособности заемщика по документам.', [
      { id: bldId(), k: 'task', html: 'Оцените платежеспособность заемщика и предложите решение. Приложите расчет.', ans: 'both' },
    ], PEOPLE[1][0], '28.08.2026', { task: { ...newTaskSet(), alg: 'Руководитель сотрудника', pts: 10 } }),
    tp('poll', 'Обратная связь по курсу', 'Короткий опрос в конце курса.', [
      QB('rating', 'Насколько полезен курс?', { lo: 'Бесполезен', hi: 'Очень полезен' }),
      QB('long', 'Что улучшить в курсе?', { req: false }),
    ], PEOPLE[3][0], '10.09.2026'),
  ];
}
