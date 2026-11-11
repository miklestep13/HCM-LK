import { Injectable, computed, signal } from '@angular/core';
import { SURVEYS, SURVEY_DEMO_ANSWERS, SURVEY_FORM, SURVEY_NINE_BOX, SURVEY_NINE_DEMO } from '../../data/surveys.data';
import { Survey, SurveyAnswer, SurveyQuestion, SurveyStatus } from '../../interface/survey';

/** вид прохождения (dev-панель): обычный, узкий (колонка 760 px), 9-box (узкий, блок вопросов на каждого сотрудника) */
export type SurveyView = 'wide' | 'narrow' | 'nine';

/**
 * Прохождение опроса: опрос из списка, анкета (блоки и вопросы), ответы, проверка обязательных.
 * Все вопросы — на одной странице друг под другом; «Завершить» проверяет обязательные.
 * Демо: «В работе» — первые 7 ответов заполнены, «Завершен» — все ответы, только просмотр.
 * Состояние живет вместе со страницей (providers страницы).
 */
@Injectable()
export class SurveyPassState {
  readonly form = SURVEY_FORM;
  readonly survey = signal<Survey>(SURVEYS[1]);
  readonly answers = signal<Record<string, SurveyAnswer>>({});
  /** текст «Другое» в вопросах с несколькими вариантами */
  readonly other = signal<Record<string, string>>({});
  /** нажимали «Завершить» — подсвечиваем обязательные без ответа */
  readonly tried = signal(false);

  readonly nineBox = SURVEY_NINE_BOX;
  readonly view = signal<SurveyView>('wide');
  /** узкий вид прохождения (колонка 760 px): без матрицы — она слишком широкая для узкой колонки */
  readonly narrow = computed(() => this.view() !== 'wide');
  /** 9-box: вопросы повторяются для каждого сотрудника руководителя */
  readonly nine = computed(() => this.view() === 'nine');
  /** комментарии к оценкам: вопрос → текст */
  readonly comments = signal<Record<string, string>>({});
  private readonly all = this.form.sections.flatMap((s) => s.questions);
  private readonly nineAll: SurveyQuestion[] = SURVEY_NINE_BOX.employees.flatMap((e) => SURVEY_NINE_BOX.questions.map((q) => ({ ...q, id: e.id + '-' + q.id, emp: e.id })));
  private readonly list = computed(() => (this.nine() ? this.nineAll : this.narrow() ? this.all.filter((q) => q.type !== 'matrix') : this.all));
  /** номер вопроса: по порядку в анкете; в 9-box — по порядку у сотрудника */
  private readonly nums = computed((): Record<string, number> => {
    const L = this.list();
    return Object.fromEntries(L.map((q, i) => [q.id, q.emp ? L.filter((x, j) => j <= i && x.emp === q.emp).length : i + 1]));
  });
  /** вопросы анкеты (в узком виде — без матрицы) */
  get questions(): SurveyQuestion[] {
    return this.list();
  }
  /** номер вопроса по порядку во всей анкете */
  get num(): Record<string, number> {
    return this.nums();
  }
  readonly ro = computed(() => this.survey().status === 'Завершен');
  readonly answeredN = computed(() => this.questions.filter((q) => this.filled(q)).length);
  readonly requiredN = computed(() => this.questions.filter((q) => q.required).length);
  readonly missing = computed(() => this.questions.filter((q) => q.required && !this.filled(q)));
  /** вопросы одного сотрудника (9-box) */
  of(emp: string): SurveyQuestion[] {
    return this.list().filter((q) => q.emp === emp);
  }
  /** dev-панель: вид прохождения; ответы — заново для того же состояния */
  setView(v: SurveyView): void {
    this.view.set(v);
    this.fill(this.survey());
  }
  setComment(id: string, t: string): void {
    this.comments.set({ ...this.comments(), [id]: t });
  }
  open(id: string): void {
    this.fill(SURVEYS.find((x) => x.id === id) ?? SURVEYS[1]);
  }
  /** dev-панель: тот же опрос в другом состоянии — без ответов, начат (7 ответов), пройден */
  demo(st: SurveyStatus): void {
    const s = this.survey();
    this.fill({ ...s, status: st, doneAt: st === 'Завершен' ? s.doneAt || '29.09.2026' : undefined });
  }
  private fill(s: Survey): void {
    this.survey.set(s);
    const ids = s.status === 'Завершен' ? this.questions.map((q) => q.id) : s.status === 'В работе' ? this.questions.slice(0, 7).map((q) => q.id) : [];
    this.answers.set(Object.fromEntries(ids.map((k, i) => [k, this.nine() ? SURVEY_NINE_DEMO[i % SURVEY_NINE_DEMO.length] : SURVEY_DEMO_ANSWERS[k]])));
    this.other.set({});
    this.comments.set(this.nine() && ids.length ? { [ids[0]]: 'Сроки по задачам срывались в III квартале — нужна поддержка с планированием.' } : {});
    this.tried.set(false);
  }
  mark(): void {
    this.tried.set(true);
  }
  /** прокрутить к вопросу */
  goTo(id: string): void {
    document.getElementById('sq-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  set(id: string, v: SurveyAnswer | null): void {
    const a = { ...this.answers() };
    if (v == null) delete a[id];
    else a[id] = v;
    this.answers.set(a);
  }
  setOther(id: string, t: string): void {
    this.other.set({ ...this.other(), [id]: t });
  }
  /** есть ответ: матрица — во всех строках, «Другое» — с текстом */
  filled(q: SurveyQuestion): boolean {
    const v = this.answers()[q.id];
    if (v == null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return (q.rows ?? []).every((r) => !!(v as Record<string, string>)[r]);
    return String(v).trim() !== '';
  }
  /** вопрос подсвечен красным: обязательный, без ответа, уже нажимали «Завершить» */
  err(q: SurveyQuestion): boolean {
    return this.tried() && !!q.required && !this.filled(q);
  }
}
