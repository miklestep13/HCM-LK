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
const CAL = 'Мой календарь', ABS = 'График отсутствий';
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
