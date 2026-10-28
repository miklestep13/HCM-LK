import { Injectable, signal } from '@angular/core';

/** Голос в опросе — общий для всех страниц, где показан опрос (обзор компании, новости). */
@Injectable({ providedIn: 'root' })
export class PollState {
  /** индекс выбранного варианта; null — еще не голосовал */
  readonly vote = signal<number | null>(null);
}
