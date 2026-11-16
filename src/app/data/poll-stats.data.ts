import { Poll, PollQuestion, PollSection, PollWave } from '../interface/poll';
import { PollPart, PollPartStatus, PollQStat, PollStats } from '../interface/poll-stats';
import { POLL_CONDITIONS, POLL_TEMPLATES } from './polls.data';

/**
 * Демо-итоги опроса для дашборда HR («Опросы → итоги»): строятся детерминированно по опросу —
 * число участников и завершивших берется из опроса, ответы распределяются псевдослучайно (одинаково при каждом открытии).
 */

/** ФИО участников: мужские и женские фамилии × имя-отчество (без повторов) */
const M_LAST = ['Иванов', 'Петров', 'Соколов', 'Кузнецов', 'Попов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Алексеев', 'Егоров', 'Павлов', 'Семенов', 'Голубев', 'Виноградов', 'Богданов', 'Воробьев', 'Федоров', 'Михайлов'];
const M_FIRST = ['Андрей Ильич', 'Сергей Петрович', 'Дмитрий Олегович', 'Алексей Викторович', 'Максим Андреевич', 'Артем Романович', 'Игорь Николаевич', 'Денис Сергеевич', 'Олег Васильевич', 'Роман Олегович', 'Никита Павлович'];
const F_LAST = ['Иванова', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева', 'Павлова', 'Семенова', 'Голубева', 'Виноградова', 'Белова', 'Тарасова', 'Белоусова', 'Орлова', 'Киселева', 'Макарова', 'Андреева', 'Захарова', 'Зайцева', 'Соловьева', 'Борисова'];
const F_FIRST = ['Анна Игоревна', 'Мария Андреевна', 'Екатерина Дмитриевна', 'Ольга Андреевна', 'Татьяна Юрьевна', 'Елена Викторовна', 'Ксения Павловна', 'Полина Сергеевна', 'Дарья Андреевна', 'Алина Викторовна', 'Юлия Сергеевна'];
const POSTS = ['Специалист по кредитованию', 'Кредитный аналитик', 'Менеджер по работе с клиентами', 'Специалист операционного контроля', 'Риск-менеджер', 'Менеджер банковских продуктов', 'Ведущий специалист', 'Методолог банковских процессов', 'Клиентский менеджер', 'Специалист казначейских операций'];
export const POLL_DEPS = POLL_CONDITIONS['Подразделение'];

/** текстовые ответы для «Строка текста», «Многострочный текст» и «Другое» */
const TEXTS = [
  'Сократить число согласований по заявкам',
  'Больше обратной связи от руководителя',
  'Нужен второй монитор',
  'Хотелось бы гибкий график',
  'Перенести планерки на утро',
  'Обновить ноутбуки в отделениях',
  'Больше обучения по продуктам',
  'Все устраивает, спасибо',
  'Сообщу в службу ИБ и отключу компьютер от сети',
  'Позвоню руководителю и в ИБ, ничего не буду удалять',
  'Опишу инцидент в заявке и сохраню письмо',
  'Улучшить связь между подразделениями',
];

/** псевдослучайное число 0…1 по строке-ключу */
function rnd(key: string): number {
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}
/** веса → числа ответов, в сумме n */
function split(n: number, w: number[]): number[] {
  const s = w.reduce((a, b) => a + b, 0) || 1;
  const out = w.map((x) => Math.floor((x / s) * n));
  let rest = n - out.reduce((a, b) => a + b, 0);
  for (let i = 0; rest > 0; i = (i + 1) % out.length, rest--) out[i]++;
  return out;
}
const pad = (n: number) => String(n).padStart(2, '0');
const toDate = (d: string) => {
  const [a, m, y] = d.split('.').map(Number);
  return new Date(y, m - 1, a);
};
const fmt = (d: Date) => pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();

/** разделы опроса: сохраненные или из шаблона */
export function pollSections(p: Poll): PollSection[] {
  return p.sec ?? POLL_TEMPLATES[p.tpl].sec;
}

/** опрос одной процедуры: ее участники, прошедшие и период (до окончания процедуры, иначе — до следующей процедуры или конца опроса) */
function wavePoll(p: Poll, w: PollWave): Poll {
  const next = p.waves![p.waves!.indexOf(w) + 1];
  return { ...p, n: p.n + ' · ' + w.n, waves: undefined, total: w.total, done: w.done, start: w.date || p.start, end: w.end || (next ? next.date : p.end) };
}

/**
 * Итоги опроса для дашборда: wave — id процедуры (итоги одной волны); без него у опроса с процедурами — общие итоги по всем волнам
 * (участники всех волн, динамика по всему периоду, этапы и ответы — суммы по волнам).
 */
export function pollStats(p: Poll, wave = ''): PollStats {
  const ws = p.waves ?? [];
  if (!ws.length) return baseStats(p);
  const one = ws.find((w) => w.id === wave);
  if (one) return tagWave(baseStats(wavePoll(p, one)), one);
  return mergeStats(p, ws.map((w) => tagWave(baseStats(wavePoll(p, w)), w)));
}
function tagWave(s: PollStats, w: PollWave): PollStats {
  s.parts.forEach((x) => (x.wave = w.n));
  return s;
}
/** общие итоги по всем процедурам */
function mergeStats(p: Poll, l: PollStats[]): PollStats {
  const test = p.kind === 'Тест';
  const parts = l.flatMap((s) => s.parts).sort((a, b) => ['Завершен', 'В работе', 'Ожидает'].indexOf(a.st) - ['Завершен', 'В работе', 'Ожидает'].indexOf(b.st));
  const starts = p.waves!.map((w) => toDate(w.date || p.start));
  const start = new Date(Math.min(...starts.map(Number)));
  const end = p.end !== '—' ? toDate(p.end) : new Date(2026, 8, 30);
  const today = new Date(2026, 8, 30);
  const last = end < today ? end : today;
  const span = Math.max(1, Math.round((+last - +start) / 864e5));
  const funnel = l[0].funnel.map(([k], i) => [k, l.reduce((a, s) => a + s.funnel[i][1], 0)] as [string, number]);
  // вопросы: суммы ответов и распределений, средние — взвешенные по числу ответов
  const questions = l[0].questions.map((q0, qi) => {
    const qs = l.map((s) => s.questions[qi]);
    const answered = qs.reduce((a, q) => a + q.answered, 0);
    const wavg = (f: (q: PollQStat) => number | null | undefined) => {
      const v = qs.filter((q) => f(q) != null && q.answered);
      const n = v.reduce((a, q) => a + q.answered, 0);
      return n ? Math.round((v.reduce((a, q) => a + f(q)! * q.answered, 0) / n) * 10) / 10 : null;
    };
    const right = wavg((q) => q.right);
    const avg = wavg((q) => q.avg);
    return {
      ...q0,
      answered,
      skipped: qs.reduce((a, q) => a + q.skipped, 0),
      right: right == null ? null : Math.round(right),
      avg: avg ?? undefined,
      dist: q0.dist.map(([k], i) => [k, qs.reduce((a, q) => a + (q.dist[i]?.[1] ?? 0), 0)] as [string, number]),
      rows: q0.rows?.map(([r], ri) => [r, q0.rows![ri][1].map((_, ci) => qs.reduce((a, q) => a + (q.rows?.[ri]?.[1][ci] ?? 0), 0))] as [string, number[]]),
      rank: q0.rank?.map(([o]) => {
        const xs = qs.map((q) => q.rank?.find((r) => r[0] === o)).filter(Boolean) as [string, number, number][];
        return [o, Math.round((xs.reduce((a, r) => a + r[1], 0) / (xs.length || 1)) * 10) / 10, Math.round(xs.reduce((a, r) => a + r[2], 0) / (xs.length || 1))] as [string, number, number];
      }).sort((a, b) => a[1] - b[1]),
      texts: q0.texts ? qs.flatMap((q) => q.texts ?? []).slice(0, 40) : undefined,
    } as PollQStat;
  });
  return { parts, days: daysOf(parts, start, span), funnel, deps: depsOf(parts, test), questions };
}
/** динамика: завершили нарастающим итогом по дням */
function daysOf(parts: PollPart[], start: Date, span: number): [string, number][] {
  const days: [string, number][] = [];
  for (let d = 0; d <= span; d++) {
    const date = new Date(+start + d * 864e5);
    const cnt = parts.filter((x) => x.doneAt && +toDate(x.doneAt) <= +date).length;
    days.push([fmt(date).slice(0, 5), cnt]);
  }
  return days;
}
/** подразделения: тест — средний балл, опрос — доля завершивших */
function depsOf(parts: PollPart[], test: boolean): [string, number, number][] {
  return POLL_DEPS.map((d) => {
    const ps = parts.filter((x) => x.dep === d);
    const fin = ps.filter((x) => x.st === 'Завершен');
    const v = test ? (fin.length ? Math.round(fin.reduce((a, x) => a + (x.score ?? 0), 0) / fin.length) : 0) : ps.length ? Math.round((fin.length / ps.length) * 100) : 0;
    return [d, v, ps.length] as [string, number, number];
  })
    .filter((d) => d[2] > 0)
    .sort((a, b) => b[1] - a[1]);
}

/** итоги опроса (или одной процедуры) */
function baseStats(p: Poll): PollStats {
  const key = p.n;
  const test = p.kind === 'Тест';
  const total = p.total, done = p.done;
  const inWork = Math.min(total - done, Math.round((total - done) * 0.45));
  const start = p.start !== '—' ? toDate(p.start) : new Date(2026, 8, 1);
  const end = p.end !== '—' ? toDate(p.end) : new Date(2026, 8, 30);
  const today = new Date(2026, 8, 30);
  const last = end < today ? end : today;
  const span = Math.max(1, Math.round((+last - +start) / 864e5));

  // участники: сначала завершившие, затем в работе, затем ожидающие
  const parts: PollPart[] = Array.from({ length: total }, (_, i) => {
    const f = rnd(key + 'g' + i) < 0.55;
    const k = i * 7 + 3;
    const n = f ? F_LAST[k % F_LAST.length] + ' ' + F_FIRST[Math.floor(k / F_LAST.length) % F_FIRST.length] : M_LAST[k % M_LAST.length] + ' ' + M_FIRST[Math.floor(k / M_LAST.length) % M_FIRST.length];
    const st: PollPartStatus = i < done ? 'Завершен' : i < done + inWork ? 'В работе' : 'Ожидает';
    const dep = POLL_DEPS[Math.floor(rnd(key + 'd' + i) * POLL_DEPS.length)];
    const day = Math.floor(Math.pow(rnd(key + 't' + i), 1.6) * span);
    const depBoost = (POLL_DEPS.indexOf(dep) % 3) * 4;
    const score = test && st === 'Завершен' ? Math.min(100, Math.round(55 + rnd(key + 's' + i) * 40 + depBoost)) : null;
    return {
      n,
      pos: POSTS[Math.floor(rnd(key + 'p' + i) * POSTS.length)],
      dep,
      st,
      tries: st === 'Ожидает' ? 0 : test ? 1 + Math.floor(Math.pow(rnd(key + 'a' + i), 2) * 3) : 1,
      score,
      doneAt: st === 'Завершен' ? fmt(new Date(+start + day * 864e5)) : '',
      min: st === 'Завершен' ? Math.round(5 + rnd(key + 'm' + i) * 14) : 0,
    };
  });

  const days = daysOf(parts, start, span);

  const opened = Math.min(total, done + inWork + Math.round((total - done - inWork) * 0.4));
  const funnel: [string, number][] = [
    ['Назначен', total],
    ['Открыли', opened],
    ['Начали', done + inWork],
    ['Завершили', done],
  ];

  const deps = depsOf(parts, test);

  // вопросы
  const questions: PollQStat[] = [];
  pollSections(p).forEach((s, si) =>
    s.q.forEach((q, qi) => {
      const k = key + '|' + si + '.' + qi;
      const answered = q.req ? done : Math.round(done * (0.55 + rnd(k + 'r') * 0.3));
      questions.push({ q, num: si + 1 + '.' + (qi + 1), sec: s.name, answered, skipped: done - answered, ...answers(q, k, answered, test) });
    }),
  );
  return { parts, days, funnel, deps, questions };
}

/** распределение ответов по типу вопроса */
function answers(q: PollQuestion, k: string, n: number, test: boolean): Pick<PollQStat, 'right' | 'dist' | 'rows' | 'rank' | 'texts' | 'avg'> {
  const ok = q.ok ?? [];
  // у верного варианта — больший вес, у остальных — разный
  const w = (opts: string[]) => opts.map((_, i) => (ok.includes(i) ? 3 + rnd(k + 'w' + i) * 3 : 0.4 + rnd(k + 'w' + i) * 2));
  switch (q.t) {
    case 'single':
    case 'drop':
    case 'yesno': {
      const opts = [...q.opts, ...(q.other ? ['Другое'] : [])];
      const c = split(n, w(opts));
      const right = test && ok.length ? Math.round((ok.reduce((a, i) => a + c[i], 0) / (n || 1)) * 100) : null;
      return { right, dist: opts.map((o, i) => [o, c[i]] as [string, number]), texts: q.other ? TEXTS.slice(0, 5) : undefined };
    }
    case 'multi': {
      // доля выбравших каждый вариант (можно несколько)
      const opts = [...q.opts, ...(q.other ? ['Другое'] : [])];
      const c = opts.map((_, i) => Math.round(n * (ok.length ? (ok.includes(i) ? 0.7 + rnd(k + i) * 0.25 : 0.05 + rnd(k + i) * 0.25) : 0.15 + rnd(k + i) * 0.6)));
      const right = test && ok.length ? Math.round(0.45 * 100 + rnd(k + 'ok') * 30) : null;
      return { right, dist: opts.map((o, i) => [o, c[i]] as [string, number]), texts: q.other ? TEXTS.slice(2, 7) : undefined };
    }
    case 'rating':
    case 'enps': {
      const lo = q.t === 'enps' || q.scale === 11 ? 0 : 1, hi = q.t === 'enps' || q.scale === 11 ? 10 : q.scale;
      const vals = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
      // смещение к верхней части шкалы
      const c = split(n, vals.map((v) => Math.pow((v - lo + 1) / (hi - lo + 1), 1.6) + rnd(k + v) * 0.3));
      const avg = Math.round((vals.reduce((a, v, i) => a + v * c[i], 0) / (n || 1)) * 10) / 10;
      return { right: null, dist: vals.map((v, i) => [String(v), c[i]] as [string, number]), avg };
    }
    case 'slider': {
      const mn = +q.mn || 0, mx = +q.mx || 100, step = (mx - mn) / 5;
      const bins = Array.from({ length: 5 }, (_, i) => Math.round(mn + i * step) + '–' + Math.round(mn + (i + 1) * step));
      const c = split(n, [1.2, 2.6, 3.2, 1.8, 0.8].map((x, i) => x + rnd(k + i) * 0.6));
      const avg = Math.round(c.reduce((a, x, i) => a + x * (mn + (i + 0.5) * step), 0) / (n || 1));
      return { right: null, dist: bins.map((b, i) => [b, c[i]] as [string, number]), avg };
    }
    case 'matrix': {
      const rows = q.rows.map((r, ri) => [r, split(n, q.opts.map((_, i) => 0.5 + rnd(k + ri + '-' + i) * (i === ri % q.opts.length ? 4 : 2)))] as [string, number[]]);
      return { right: null, dist: q.opts.map((o) => [o, 0] as [string, number]), rows };
    }
    case 'rank': {
      // средняя позиция: верный порядок (порядок вариантов) выбирают чаще
      const rank = q.opts
        .map((o, i) => [o, Math.round((1 + i * 0.7 + rnd(k + i) * 1.4) * 10) / 10, Math.round((i === 0 ? 48 : 8) + rnd(k + 'f' + i) * 14)] as [string, number, number])
        .sort((a, b) => a[1] - b[1]);
      const right = test ? Math.round(38 + rnd(k + 'ok') * 30) : null;
      return { right, dist: [], rank };
    }
    case 'date': {
      const months = ['Май', 'Июнь', 'Июль', 'Август', 'Сентябрь'];
      const c = split(n, months.map((_, i) => 1 + i * 0.6 + rnd(k + i)));
      return { right: null, dist: months.map((m, i) => [m, c[i]] as [string, number]) };
    }
    case 'file': {
      const files = Array.from({ length: Math.min(8, Math.round(n * 0.4)) }, (_, i) => ['Предложение', 'Схема процесса', 'Фото рабочего места', 'Презентация'][i % 4] + ' ' + (i + 1) + ['.pdf', '.pptx', '.jpg', '.docx'][i % 4]);
      return { right: null, dist: [], texts: files };
    }
    default: {
      // строка и многострочный текст: часть ответов повторяется
      const texts = Array.from({ length: Math.min(n, 40) }, (_, i) => TEXTS[Math.floor(rnd(k + 't' + i) * TEXTS.length)]);
      return { right: null, dist: [], texts };
    }
  }
}
