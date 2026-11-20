import { Injectable, computed, signal } from '@angular/core';
import { CP_CONDITIONS, CP_LEARN, CP_MY_GRADE, CP_MY_LEVELS, CP_STEPS, CP_TODAY, CP_WAYS } from '../../data/career-path.data';
import { CT_GRADES, CT_LEVELS, CT_ROLE, ctCompId } from '../../data/career-track.data';
import { CpCondition, CpReqRow, CpScenario, CpStep } from '../../interface/career-path';

/**
 * Карьерный трек сотрудника: сценарий демо, выбранная ступень дорожной карты, уровни и запросы на подтверждение.
 * Матрица грейдов — общий стандарт должности. Факт, даты присвоения и статусы курсов — показатели сотрудника.
 */
@Injectable({ providedIn: 'root' })
export class CareerStore {
  /** кто смотрит страницу: сотрудник видит свой трек, HR — карточку стандарта после создания */
  readonly viewer = signal<'emp' | 'hr'>('emp');
  /** грейд, открытый в карточке стандарта */
  readonly standardGrade = signal('Специалист');
  /** сценарий dev-панели */
  readonly scenario = signal<CpScenario>('closed');
  /** грейд, требования к которому открыты в дорожной карте; пусто — следующий */
  private readonly pick = signal('');
  /** запросы на подтверждение уровня: компетенция → эксперт и дата */
  private readonly requests = signal<Record<string, { expert: string; date: string }>>({});
  /** в сценарии «Перехода нет» сотрудник запросил ИПР — соединитель становится синим */
  private readonly asked = signal(false);

  /** текущий грейд сотрудника с учетом сценария */
  readonly myGrade = computed(() => {
    const s = this.scenario();
    return s === 'moved' ? 'Ведущий' : s === 'top' ? 'Главный' : CP_MY_GRADE;
  });
  /** следующий грейд; пусто — верхний */
  readonly nextGrade = computed(() => CT_GRADES[CT_GRADES.indexOf(this.myGrade()) + 1] || '');
  /** выбранная ступень */
  readonly grade = computed(() => this.pick() || this.nextGrade() || this.myGrade());
  /** трек есть и опубликован */
  readonly hasTrack = computed(() => !['norole', 'unpublished'].includes(this.scenario()));
  /** оценки еще не было */
  readonly noAssess = computed(() => this.scenario() === 'noassess');
  /** переход к следующему грейду заявлен: есть ИПР или план. Без них соединитель серый */
  readonly transition = computed(() => this.scenario() !== 'noplan' || this.asked());
  /** выбранный грейд еще не освоен — на него можно запросить ИПР */
  readonly developing = computed(() => CT_GRADES.indexOf(this.grade()) > CT_GRADES.indexOf(this.myGrade()));

  /** ступени: освоенные грейды зеленые, следующий синий только если переход заявлен */
  readonly steps = computed<CpStep[]>(() => {
    const my = CT_GRADES.indexOf(this.myGrade());
    const s = this.scenario();
    const aim = this.transition();
    return CP_STEPS.map((st, i) => {
      const state: CpStep['state'] = i <= my ? 'done' : aim && i === my + 1 ? 'aim' : 'future';
      let period = st.period, place = st.place;
      // демо-сценарии: «Смена грейда» — Ведущий с 09.2026; «Верхний грейд» — сжатая история до Главного
      if (s === 'moved') {
        if (st.grade === 'Старший') period = '01.2023 — 08.2026';
        if (st.grade === 'Ведущий') { period = 'с 09.2026'; place = 'Управление кредитования'; }
      }
      if (s === 'top') {
        if (st.grade === 'Старший') period = '01.2023 — 06.2024';
        if (st.grade === 'Ведущий') { period = '07.2024 — 08.2026'; place = 'Управление кредитования'; }
        if (st.grade === 'Главный') { period = 'с 09.2026'; place = 'Управление кредитования'; }
      }
      return { ...st, period, place, state };
    });
  });

  /** требования к компетенциям на выбранном грейде */
  readonly rows = computed<CpReqRow[]>(() => this.rowsOf(this.grade()));
  /** условия перехода на выбранный грейд */
  readonly conditions = computed<CpCondition[]>(() => this.condsOf(this.grade()));

