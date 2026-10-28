import { Injectable, signal } from '@angular/core';
import { Person } from '../../data/people.data';

/** Всплывающая карточка на странице «Бронирование»: место, переговорная или сотрудник */
export type MapPop =
  | { kind: 'seat'; id: string; left: number; top: number }
  | { kind: 'room'; i: number; left: number; top: number }
  | { kind: 'person'; p: Person; rows: [string, string][]; left: number; top: number };

/** Состояние интерфейса страницы: всплывающая карточка и метка последнего перетаскивания карты */
@Injectable()
export class MapUi {
  readonly pop = signal<MapPop | null>(null);
  dragAt = 0;
  /** координаты карточки под элементом (как floatPanel прототипа) */
  at(el: Element, w = 320, h = 260): { left: number; top: number } {
    const r = el.getBoundingClientRect();
    let left = r.left, top = r.bottom + 6;
    if (left + w > innerWidth - 12) left = r.right - w;
    if (top + h > innerHeight - 12) top = r.top - h - 6;
    return { left: Math.max(12, left), top: Math.max(12, top) };
  }
  dragged(): boolean { return Date.now() - this.dragAt < 250; }
}
