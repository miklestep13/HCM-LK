import { Injectable, computed, inject, signal } from '@angular/core';
import { pollStats } from '../../data/poll-stats.data';
import { Poll } from '../../interface/poll';
import { PollsState } from '../polls/polls.state';

export type StatsTab = 'ppl' | 'q' | 'ans';

/**
 * Итоги опроса (дашборд HR): опрос из списка, итоги (демо-генератор data/poll-stats.data), вкладка и выбранный вопрос.
 * Вкладки: «Участники» — сводка и таблица, «Вопросы» — состав анкеты, «Ответы» — детализация одного вопроса.
 * Процедуры (волны): итоги по всем вместе (по умолчанию) или по одной — выбор в шапке, сравнение волн — на вкладке «Участники».
 */
@Injectable()
export class PollstatsState {
  private readonly polls = inject(PollsState);
  readonly poll = signal<Poll | null>(null);
  readonly tab = signal<StatsTab>('ppl');
  /** выбранный вопрос (индекс в stats.questions) */
  readonly qi = signal(0);
  /** процедура (id): '' — все процедуры */
  readonly wave = signal('');

  readonly waves = computed(() => this.poll()?.waves ?? []);
  /** выбранная процедура или null — все */
  readonly curWave = computed(() => this.waves().find((w) => w.id === this.wave()) ?? null);
  readonly stats = computed(() => (this.poll() ? pollStats(this.poll()!, this.wave()) : null));
  readonly test = computed(() => this.poll()?.kind === 'Тест');
  readonly pass = computed(() => this.poll()?.pass ?? 80);
  readonly done = computed(() => this.stats()?.parts.filter((p) => p.st === 'Завершен') ?? []);
  /** средний результат теста, %; средняя длительность, мин; среднее число попыток */
  readonly avgScore = computed(() => avg(this.done().map((p) => p.score ?? 0)));
  readonly avgMin = computed(() => avg(this.done().map((p) => p.min)));
  readonly avgTries = computed(() => {
    const t = this.stats()?.parts.filter((p) => p.tries) ?? [];
    return t.length ? Math.round((t.reduce((a, p) => a + p.tries, 0) / t.length) * 10) / 10 : 0;
  });
  readonly passed = computed(() => this.done().filter((p) => (p.score ?? 0) >= this.pass()).length);

  open(idx: string): void {
    this.poll.set(this.polls.byIdx(+idx) ?? this.polls.list()[0]);
    this.tab.set('ppl');
    this.qi.set(0);
    this.wave.set('');
  }
  /** к детализации вопроса */
  showQ(i: number): void {
    this.qi.set(i);
    this.tab.set('ans');
    window.scrollTo({ top: 0 });
  }
}

function avg(l: number[]): number {
  return l.length ? Math.round(l.reduce((a, b) => a + b, 0) / l.length) : 0;
}