  /** «Совпадает N из M» по выбранному грейду */
  readonly matched = computed(() => this.rows().filter((r) => r.status === 'Достигнут').length + this.conditions().filter((c) => c.status === 'Выполнено').length);
  readonly total = computed(() => this.rows().length + this.conditions().length);
  readonly lackN = computed(() => this.rows().filter((r) => r.status === 'Не хватает').length);
  readonly unratedN = computed(() => this.rows().filter((r) => r.status === 'Не оценен').length);
  readonly pendingN = computed(() => this.rows().filter((r) => r.status === 'На подтверждении').length);
  /** все требования выбранного грейда закрыты */
  readonly closed = computed(() => this.total() > 0 && this.matched() === this.total());
  /** доля пройденного пути до следующего грейда (для коннектора дорожной карты) */
  readonly progress = computed(() => {
    const next = this.nextGrade();
    if (!next) return 0;
    const rows = this.rowsOf(next), conds = this.condsOf(next);
    const total = rows.length + conds.length;
    const ok = rows.filter((r) => r.status === 'Достигнут').length + conds.filter((c) => c.status === 'Выполнено').length;
    return total ? Math.round((ok / total) * 100) : 0;
  });

  /** сколько компетенций выбранного грейда еще ниже требуемого уровня */
  gap(grade: string): number {
    return this.rowsOf(grade).filter((r) => r.status === 'Не хватает' || r.status === 'Не оценен').length;
  }
  /** сколько компетенций стандарта закрыто на освоенном грейде */
  closedCount(grade: string): number {
    return this.rowsOf(grade).length;
  }
  /** число способов развития, которые нужны для перехода на этот грейд */
  waysCount(grade: string): number {
    return this.rowsOf(grade).reduce((n, r) => n + (CP_WAYS[r.comp]?.filter((w) => w.grades.includes(grade)).length || 0), 0);
  }
  /**
   * Уровень, присвоенный на освоенном грейде.
   * На прошлых грейдах — уровень стандарта того грейда. На текущем — личная оценка, она может быть выше минимума.
   */
  assignedLevel(grade: string, comp: string): string {
    const row = CT_ROLE.comps.find((c) => c.name === comp);
    if (!row) return '';
    const gi = CT_GRADES.indexOf(grade);
    const need = row.levels[gi] || '';
    if (gi < CT_GRADES.indexOf(this.myGrade())) return need;
    if (this.noAssess()) return need;
    const cur = this.factOf(row.levels, comp);
    if (!cur || !need) return cur || need;
    return CT_LEVELS.indexOf(cur) >= CT_LEVELS.indexOf(need) ? cur : need;
  }
  /** Дата присвоения. На текущем грейде — из оценки, на прошлых — внутри периода ступени. */
  assignedDate(grade: string, comp: string): string {
    const step = this.steps().find((s) => s.grade === grade);
    const start = this.periodStart(step?.period || '');
    let date = start ? this.dayIn(start, comp) : '';
    if (grade === this.myGrade() && !this.noAssess()) {
      const src = this.myLevel(comp)?.source || '';
      const found = src.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (found) date = found[1];
      else if (/2025/.test(src)) date = this.dayIn('12.2025', comp);
      else if (!date) date = this.dayIn('12.2025', comp);
    }
    if (start && date && this.dateBefore(date, start)) date = this.dayIn(start, comp);
    return date;
  }

  /** открыть требования ступени (следующий грейд — по умолчанию) */
  select(grade: string): void {
    this.pick.set(grade === this.nextGrade() ? '' : grade);
  }
  setScenario(s: CpScenario): void {
    this.scenario.set(s);
    this.pick.set('');
    this.requests.set({});
    this.asked.set(false);
  }
  /** запросить ИПР: в сценарии без перехода соединитель к следующему грейду становится синим */
  askPlan(): void {
    this.asked.set(true);
  }
  /** отправить запрос на подтверждение уровня эксперту */
  request(comp: string, expert: string): void {
    this.requests.update((m) => ({ ...m, [comp]: { expert, date: CP_TODAY } }));
  }
  /** текущий уровень сотрудника по компетенции */
  level(comp: string): string {
    return this.myLevel(comp)?.level || '';
  }

