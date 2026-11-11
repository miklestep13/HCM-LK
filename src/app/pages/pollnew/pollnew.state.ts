import { Injectable, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { audGroup, audMatch } from '../../data/audience.data';
import { COMM_POOL } from '../../data/comm.data';
import { materialToPoll, pollToMaterial } from '../../data/builder.data';
import { POLL_MAIL, POLL_TEMPLATES } from '../../data/polls.data';
import { BldMaterial } from '../../interface/builder';
import { Member } from '../../interface/member';
import { Poll, PollKind, PollQuestion, PollSection, PollStatus, PollView, PollWave } from '../../interface/poll';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { PollsState } from '../polls/polls.state';

/** шаги формы */
export const POLL_STEPS = ['Общая информация', 'Вопросы', 'Процедуры опроса', 'Публикация'];
const deep = <T>(o: T): T => JSON.parse(JSON.stringify(o));
const iso = (d: string) => d.split('.').reverse().join('');
/** сегодняшняя дата «дд.мм.гггг» — дата начала нового опроса по умолчанию */
const today = () => new Date().toLocaleDateString('ru-RU');
/** сотрудники для отбора участников (без групп) */
const POOL: Member[] = COMM_POOL.filter((m) => !m.kind);
let waveSeq = 0;
/** новая процедура: «Процедура N», дата назначения (время — 10:00), без окончания, условия — пустая группа */
const newWave = (n: number, date: string): PollWave => ({
  id: 'nw' + Date.now().toString(36) + waveSeq++, n: 'Процедура ' + n, date, time: date ? '10:00' : '', end: '', endTime: '',
  rules: [audGroup()], man: [], excl: [], total: 0, done: 0,
});

/**
 * Форма опроса по шагам (новый с нуля или редактирование): 1 — общая информация (наименование, описание, вид опроса, дата начала — у нового сегодня, дата окончания — необязательная,
 * статус; настройки — анонимность), 2 — вопросы (разделы, выбранный вопрос), 3 — процедуры опроса (волны: у каждой дата и время назначения
 * и окончания, участники — условия отбора и добавленные вручную; так можно сразу запланировать несколько волн), 4 — публикация (письмо, уведомление).
 * «Далее» проверяет текущий шаг. Вопросы — изменяемые объекты; после правки — touch(), чтобы перерисовать структуру и предпросмотр.
 */
@Injectable()
export class PollnewState {
  private readonly polls = inject(PollsState);
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);

  /** редактируемый опрос (idx) или новый */
  readonly editIdx = signal<number | null>(null);
  readonly step = signal(0);
  /** последний открытый шаг (на него и раньше можно перейти в степпере) */
  readonly reached = signal(0);
  readonly n = signal('');
  /** тип в форме не выбирается: новый — опрос, у редактируемого — как был (тест — с проходным баллом) */
  readonly kind = signal<PollKind>('Опрос');
  /** вид: вопрос за вопросом (только вопросы, по одному на экране) или по модулям (модуль целиком на экране) */
  readonly view = signal<PollView>('mods');
  readonly status = signal<PollStatus>('Черновик');
  readonly start = signal('');
  readonly end = signal('');
  readonly d = signal('');
  readonly anon = signal(true);
  /** тест: проходной балл, % */
  readonly pass = signal(80);
  readonly sec = signal<PollSection[]>([{ name: 'Раздел 1', q: [] }]);
  readonly sel = signal<PollQuestion | null>(null);
  /** материал конструктора на шаге «Вопросы» — собирается из разделов при входе на шаг (тип мог измениться) */
  readonly bld = signal<BldMaterial>(pollToMaterial([], 'poll'));
  /**
   * процедуры (волны) опроса: у каждой название, дата и время назначения и окончания, участники — условия отбора (widgets/audience)
   * плюс добавленные вручную и минус убранные из подобранных. Объекты процедур не меняются на месте — правка заменяет процедуру в списке.
   */
  readonly waves = signal<PollWave[]>([]);
  /** раскрытая процедура (id) */
  readonly openWave = signal<string | null>(null);
  readonly mail = signal('');
  readonly notify = signal(true);
  /** подсветка незаполненных полей после «Далее» / «Сохранить» */
  readonly bad = signal<string[]>([]);

  readonly qCount = computed(() => this.sec().reduce((a, s) => a + s.q.length, 0));
  /** участники каждой процедуры (id → список): один массив на правку — таблица участников не пересоздается */
  readonly waveList = computed(() => new Map(this.waves().map((w) => [w.id, this.waveMembers(w)])));
  /** участников во всех процедурах */
  readonly count = computed(() => this.waves().reduce((a, w) => a + this.waveCount(w), 0));
  readonly pool = POOL;

  /** открыть форму: poll — номер опроса для редактирования, иначе новый */
  open(poll: string): void {
    const p = poll ? this.polls.byIdx(+poll) : undefined;
    this.editIdx.set(p ? p.idx : null);
    this.step.set(0);
    this.reached.set(p ? POLL_STEPS.length - 1 : 0);
    this.bad.set([]);
    const t = p ? POLL_TEMPLATES[p.tpl] : null;
    this.n.set(p?.n ?? '');
    this.kind.set(p?.kind ?? 'Опрос');
    this.start.set(p ? (p.start !== '—' ? p.start : '') : today());
    this.end.set(p && p.end !== '—' ? p.end : '');
    this.d.set(p ? (p.d ?? t!.d) : '');
    this.anon.set(p ? p.anon : true);
    this.view.set(p?.view ?? (p?.kind === 'Пульс-опрос' ? 'step' : 'mods'));
    this.status.set(p?.sts ?? 'Черновик');
    this.pass.set(p?.pass ?? 80);
    this.sec.set(p ? deep(p.sec ?? t!.sec) : [{ name: 'Раздел 1', q: [] }]);
    // процедуры: сохраненные; у опроса без процедур — одна, из его участников и дат; у нового — одна пустая с датой начала
    const legacy = (p: Poll): PollWave => ({
      ...newWave(1, p.start !== '—' ? p.start : ''),
      end: p.end !== '—' ? p.end : '',
      endTime: p.end !== '—' ? '18:00' : '',
      rules: p.rules ? deep(p.rules) : [{ c: [{ f: 'Подразделение', op: 'in', v: ['Управление рисков'] }] }],
      man: p.man ? deep(p.man) : [],
      excl: p.excl ? [...p.excl] : [],
      total: p.total,
      done: p.done,
    });
    this.waves.set(p ? (p.waves ? deep(p.waves) : [legacy(p)]) : [newWave(1, this.start())]);
    this.openWave.set(p ? null : this.waves()[0].id);
    this.mail.set(POLL_MAIL);
    this.notify.set(true);
    this.sel.set(this.sec()[0].q[0] ?? null);
  }

  // ——— шаги ———
  go(i: number): void {
    if (i === 1) this.bld.set(this.toBld());
    this.step.set(i);
    this.reached.set(Math.max(this.reached(), i));
    window.scrollTo({ top: 0 });
  }
  /** «Далее»: проверка текущего шага, затем следующий */
  next(): void {
    if (this.check(this.step())) this.go(this.step() + 1);
  }
  back(): void {
    this.go(this.step() - 1);
  }
  /** проверка шага: false — показали ошибку и остаемся */
  private check(i: number): boolean {
    if (i === 0) {
      // дата окончания необязательная: проверяем, только если указана
      const bad = [!this.n().trim() && 'n', !this.start() && 'start'].filter(Boolean) as string[];
      if (!bad.length && this.end() && iso(this.end()) < iso(this.start())) bad.push('end');
      this.bad.set(bad);
      if (bad.length) {
        this.toast.show('Проверьте форму', bad.length === 1 && bad[0] === 'end' && this.end() ? 'Дата окончания раньше даты начала.' : 'Заполните обязательные поля.');
        return false;
      }
    }
    if (i === 1) {
      if (!this.qCount()) {
        this.toast.show('Проверьте форму', 'Добавьте хотя бы один вопрос.');
        return false;
      }
      for (const s of this.sec())
        for (const q of s.q)
          if (!q.n.trim() || (['single', 'multi', 'drop', 'rank', 'yesno', 'matrix'].includes(q.t) && q.opts.some((o) => !o.trim())) || (q.t === 'matrix' && (!q.rows.length || q.rows.some((r) => !r.trim())))) {
            this.sel.set(q);
            this.toast.show('Проверьте форму', 'У вопроса ' + this.num(q) + (q.n.trim() ? ' есть пустые варианты ответа.' : ' нет текста.'));
            return false;
          }
    }
    if (i === 2) {
      // у каждой процедуры — дата назначения и участники, окончание (если есть) не раньше назначения
      const ws = this.waves();
      const w = ws.find((x) => !x.date || !this.waveCount(x) || (x.end && iso(x.end) < iso(x.date)));
      if (!ws.length || w) {
        if (w) this.openWave.set(w.id);
        this.bad.set(!w ? [] : !w.date ? ['wdate'] : !this.waveCount(w) ? [] : ['wend']);
        this.toast.show(
          'Проверьте форму',
          !w ? 'Добавьте процедуру опроса.' : !w.date ? 'Укажите дату назначения в «' + w.n + '».' : !this.waveCount(w) ? 'Выберите участников в «' + w.n + '».' : 'Дата окончания раньше даты назначения в «' + w.n + '».',
        );
        return false;
      }
    }
    return true;
  }
  isBad(k: string): boolean {
    return this.bad().includes(k);
  }

  // ——— вопросы (конструктор) ———
  /** разделы опроса → материал: тест — с верными ответами; «Вопрос за вопросом» — только вопросы, по одному на экране, «По модулям» — модуль целиком */
  private toBld(): BldMaterial {
    const m = pollToMaterial(this.sec(), this.kind() === 'Тест' ? 'test' : 'poll', this.n());
    m.paging = 'module';
    m.pass = this.pass();
    if (this.view() === 'step') {
      m.one = true;
      m.paging = 'block';
      const all = m.secs[0].mods;
      m.secs[0].mods = [{ ...(all[0] ?? { id: 'm1', blocks: [] }), t: '', d: '', blocks: all.flatMap((x) => x.blocks) }];
    }
    return m;
  }
  /** правка в конструкторе → разделы опроса («Вопрос за вопросом» — один раздел «Вопросы») */
  fromBld(m: BldMaterial): void {
    const sec = materialToPoll(m);
    if (m.one && sec[0]) sec[0].name = 'Вопросы';
    this.sec.set(sec.length ? sec : [{ name: 'Раздел 1', q: [] }]);
  }

  // ——— вопросы ———
  /** перерисовать после правки вопроса или раздела */
  touch(): void {
    this.sec.set([...this.sec()]);
  }
  /** номер вопроса «2.1» */
  num(q: PollQuestion): string {
    const s = this.sec();
    for (let i = 0; i < s.length; i++) {
      const k = s[i].q.indexOf(q);
      if (k >= 0) return i + 1 + '.' + (k + 1);
    }
    return '';
  }

  // ——— процедуры ———
  /** участники процедуры: добавленные вручную — сверху, затем подобранные по условиям (кроме убранных) */
  waveMembers(w: PollWave): Member[] {
    const auto = audMatch(POOL, w.rules);
    return [...w.man.filter((m) => !auto.some((a) => a.n === m.n)), ...auto.filter((m) => !w.excl.includes(m.n))];
  }
  waveCount(w: PollWave): number {
    return (this.waveList().get(w.id) ?? this.waveMembers(w)).filter((m) => m.n).length;
  }
  /** правка процедуры: замена в списке */
  setWave(w: PollWave, x: Partial<PollWave>): void {
    this.waves.update((l) => l.map((v) => (v.id === w.id ? { ...v, ...x } : v)));
  }
  /** правка таблицы участников: новые строки — «вручную», убранные подобранные — в исключения */
  setWaveMembers(w: PollWave, list: Member[]): void {
    const auto = audMatch(POOL, w.rules);
    this.setWave(w, {
      man: list.filter((m) => !auto.some((a) => a.n === m.n)),
      excl: [...new Set([...w.excl.filter((n) => !list.some((m) => m.n === n)), ...auto.filter((a) => !list.some((m) => m.n === a.n)).map((a) => a.n)])],
    });
  }
  /** новая процедура — внизу и раскрыта; первая — с датой начала опроса */
  addWave(): void {
    const l = this.waves();
    const w = newWave(l.length + 1, l.length ? '' : this.start());
    this.waves.set([...l, w]);
    this.openWave.set(w.id);
  }
  delWave(w: PollWave): void {
    this.waves.update((l) => l.filter((v) => v.id !== w.id));
    if (this.openWave() === w.id) this.openWave.set(null);
  }

  /** «Сохранить черновик» / «Сохранить и опубликовать»: проверки шагов (у публикации — и процедур), затем — в список опросов */
  save(pub: boolean): void {
    for (const i of pub ? [0, 1, 2] : [0, 1])
      if (!this.check(i)) {
        this.step.set(i);
        return;
      }
    // статус из формы; черновик при публикации — по дате начала
    const sts: PollStatus = !pub ? 'Черновик' : this.status() !== 'Черновик' ? this.status() : iso(this.start()) > iso(today()) ? 'Запланирован' : 'Активен';
    const waves = this.waves().map((w) => ({ ...deep(w), man: w.man.filter((m) => m.n), total: this.waveCount(w), done: Math.min(w.done, this.waveCount(w)) }));
    const e: Omit<Poll, 'idx'> = {
      n: this.n().trim(), kind: this.kind(), view: this.view(), d: this.d(), anon: this.anon(), pass: this.kind() === 'Тест' ? this.pass() : undefined, tpl: 0, sec: deep(this.sec()),
      waves, total: this.count(), done: waves.reduce((a, w) => a + w.done, 0), start: this.start(), end: this.end() || '—',
      st: sts === 'Завершен' ? 'done' : sts === 'В архиве' ? 'arch' : 'act', sts, off: this.count() % 24,
    };
    this.polls.save(e, this.editIdx() ?? undefined);
    this.nav.go('polls');
    this.toast.show('Готово', pub ? 'Опрос опубликован' + (this.notify() ? ', участники получат уведомление в дату назначения своей процедуры.' : '.') : 'Черновик сохранен.');
  }
}
