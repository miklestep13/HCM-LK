import { Injectable, computed, inject, signal } from '@angular/core';
import { LearnStore, learnBlocks } from '../../core/demo/learn-store.service';
import { LEARN_COURSES } from '../../data/learn.data';

/** Состояние плеера курса: курс, открытый модуль, завершение. Общее для блоков страницы. */
@Injectable()
export class PlayerState {
  readonly store = inject(LearnStore);
  readonly id = signal('');
  readonly i = signal(0);
  /** курс завершен — в основной части отзыв */
  readonly finished = signal(false);
  readonly blocks = computed(() => learnBlocks(this.id()));
  readonly course = computed(() => LEARN_COURSES[this.id()]);
  readonly st = computed(() => this.store.playState(this.id()));
  readonly cur = computed(() => this.blocks()[this.i()]);

  open(id: string, again: boolean): void {
    this.id.set(id);
    this.finished.set(false);
    if (again) this.store.restart(id);
    const st = this.store.playState(id), B = learnBlocks(id);
    let i = 0;
    while (i < B.length - 1 && (st.done.includes(i) || st.fail.includes(i) || st.review.includes(i))) i++;
    this.i.set(i);
    if (/Назначен/.test(this.store.courses()[id] || '')) this.store.setStatus(id, 'В процессе');
  }
  /** изменить прохождение */
  patch(fn: (s: { done: Set<number>; fail: Set<number>; review: Set<number> }) => void): void {
    const s = this.st(), x = { done: new Set(s.done), fail: new Set(s.fail), review: new Set(s.review) };
    fn(x);
    this.store.setPlay(this.id(), { done: [...x.done].sort((a, b) => a - b), fail: [...x.fail], review: [...x.review] });
  }
  /** переход дальше засчитывает просмотр теории; тест и задание — только результатом */
  seen(k: number): void {
    const b = this.blocks()[k];
    if (b.k !== 'test' && b.k !== 'task') this.patch((s) => s.done.add(k));
  }
  finish(): void {
    this.patch((s) => this.blocks().forEach((_, k) => !s.fail.has(k) && !s.review.has(k) && s.done.add(k)));
    this.store.setStatus(this.id(), 'Завершен');
    this.finished.set(true);
  }
}
