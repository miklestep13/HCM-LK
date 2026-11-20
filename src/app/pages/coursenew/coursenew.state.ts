import { Injectable, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { audGroup, audMatch } from '../../data/audience.data';
import { bldDemoAllBlocks, bldDemoCourse, newMaterial } from '../../data/builder.data';
import { COMM_POOL } from '../../data/comm.data';
import { COURSE_DEMO_INFO, COURSE_DEMO_WAVES, COURSE_ROLES, COURSE_STEPS } from '../../data/coursenew.data';
import { BldMaterial } from '../../interface/builder';
import { EvMember, Member } from '../../interface/member';
import { PollWave } from '../../interface/poll';
import { ToastService } from '../../shared/ui/toast/toast.service';

const deep = <T>(o: T): T => JSON.parse(JSON.stringify(o));
const iso = (d: string) => d.split('.').reverse().join('');
/** сотрудники для отбора участников (без групп) */
const POOL: Member[] = COMM_POOL.filter((m) => !m.kind);
let waveSeq = 0;
/** новая процедура: «Процедура N», дата назначения (время — 10:00), без окончания, условия — пустая группа */
const newWave = (n: number, date: string): PollWave => ({
  id: 'cw' + Date.now().toString(36) + waveSeq++,
  n: 'Процедура ' + n,
  date,
  time: date ? '10:00' : '',
  end: '',
  endTime: '',
  rules: [audGroup()],
  man: [],
  excl: [],
  total: 0,
  done: 0,
});

/**
 * Форма курса по шагам: общая информация, структура (конструктор), процедуры назначения (волны: дата, условия отбора, участники).
 * Демо (dev-панель): пустой курс (по умолчанию), пример «Бизнес-анализ в банке» или все виды модулей.
 */
@Injectable()
export class CoursenewState {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);

  readonly step = signal(0);
  readonly reached = signal(0);
  readonly demo = signal<'empty' | 'demo' | 'all'>('empty');
  readonly n = signal('');
  readonly start = signal('');
  readonly end = signal('');
  readonly status = signal('Черновик');
  readonly author = signal('');
  readonly tags = signal<string[]>([]);
  readonly lead = signal('');
  readonly d = signal('');
  readonly time = signal('');
  readonly cover = signal<string | null>(null);
  /** критерий успешности: все учебные материалы просмотрены */
  readonly allSeen = signal(true);
  readonly mat = signal<BldMaterial>(newMaterial('course'));
  readonly bad = signal<string[]>([]);
  /**
   * процедуры назначения: у каждой название, дата и время назначения и окончания, участники — условия отбора (widgets/audience)
   * плюс добавленные вручную и минус убранные из подобранных.
   */
  readonly waves = signal<PollWave[]>([]);
  /** раскрытые процедуры (можно несколько сразу) */
  readonly openWaves = signal<ReadonlySet<string>>(new Set());
  readonly roles = COURSE_ROLES;
  readonly pool = POOL;
  /** участники каждой процедуры (id → список) */
  readonly waveList = computed(() => new Map(this.waves().map((w) => [w.id, this.waveMembers(w)])));
  /** участники процедуры строками таблицы «Участники события» */
  readonly waveRows = computed(
    () =>
      new Map(
        this.waves().map((w) => [
          w.id,
          (this.waveList().get(w.id) ?? []).map(
            (m, i): EvMember => ({
              id: 'cw-' + (m.n || 'new' + i),
              n: m.n,
              pos: m.pos,
              dep: m.dep,
              av: m.av,
              type: 'Сотрудник',
              roles: [m.role || COURSE_ROLES[0]],
              from: w.date,
            }),
          ),
        ]),
      ),
  );

  /** демо: пустая форма или пример курса */
  load(k: 'empty' | 'demo' | 'all'): void {
    this.demo.set(k);
    const m = k === 'all' ? bldDemoAllBlocks() : k === 'demo' ? bldDemoCourse() : newMaterial('course');
    const x = k !== 'empty' ? COURSE_DEMO_INFO : { start: '', end: '', status: 'Черновик', author: '', tags: [] as string[], lead: '', d: '', time: '', pass: 80 };
    this.n.set(m.t);
    this.start.set(x.start);
    this.end.set(x.end);
    this.status.set(x.status);
    this.author.set(x.author);
    this.tags.set([...x.tags]);
    this.lead.set(x.lead);
    this.d.set(x.d);
    this.time.set(x.time);
    this.cover.set(k !== 'empty' ? 'assets/img/courses/crs-2.webp' : null);
    this.allSeen.set(true);
    m.pass ??= x.pass;
    this.mat.set(m);
    this.bad.set([]);
    this.step.set(0);
    this.reached.set(k !== 'empty' ? COURSE_STEPS.length - 1 : 0);
    // пустой — одна новая процедура; пример / все виды — две демо-процедуры с условиями
    if (k === 'empty') {
      const w = newWave(1, '');
      this.waves.set([w]);
      this.openWaves.set(new Set([w.id]));
    } else {
      this.waves.set(deep(COURSE_DEMO_WAVES));
      const first = this.waves()[0]?.id;
      this.openWaves.set(first ? new Set([first]) : new Set());
    }
  }
  /** порядок просмотра хранится в материале — его же видит конструктор */
  setOrder(o: 'free' | 'seq'): void {
    this.mat().order = o;
    this.mat.set({ ...this.mat() });
  }
  /** критерий успешности: проходной процент — тоже в материале */
  setPass(p: number): void {
    this.mat().pass = p;
    this.mat.set({ ...this.mat() });
  }
  go(i: number): void {
    // название курса — и в конструкторе (предпросмотр)
    if (i === 1) this.mat().t = this.n().trim();
    this.step.set(i);
    this.reached.set(Math.max(this.reached(), i));
    window.scrollTo({ top: 0 });
  }
  next(): void {
    if (this.check(this.step())) this.go(this.step() + 1);
  }
  back(): void {
    this.go(this.step() - 1);
  }
  isBad(k: string): boolean {
    return this.bad().includes(k);
  }
  private check(i: number): boolean {
    if (i === 0 && !this.n().trim()) {
      this.bad.set(['n']);
      this.toast.show('Проверьте форму', 'Укажите название курса.');
      return false;
    }
    if (i === 0 && this.start() && this.end() && iso(this.end()) < iso(this.start())) {
      this.bad.set(['end']);
      this.toast.show('Проверьте форму', 'Дата окончания раньше даты начала.');
      return false;
    }
    if (i === 1 && !this.mat().secs.some((s) => s.mods.some((m) => m.blocks.length))) {
      this.toast.show('Проверьте форму', 'Добавьте хотя бы один блок в модуль курса.');
      return false;
    }
    if (i === 2) {
      const ws = this.waves();
      const w = ws.find((x) => !x.date || !this.waveCount(x) || (x.end && iso(x.end) < iso(x.date)));
      if (!ws.length || w) {
        if (w) this.openWave(w.id);
        this.bad.set(!w ? [] : !w.date ? ['wdate'] : !this.waveCount(w) ? [] : ['wend']);
        this.toast.show(
          'Проверьте форму',
          !w
            ? 'Добавьте процедуру назначения.'
            : !w.date
              ? 'Укажите дату назначения в «' + w.n + '».'
              : !this.waveCount(w)
                ? 'Выберите участников в «' + w.n + '».'
                : 'Дата окончания раньше даты назначения в «' + w.n + '».',
        );
        return false;
      }
    }
    this.bad.set([]);
    return true;
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
  setWave(w: PollWave, x: Partial<PollWave>): void {
    this.waves.update((l) => l.map((v) => (v.id === w.id ? { ...v, ...x } : v)));
  }
  /** правка таблицы участников: новые строки — «вручную», убранные подобранные — в исключения */
  setWaveMembers(w: PollWave, list: Member[]): void {
    const auto = audMatch(POOL, w.rules);
    this.setWave(w, {
      man: list.filter((m) => !auto.some((a) => a.n === m.n)),
      excl: [
        ...new Set([
          ...w.excl.filter((n) => !list.some((m) => m.n === n)),
          ...auto.filter((a) => !list.some((m) => m.n === a.n)).map((a) => a.n),
        ]),
      ],
    });
  }
  /** правка таблицы участников (event-members) — сохраняем условия отбора */
  setWaveRows(w: PollWave, rows: EvMember[]): void {
    this.setWaveMembers(
      w,
      rows.map((r) => ({ n: r.n, pos: r.pos, dep: r.dep, av: r.av, role: r.roles[0] || COURSE_ROLES[0] })),
    );
  }
  /** процедура раскрыта? */
  isWaveOpen(id: string): boolean {
    return this.openWaves().has(id);
  }
  /** раскрыть процедуру (другие не закрываются) */
  openWave(id: string): void {
    this.openWaves.update((s) => new Set(s).add(id));
  }
  /** свернуть / раскрыть; можно держать открытыми несколько */
  toggleWave(id: string): void {
    this.openWaves.update((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  addWave(): void {
    const l = this.waves();
    const w = newWave(l.length + 1, l.length ? '' : this.start());
    this.waves.set([...l, w]);
    this.openWave(w.id);
  }
  delWave(w: PollWave): void {
    this.waves.update((l) => l.filter((v) => v.id !== w.id));
    this.openWaves.update((s) => {
      if (!s.has(w.id)) return s;
      const n = new Set(s);
      n.delete(w.id);
      return n;
    });
  }

  save(): void {
    for (const i of [0, 1, 2])
      if (!this.check(i)) return this.go(i);
    this.toast.show('Готово', 'Курс «' + this.n().trim() + '» сохранен.');
    this.nav.go('learn');
  }
}
