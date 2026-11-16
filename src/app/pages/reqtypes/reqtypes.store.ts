import { Injectable, signal } from '@angular/core';
import { REQ_TYPE_LIST } from '../../data/req.data';
import { ReqTypeItem } from '../../interface/req';

/** справочник типов заявок: общий для списка «Типы заявок» и формы «Новый тип заявки» (живет, пока открыт прототип) */
@Injectable({ providedIn: 'root' })
export class ReqTypesStore {
  readonly list = signal<ReqTypeItem[]>(REQ_TYPE_LIST);
  add(n: string, now: string): void {
    this.list.update((l) => [{ id: 'rt' + Date.now().toString(36), n, created: now, changed: now }, ...l]);
  }
  /** правка типа: новое название и дата изменения */
  update(id: string, n: string, now: string): void {
    this.list.update((l) => l.map((x) => (x.id === id ? { ...x, n, changed: now } : x)));
  }
  remove(id: string): void {
    this.list.update((l) => l.filter((x) => x.id !== id));
  }
}