  private periodStart(period: string): string {
    const raw = period.replace(/^с\s+/, '').split(' — ')[0].trim();
    return /^\d{2}\.\d{4}$/.test(raw) ? raw : '';
  }
  private dayIn(mmYYYY: string, comp: string): string {
    const [mm, yyyy] = mmYYYY.split('.');
    if (!mm || !yyyy) return '';
    const day = 8 + (comp.length % 17);
    return String(day).padStart(2, '0') + '.' + mm + '.' + yyyy;
  }
  private dateBefore(ddmmyyyy: string, mmYYYY: string): boolean {
    const parts = ddmmyyyy.split('.').map(Number);
    const start = mmYYYY.split('.').map(Number);
    if (parts.length < 3 || start.length < 2) return false;
    return parts[2] < start[1] || (parts[2] === start[1] && parts[1] < start[0]);
  }

  private myLevel(comp: string) {
    if (this.noAssess()) return null;
    return CP_MY_LEVELS.find((l) => l.comp === comp) || null;
  }

  /**
   * Факт не зависит от открытого грейда: это уровень сотрудника.
   * Он не ниже требований освоенного грейда. «Все соответствует» поднимает факт до следующего,
   * «Верхний грейд» — до Главного. «Оценок еще нет» оставляет факт пустым.
   */
  private factOf(levels: string[], comp: string): string {
    if (this.noAssess()) return '';
    const held = CT_GRADES.indexOf(this.myGrade());
    const floor = this.scenario() === 'top' ? CT_GRADES.length - 1 : this.scenario() === 'closed' ? Math.min(held + 1, CT_GRADES.length - 1) : held;
    const mine = this.myLevel(comp)?.level || levels[held] || '';
    const floorNeed = levels[floor] || '';
    if (!mine) return floorNeed;
    if (!floorNeed) return mine;
    return CT_LEVELS.indexOf(mine) >= CT_LEVELS.indexOf(floorNeed) ? mine : floorNeed;
  }

  private rowsOf(grade: string): CpReqRow[] {
    const gi = CT_GRADES.indexOf(grade);
    const req = this.requests();
    return CT_ROLE.comps
      .filter((c) => !!c.levels[gi])
      .map((c) => {
        const need = c.levels[gi];
        const my = this.myLevel(c.name);
        const cur = this.factOf(c.levels, c.name);
        const source = my?.source || 'Оценка за II полугодие 2025';
        const request = req[c.name];
        const status: CpReqRow['status'] = request
          ? 'На подтверждении'
          : !cur
            ? 'Не оценен'
            : CT_LEVELS.indexOf(cur) >= CT_LEVELS.indexOf(need)
              ? 'Достигнут'
              : 'Не хватает';
        return { id: ctCompId(c.name), comp: c.name, group: c.group, cur, need, status, source, hasLearn: !!CP_LEARN[c.name]?.length, request };
      })
      .sort((a, b) => this.pullRank(a.status) - this.pullRank(b.status));
  }

  /** Сверху компетенции, которые еще не дотягивают до требования: их и надо подтянуть. */
  private pullRank(status: CpReqRow['status']): number {
    if (status === 'Не хватает') return 0;
    if (status === 'Не оценен') return 1;
    if (status === 'На подтверждении') return 2;
    return 3;
  }

  private condsOf(grade: string): CpCondition[] {
    const list = CP_CONDITIONS[grade] || [];
    if (this.scenario() !== 'closed' && this.scenario() !== 'top') return list;
    return list.map((c) =>
      c.status === 'Выполнено'
        ? c
        : {
            ...c,
            fact: c.name === 'Образование' ? 'Высшее экономическое, СПбГЭУ' : /Стаж/.test(c.name) ? '2 года 2 месяца, с 07.2024' : /комитет/.test(c.name) ? '6 заявок за 2025–2026' : 'Соответствует, I полугодие 2026',
            status: 'Выполнено',
            hint: undefined,
          },
    );
  }
}
