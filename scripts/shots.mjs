// Скриншоты состояний прототипа для показа (headless Chrome по протоколу DevTools, без зависимостей).
// Запуск при работающем `npm start`:  node scripts/shots.mjs [фильтр-по-имени]
// Кадры — export/screens/<раздел>/NN-<состояние>.png, 1440 px, двойное разрешение, без кнопки «Демо» (?noDemo=1).
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.SHOTS_BASE || 'http://localhost:4300/#/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const W = 1440, H = 1000;
const only = process.argv[2] || '';

/** помощники внутри страницы: $ / $$ / пауза / клик по тексту / компонент Angular / перерисовка */
const PRE = `
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const byText = (sel, t) => $$(sel).find((e) => e.textContent.trim() === t) || $$(sel).find((e) => e.textContent.trim().startsWith(t));
const click = (el) => { if (!el) throw new Error('нет элемента'); el.scrollIntoView({ block: 'center' }); el.click(); };
const ngc = (sel) => ng.getComponent($(sel));
const tick = () => { try { ng.applyChanges($('app-root')); } catch (e) {} };
const ME = 'Иванов Павел Сергеевич';
`;

/** сценарии: раздел, имя кадра, адрес, действие на странице, full — вся страница по высоте */
const CAL = 'Мой календарь', ABS = 'График отсутствий', SRV = 'Опросы', PLS = 'Опросы HR', PST = 'Итоги опроса', IPR = 'ИПР';
const ATT = 'Бланк аттестации';
const GL = 'Карта целей';
/** карта целей: роль и этап (draft, appr, plan, self, wait, cust, fin) — как в dev-панели «Демо», затем действие */
const gl = (stage, role, act = '') => `const D = ngc('app-mygoals').s.demo; D.goalRole.set('${role}'); D.goalStage.set('${stage}'); tick(); await sleep(900); ${act}`;
/** бланк аттестации: этап и роль из dev-панели («Демо»), затем действие */
const att = (stage, role, act = '') => `const A = ngc('app-attncard').s; A.setStage('${stage}'); A.role.set('${role}'); tick(); await sleep(700); ${act}`;
const SHOTS = [
  [CAL, 'Рабочая неделя', 'cal', ''],
  [CAL, 'День', 'cal', `click(byText('.pg-cal button, .pg-cal span', 'День')); await sleep(500);`],
  [CAL, 'Неделя', 'cal', `click(byText('.pg-cal button, .pg-cal span', 'Неделя')); await sleep(500);`],
  [CAL, 'Месяц', 'cal', `click(byText('.pg-cal button, .pg-cal span', 'Месяц')); await sleep(500);`],
  [CAL, 'Выбор даты', 'cal', `click($$('.pg-cal button').find((b) => /20\\d\\d/.test(b.textContent))); await sleep(500);`],
  [CAL, 'Карточка встречи — участник', 'cal', `
    const st = ngc('app-cal').s; const ev = st.events().find((e) => e.org !== ME && $$('.calcol .cle').some((b) => b.title.startsWith(e.t)));
    click($$('.calcol .cle').find((b) => b.title.startsWith(ev.t))); await sleep(600);`],
  [CAL, 'Карточка встречи — организатор', 'cal', `
    const st = ngc('app-cal').s; const ev = st.events().find((e) => e.org === ME && $$('.calcol .cle').some((b) => b.title.startsWith(e.t)));
    click($$('.calcol .cle').find((b) => b.title.startsWith(ev.t))); await sleep(600);`],
  [CAL, 'Удаление встречи', 'cal', `
    const st = ngc('app-cal').s; const ev = st.events().find((e) => e.org === ME && $$('.calcol .cle').some((b) => b.title.startsWith(e.t)));
    click($$('.calcol .cle').find((b) => b.title.startsWith(ev.t))); await sleep(600);
    click(byText('.clpop button, .bkpa button', 'Удалить')); await sleep(600);`],
  [CAL, 'Быстрое создание встречи', 'cal', `
    const col = $$('.calcol')[3]; const r = col.getBoundingClientRect(); const hr = $$('.calhr span').find((s) => s.textContent.trim() === '17:00');
    window.scrollTo(0, 0); const y = hr.getBoundingClientRect().top + 2;
    col.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + r.width / 2, clientY: y })); await sleep(800);`],
  [CAL, 'Поиск встречи', 'cal', `
    const i = $('.pg-cal input'); i.focus(); i.value = 'планерка'; i.dispatchEvent(new Event('input', { bubbles: true })); await sleep(800);`],
  [CAL, 'Фильтры', 'cal', `click($('.pg-cal [aria-label="Показать панель фильтров"]')); await sleep(500);`],
  [CAL, 'Добавление встречи', 'eventnew?type=Встреча&from=cal', '', true],
  [CAL, 'Добавление встречи — повторение', 'eventnew?type=Встреча&from=cal', `
    const s = ngc('app-eventnew').s; s.set('title', 'Планерка отдела'); s.set('repKind', 'Еженедельно'); s.set('repDays', [0, 2]); tick(); await sleep(700);`, true],
  [CAL, 'Просмотр встречи — участник', 'cal', `
    const st = ngc('app-cal').s; const ev = st.events().find((e) => e.org !== ME && !e.rep); st.preview(ev, new Date(ev.d)); await sleep(2500);`, true],
  [CAL, 'Просмотр встречи — организатор', 'cal', `
    const st = ngc('app-cal').s; const ev = st.events().find((e) => e.org === ME && !e.rep && e.ppl.length > 1); st.preview(ev, new Date(ev.d)); await sleep(2500);`, true],

  [SRV, 'Карточки', 'surveys', `ngc('app-surveys').s.setView('cards'); tick(); await sleep(600);`, true],
  [SRV, 'Таблица', 'surveys', `ngc('app-surveys').s.setView('table'); tick(); await sleep(600);`, true],
  [SRV, 'Пройденные — карточки', 'surveys', `const s = ngc('app-surveys').s; s.setView('cards'); s.tab.set('done'); tick(); await sleep(600);`, true],
  [SRV, 'Пройденные — таблица', 'surveys', `const s = ngc('app-surveys').s; s.setView('table'); s.tab.set('done'); tick(); await sleep(600);`, true],
  [SRV, 'Фильтры', 'surveys', `const s = ngc('app-surveys').s; s.setView('cards'); s.opened.set(true); tick(); await sleep(600);`],
  [SRV, 'Прохождение — блок 1', 'survey?sv=s2', `ngc('app-survey').s.demo('Доступен'); tick(); await sleep(600);`, true],
  [SRV, 'Прохождение — блок 2 (начатый опрос)', 'survey?sv=s2', `await sleep(600);`, true],
  [SRV, 'Прохождение — блок 3', 'survey?sv=s2', `ngc('app-survey').s.show(2); tick(); await sleep(600);`, true],
  [SRV, 'Прохождение — блок 4', 'survey?sv=s2', `ngc('app-survey').s.show(3); tick(); await sleep(600);`, true],
  [SRV, 'Прохождение — «Далее» без обязательных', 'survey?sv=s2', `ngc('app-survey').s.demo('Доступен'); tick(); await sleep(300); click(byText('.pg-survey .ipisl .btn', 'Далее')); await sleep(900);`, true],
  [SRV, 'Прохождение — подтверждение', 'survey?sv=s2', `const s = ngc('app-survey').s; s.demo('Завершен'); s.survey.set({ ...s.survey(), status: 'В работе' }); s.show(3); tick(); await sleep(300); click(byText('.pg-survey .ipisl .btn', 'Завершить')); await sleep(700);`],
  [SRV, 'Просмотр пройденного', 'survey?sv=s12', `await sleep(600);`, true],
  [IPR, 'Нет плана', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('none'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Создание плана', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('new'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Черновик — сотрудник', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Черновик'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Черновик — руководитель', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Черновик'); c.s.arole.set('mgr'); tick(); await sleep(700);`, true],
  [IPR, 'Предложено — сотрудник', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Предложено'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Предложено — руководитель', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Предложено'); c.s.arole.set('mgr'); tick(); await sleep(700);`, true],
  [IPR, 'Утверждено — сотрудник', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Утверждено'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Утверждено — руководитель', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Утверждено'); c.s.arole.set('mgr'); tick(); await sleep(700);`, true],
  [IPR, 'Выполнено', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Выполнено'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Выполнено частично', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Выполнено частично'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Не выполнено', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Не выполнено'); c.s.arole.set('emp'); tick(); await sleep(700);`, true],
  [IPR, 'Задача раскрыта', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Утверждено'); c.s.arole.set('emp'); tick(); await sleep(700); c.s.toggleOpen(0); tick(); await sleep(500);`, true],
  [IPR, 'Добавление задачи', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Черновик'); c.s.arole.set('emp'); tick(); await sleep(700); c.taskForm.set(-1); tick(); await sleep(700);`],
  [IPR, 'Задача — редактирование', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Черновик'); c.s.arole.set('emp'); tick(); await sleep(700); c.taskForm.set(0); tick(); await sleep(700);`],
  [IPR, 'Добавить компетенции', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Черновик'); c.s.arole.set('emp'); tick(); await sleep(700); c.taskForm.set(-1); tick(); await sleep(700); click($('.mselsr')); await sleep(700);`],
  [IPR, 'Удаление задачи', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Черновик'); c.s.arole.set('emp'); tick(); await sleep(700); c.onTask({ a: 'del', i: 0 }); await sleep(700);`],
  [IPR, 'Выполнение задачи', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Утверждено'); c.s.arole.set('emp'); tick(); await sleep(700); c.run.set(0); tick(); await sleep(700);`],
  [IPR, 'Комментарии к задаче', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Утверждено'); c.s.arole.set('emp'); tick(); await sleep(700); c.chat.set({ i: 0, why: false }); tick(); await sleep(700);`],
  [IPR, 'Параметры плана', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Черновик'); c.s.arole.set('emp'); tick(); await sleep(700); c.params.set(true); tick(); await sleep(700);`],
  [IPR, 'Вернуть на доработку', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Предложено'); c.s.arole.set('mgr'); tick(); await sleep(700); c.onIsland('back'); tick(); await sleep(700);`],
  [IPR, 'Запрос руководителю', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('none'); c.s.arole.set('emp'); tick(); await sleep(700); c.ask(); tick(); await sleep(700);`],
  [IPR, 'Согласование', 'ipr', `const c = ngc('app-ipr'); c.s.setDemo('Предложено'); c.s.arole.set('emp'); tick(); await sleep(700); c.agree.set(true); tick(); await sleep(700);`],
  [ABS, 'Календарь — месяц', 'absences', ''],
  [ABS, 'Календарь — год', 'absences', `ngc('app-absences').s.view.set('year'); tick(); await sleep(800);`],
  [ABS, 'Выбор месяца', 'absences', `click($$('.ab-gantt button, .ab-gantt span').find((b) => /^[А-Я][а-я]+ 20\\d\\d$/.test(b.textContent.trim()))); await sleep(500);`],
  [ABS, 'Таблица', 'absences', `ngc('app-absences').s.mode.set('table'); tick(); await sleep(800);`, true],
  [ABS, 'Фильтры', 'absences', `ngc('app-absences').s.ftOpen.set(true); tick(); await sleep(500);`],
  [ABS, 'Карточка отсутствия', 'absences', `($$('.abb').find((b) => b.textContent.includes('Больничный') && b.getBoundingClientRect().left > 400 && b.getBoundingClientRect().right < innerWidth) || $$('.abb')[0]).click(); await sleep(800);`],
  [ABS, 'Добавление участника', 'absences', `click($('.abadd')); await sleep(800);`],
  [ABS, 'Период планирования открыт', 'absences', `ngc('app-absences').store.planOpen.set(true); tick(); await sleep(600);`],
  [ABS, 'Руководитель — календарь', 'absences', `ngc('app-absences').store.role.set('admin'); tick(); await sleep(600);`],
  [ABS, 'Руководитель — сотрудник', 'absences', `
    ngc('app-absences').store.role.set('admin'); tick(); await sleep(600);
    click($$('.abl.abpick').find((e) => e.textContent.includes('Гусева')) || $$('.abl.abpick')[1]); await sleep(800); window.scrollTo(0, 0);`],
  [ABS, 'Руководитель — таблица заявок', 'absences', `ngc('app-absences').store.role.set('admin'); ngc('app-absences').s.mode.set('table'); tick(); await sleep(800);`, true],
  [ABS, 'Оформить заявку', 'absences', `click($('.abreq')); await sleep(4000);`],

  [GL, 'Заведение целей — сотрудник', 'mygoals', gl('draft', 'emp'), true],
  [GL, 'Заведение целей — руководитель', 'mygoals', gl('draft', 'mgr'), true],
  [GL, 'На согласовании — сотрудник', 'mygoals', gl('appr', 'emp'), true],
  [GL, 'Утверждено — сотрудник', 'mygoals', gl('plan', 'emp'), true],
  [GL, 'Утверждено — руководитель', 'mygoals', gl('plan', 'mgr'), true],
  [GL, 'Период оценки — сотрудник', 'mygoals', gl('self', 'emp'), true],
  [GL, 'Самооценка отправлена — сотрудник', 'mygoals', gl('wait', 'emp'), true],
  [GL, 'Период оценки — руководитель', 'mygoals', gl('cust', 'mgr'), true],
  [GL, 'Завершена — сотрудник', 'mygoals', gl('fin', 'emp'), true],
  [GL, 'Завершена — руководитель', 'mygoals', gl('fin', 'mgr'), true],
  [GL, 'Отправить на согласование', 'mygoals', gl('draft', 'emp', `ngc('[mygoals-foot]').send(); await sleep(700);`)],
  [GL, 'Удаление цели', 'mygoals', gl('draft', 'emp', `click($('[mygoals-goal] .actb.dg')); await sleep(700);`)],
  [GL, 'Отправить самооценку', 'mygoals', gl('self', 'emp', `ngc('[mygoals-foot]').sendSelf(); await sleep(700);`)],
  [GL, 'Отправить оценку', 'mygoals', gl('cust', 'mgr', `ngc('[mygoals-foot]').sendCust(); await sleep(700);`)],
  [GL, 'Новая цель', 'mygoalnew?lvl=Индивидуальная', '', true],
  [GL, 'Новая цель — участники таблицей', 'mygoalnew?lvl=Индивидуальная', `ngc('app-mygoalnew').s.pview.set('rows'); tick(); await sleep(700);`, true],
  [GL, 'Редактирование цели', 'mygoals', gl('draft', 'emp', `click($('[mygoals-goal] .actb[title="Редактировать"]')); await sleep(2200);`), true],
  [GL, 'Цель — количественная', 'mygoals', gl('plan', 'emp', `click($('.glnl')); await sleep(2200); ngc('app-mygoalview').s.kind.set('num'); tick(); await sleep(600);`), true],
  [GL, 'Цель — качественная', 'mygoals', gl('plan', 'emp', `click($('.glnl')); await sleep(2200); ngc('app-mygoalview').s.kind.set('txt'); tick(); await sleep(600);`), true],
  [GL, 'Цель — бинарная', 'mygoals', gl('plan', 'emp', `click($('.glnl')); await sleep(2200); ngc('app-mygoalview').s.kind.set('str'); tick(); await sleep(600);`), true],
  [GL, 'Цель — самооценка', 'mygoals', gl('self', 'emp', `click($('.glsbtn')); await sleep(2200);`), true],
  [GL, 'Цель — оценка руководителя', 'mygoals', gl('cust', 'mgr', `click($('.glsbtn')); await sleep(2200);`), true],
  [GL, 'Цель — итог', 'mygoals', gl('fin', 'emp', `click($('.glnl')); await sleep(2200);`), true],
  [GL, 'Бинарная — самооценка', 'mygoals', gl('self', 'emp', `const card = $$('[mygoals-goal]').find((c) => c.textContent.includes('Бинарная')); click(card.querySelector('.glsbtn')); await sleep(2200);`), true],
  [GL, 'Бинарная — самооценка «Выполнено»', 'mygoals', gl('self', 'emp', `const card = $$('[mygoals-goal]').find((c) => c.textContent.includes('Бинарная')); click(card.querySelector('.glsbtn')); await sleep(2200); click($$('.glbseg span')[0]); await sleep(600);`), true],
  [GL, 'Бинарная — самооценка «Не выполнено»', 'mygoals', gl('self', 'emp', `const card = $$('[mygoals-goal]').find((c) => c.textContent.includes('Бинарная')); click(card.querySelector('.glsbtn')); await sleep(2200); click($$('.glbseg span')[1]); await sleep(600);`), true],
  // у бинарной цели руководитель не ставит оценку: итог — по результату самооценки, только просмотр
  [GL, 'Бинарная — просмотр руководителя', 'mygoals', gl('cust', 'mgr', `const card = $$('[mygoals-goal]').find((c) => c.textContent.includes('Бинарная')); ng.getComponent(card).open('edit'); await sleep(2200);`), true],
  [ATT, 'Самооценка — сотрудник', 'attncard', att('self', 'emp', ``), true],
  [ATT, 'Самооценка — руководитель', 'attncard', att('self', 'mgr', ``), true],
  [ATT, 'Оценка руководителя — сотрудник', 'attncard', att('mgr', 'emp', ``), true],
  [ATT, 'Оценка руководителя — руководитель', 'attncard', att('mgr', 'mgr', ``), true],
  [ATT, 'Оценки комиссии — сотрудник', 'attncard', att('comm', 'emp', ``), true],
  [ATT, 'Оценки комиссии — руководитель', 'attncard', att('comm', 'mgr', ``), true],
  [ATT, 'Оценки комиссии — комиссия', 'attncard', att('comm', 'comm', ``), true],
  [ATT, 'Заседание комиссии — сотрудник', 'attncard', att('meet', 'emp', ``), true],
  [ATT, 'Заседание комиссии — руководитель', 'attncard', att('meet', 'mgr', ``), true],
  [ATT, 'Заседание комиссии — комиссия', 'attncard', att('meet', 'comm', ``), true],
  [ATT, 'Кандидат на повышение — сотрудник', 'attncard', att('final', 'emp', ``), true],
  [ATT, 'Кандидат на повышение — HR', 'attncard', att('final', 'hr', ``), true],
  [ATT, 'Кандидат на повышение — вариант', 'attncard', att('final', 'var', ``), true],
  [ATT, 'ИПР — сотрудник', 'attncard', att('ipr', 'emp', ``), true],
  [ATT, 'ИПР — HR', 'attncard', att('ipr', 'hr', ``), true],
  [ATT, 'Пройден с ИПР — сотрудник', 'attncard', att('iprok', 'emp', ``), true],
  [ATT, 'Пройден с ИПР — HR', 'attncard', att('iprok', 'hr', ``), true],
  [ATT, 'Не пройдена — сотрудник', 'attncard', att('fail', 'emp', ``), true],
  [ATT, 'Самооценка — выбор A–E', 'attncard', att('self', 'emp', `A.inputMode.set('seg'); ngc('[attncard-rates]').rate.set(A.list().find((x) => x.st === 'todo' && x.own === 'emp')); tick(); await sleep(900);`)],
  [ATT, 'Самооценка — выпадающий список', 'attncard', att('self', 'emp', `A.inputMode.set('list'); ngc('[attncard-rates]').rate.set(A.list().find((x) => x.st === 'todo' && x.own === 'emp')); tick(); await sleep(900);`)],
  [ATT, 'Самооценка — текстовое поле', 'attncard', att('self', 'emp', `A.inputMode.set('text'); ngc('[attncard-rates]').rate.set(A.list().find((x) => x.st === 'todo' && x.own === 'emp')); tick(); await sleep(900);`)],
  [ATT, 'Самооценка — числовое поле', 'attncard', att('self', 'emp', `A.inputMode.set('num'); ngc('[attncard-rates]').rate.set(A.list().find((x) => x.st === 'todo' && x.own === 'emp')); tick(); await sleep(900);`)],
  [ATT, 'Оценка руководителя — форма', 'attncard', att('mgr', 'mgr', `A.inputMode.set('seg'); ngc('[attncard-rates]').rate.set(A.list().find((x) => x.st === 'todo' && x.own === 'mgr')); tick(); await sleep(900);`)],
  [ATT, 'Участники — добавление строкой', 'attncard', att('self', 'mgr', `ngc('[attncard-people-table]').addRow(); tick(); await sleep(1200); $('.afpplt').scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); await sleep(300);`)],
  [ATT, 'Участники — изменение строкой', 'attncard', att('self', 'mgr', `ngc('[attncard-people-table]').editRow(A.people().find((p) => p.name.startsWith('Крылов'))); tick(); await sleep(900); $('.afpplt').scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); await sleep(300);`)],
  [ATT, 'Участники — удаление', 'attncard', att('self', 'mgr', `click($$('.afpplt .tact button[title="Удалить"]')[0]); await sleep(700);`)],
  [ATT, 'Мероприятия — раскрытая строка', 'attncard', att('self', 'mgr', `ngc('[attncard-events]').toggle(A.events()[1]); tick(); await sleep(600); $('.afevtbl').scrollIntoView({ block: 'start' }); window.scrollBy(0, -160); await sleep(300);`)],
  [ATT, 'Мероприятия — изменение', 'attncard', att('self', 'mgr', `ngc('[attncard-events]').edit.set({ ev: A.events()[1] }); tick(); await sleep(900);`)],
  [ATT, 'Мероприятия — удаление', 'attncard', att('self', 'mgr', `$('.afevtbl').scrollIntoView({ block: 'center' }); click($$('.afevtbl .tact button[title="Удалить"]')[0]); await sleep(700);`)],
  [ATT, 'Итог заседания — пройдена с условиями', 'attncard', att('meet', 'comm', `A.form.set({ ...A.form(), dec: 'Пройдена с условиями', cm: 'Закрыть разрывы по коммуникации с клиентом в рамках ИПР.' }); tick(); await sleep(900);`), true],
  [ATT, 'Итог заседания — превосходит ожидания', 'attncard', att('meet', 'comm', `A.form.set({ ...A.form(), dec: 'Превосходит ожидания', cand: true, cm: 'Рекомендован кандидатом на повышение.' }); tick(); await sleep(900);`), true],
  [ATT, 'Итог заседания — не заполнено', 'attncard', att('meet', 'comm', `click(byText('.atfact .btn', 'Завершить аттестацию')); await sleep(900); $('.afform').scrollIntoView({ block: 'center' }); await sleep(300);`)],
  [PLS, 'Активные', 'polls', `await sleep(500);`, true],
  [PLS, 'Участники — список', 'polls', `click($$('.pg-polls .plav .more')[0]); await sleep(500);`],
  [PLS, 'Участники — окно', 'polls', `click($$('.pg-polls .plav .more')[0]); await sleep(300); click($('.plpall')); await sleep(500);`],
  [PLS, 'Завершенные', 'polls', `click(byText('.pg-polls .svtabs span', 'Завершенные')); await sleep(400);`, true],
  [PLS, 'Архив', 'polls', `click(byText('.pg-polls .svtabs span', 'Архив')); await sleep(400);`, true],
  [PLS, 'Старый прототип', 'legacy/polls', `await sleep(1500);`],
  [PLS, 'Старая форма — информация', 'legacy/pollnew?mode=edit&idx=1', `await sleep(2500);`],
  [PLS, 'Старая форма — вопросы', 'legacy/pollnew?mode=edit&idx=1', `await sleep(2500); const F = () => $('iframe').contentDocument; const fc = (sel) => { const e = F().querySelector(sel); if (!e) throw new Error('нет ' + sel); e.click(); }; fc('[data-pnt="q"]'); await sleep(400);`],
  [PLS, 'Старая форма — участники', 'legacy/pollnew?mode=edit&idx=1', `await sleep(2500); const F = () => $('iframe').contentDocument; const fc = (sel) => { const e = F().querySelector(sel); if (!e) throw new Error('нет ' + sel); e.click(); }; fc('[data-pnt="ppl"]'); await sleep(400);`],
  [PLS, 'Старая форма — публикация', 'legacy/pollnew?mode=edit&idx=1', `await sleep(2500); const F = () => $('iframe').contentDocument; const fc = (sel) => { const e = F().querySelector(sel); if (!e) throw new Error('нет ' + sel); e.click(); }; fc('[data-pnt="pub"]'); await sleep(400);`],
  [PLS, 'Новый опрос — 1. Общая информация', 'pollnew', `await sleep(500);`],
  [PLS, 'Новый опрос — 1. Не заполнено', 'pollnew', `click(byText('.pg-pollnew .ipff .btn', 'Далее')); await sleep(500);`],
  [PLS, 'Новый опрос — 2. Вопросы пустые', 'pollnew', `const s = ngc('app-pollnew').s; s.go(1); tick(); await sleep(400);`],
  [PLS, 'Новый опрос — 2. Меню типов вопроса', 'pollnew', `const s = ngc('app-pollnew').s; s.go(1); tick(); await sleep(300); click(byText('.pg-pollnew .csecb .btn', 'Добавить вопрос')); await sleep(400);`],
  [PLS, 'Редактирование — 1. Общая информация', 'pollnew?poll=1', `await sleep(500);`],
  [PLS, 'Редактирование — 2. Вопросы', 'pollnew?poll=1', `const s = ngc('app-pollnew').s; s.go(1); tick(); await sleep(400);`, true],
  [PLS, 'Редактирование — 2. Вариант ответа', 'pollnew?poll=1', `const s = ngc('app-pollnew').s; s.go(1); s.sel.set(s.sec()[2].q[0]); tick(); await sleep(400);`, true],
  [PLS, 'Редактирование — 3. Участники', 'pollnew?poll=1', `const s = ngc('app-pollnew').s; s.go(2); tick(); await sleep(500);`, true],
  [PLS, 'Редактирование — 4. Публикация', 'pollnew?poll=1', `const s = ngc('app-pollnew').s; s.go(3); tick(); await sleep(400);`],
  [PLS, 'Редактирование — меню «Сохранить»', 'pollnew?poll=1', `const s = ngc('app-pollnew').s; s.go(3); tick(); await sleep(300); click($('.pg-pollnew .pnsave')); await sleep(400);`],
  [PLS, 'Предпросмотр', 'pollnew?poll=1', `const s = ngc('app-pollnew').s; s.preview.set(true); tick(); await sleep(500);`],
  [PLS, 'Типы — меню «Добавить вопрос»', 'pollnew', `const s = ngc('app-pollnew').s; s.go(1); tick(); await sleep(300); click(byText('.pg-pollnew .csecb .btn', 'Добавить вопрос')); await sleep(400);`, true],
  [PLS, 'Типы — Рейтинг', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'rating')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Единичный выбор', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'single')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Множественный выбор', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'multi')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Да или Нет', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'yesno')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Выпадающий список', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'drop')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Матрица', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'matrix')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Ранжирование', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'rank')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — eNPS', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'enps')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Ползунок', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'slider')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Строка текста', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'short')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Многострочный текст', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'long')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Дата', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'date')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — Загрузка файла', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.sel.set(s.sec()[0].q.find((q) => q.t === 'file')); tick(); await sleep(500); $('.pg-pollnew .pnprev').scrollIntoView({ block: 'center' }); await sleep(200);`],
  [PLS, 'Типы — предпросмотр', 'pollnew', `const s = ngc('app-pollnew').s; s.n.set('Все типы вопросов'); s.go(1); s.sec()[0].d = 'Описание раздела под названием'; ['rating','single','multi','yesno','drop','matrix','rank','enps','slider','short','long','date','file'].forEach((t) => s.addQuestion(0, t)); s.sec()[0].q.forEach((q, k) => { if (!q.n) q.n = 'Вопрос ' + (k + 1); }); s.touch(); s.preview.set(true); tick(); await sleep(600);`],
  [PLS, 'Типы — список «Тип вопроса»', 'pollnew?poll=1', `const s = ngc('app-pollnew').s; s.go(1); tick(); await sleep(400); click($('.pg-pollnew .pntype .fsel, .pg-pollnew app-select.pntype')); await sleep(400);`],
  [PST, 'Тест — участники', 'pollstats?poll=8', `await sleep(800);`, true],
  [PST, 'Тест — вопросы', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.tab.set('q'); tick(); await sleep(600);`, true],
  [PST, 'Тест — ответ, единичный выбор', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(0); tick(); await sleep(600);`, true],
  [PST, 'Тест — ответ, множественный выбор', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(1); tick(); await sleep(600);`, true],
  [PST, 'Тест — ответ, да или нет', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(2); tick(); await sleep(600);`, true],
  [PST, 'Тест — ответ, ранжирование', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(4); tick(); await sleep(600);`, true],
  [PST, 'Тест — ответ, матрица', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(5); tick(); await sleep(600);`, true],
  [PST, 'Тест — ответ, рейтинг', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(7); tick(); await sleep(600);`, true],
  [PST, 'Тест — ответ, развернутый', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(8); tick(); await sleep(600);`, true],
  [PST, 'Опрос — участники', 'pollstats?poll=1', `await sleep(800);`, true],
  [PST, 'Опрос — вопросы', 'pollstats?poll=1', `const s = ngc('app-pollstats').s; s.tab.set('q'); tick(); await sleep(600);`, true],
  [PST, 'Опрос — ответ, eNPS', 'pollstats?poll=0', `const s = ngc('app-pollstats').s; s.showQ(0); tick(); await sleep(600);`, true],
  [PST, 'Опрос — ответ, множественный с «Другое»', 'pollstats?poll=1', `const s = ngc('app-pollstats').s; s.showQ(6); tick(); await sleep(600);`, true],
  [PST, 'Опрос — список вопросов для выбора', 'pollstats?poll=8', `const s = ngc('app-pollstats').s; s.showQ(3); tick(); await sleep(500); click($('.pg-pollstats .psqsel')); await sleep(400);`],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const prof = mkdtempSync(join(tmpdir(), 'shots-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
}
if (!target) throw new Error('Chrome не запустился');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const wait = new Map();
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && wait.has(d.id)) { wait.get(d.id)(d); wait.delete(d.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; wait.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const metrics = (h) => send('Emulation.setDeviceMetricsOverride', { width: W, height: h, deviceScaleFactor: 2, mobile: false });
await send('Page.enable'); await send('Runtime.enable'); await metrics(H);

const counters = {};
for (const [sec, name, url, act, full] of SHOTS) {
  counters[sec] = (counters[sec] || 0) + 1;
  if (only && !(sec + name).toLowerCase().includes(only.toLowerCase())) continue;
  const dir = join('export/screens', sec); mkdirSync(dir, { recursive: true });
  const file = join(dir, String(counters[sec]).padStart(2, '0') + '-' + name.replace(/[\/\\:]/g, '') + '.png');
  await metrics(H);
  await send('Page.navigate', { url: 'about:blank' }); await sleep(200);
  await send('Page.navigate', { url: BASE + url + (url.includes('?') ? '&' : '?') + 'noDemo=1' }); await sleep(3000);
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${PRE}\n${act}\n })()`, awaitPromise: true });
  if (r.result?.exceptionDetails) console.log('  ! ' + name + ': ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).split('\n')[0]);
  await sleep(400);
  if (full) {
    const h = (await send('Runtime.evaluate', { expression: 'Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)', returnByValue: true })).result.result.value;
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' }); await metrics(Math.max(H, h)); await sleep(500);
  }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
  console.log('✓ ' + file);
}
ws.close(); chrome.kill();
