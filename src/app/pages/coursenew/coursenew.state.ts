import { Injectable, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { bldDemoAllBlocks, bldDemoCourse, newMaterial } from '../../data/builder.data';
import { COURSE_DEMO_INFO, COURSE_STEPS } from '../../data/coursenew.data';
import { BldMaterial } from '../../interface/builder';
import { ToastService } from '../../shared/ui/toast/toast.service';

const iso = (d: string) => d.split('.').reverse().join('');

/**
 * Форма курса по шагам: общая информация (название, краткое и полное описание, даты начала и окончания, статус, автор, теги, обложка;
 * настройки — время изучения, порядок просмотра, критерии успешности: проходной процент и «Все учебные материалы просмотрены»),
 * структура — конструктор (раздел → модуль → блоки), автоматическое назначение и участники — заглушки, как в прототипе.
 * Демо (dev-панель): пустой курс, пример «Бизнес-анализ в банке» или пример с разделом «Примеры видов модулей» — по модулю каждого вида (для проверки; по умолчанию).
 */
@Injectable()
export class CoursenewState {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);

  readonly step = signal(0);
  readonly reached = signal(0);
  readonly demo = signal<'empty' | 'demo' | 'all'>('all');
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
    this.bad.set([]);
    return true;
  }
  save(): void {
    for (const i of [0, 1])
      if (!this.check(i)) return this.go(i);
    this.toast.show('Готово', 'Курс «' + this.n().trim() + '» сохранен.');
    this.nav.go('learn');
  }
}
