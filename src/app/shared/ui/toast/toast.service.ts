import { Injectable, signal } from '@angular/core';

export interface ToastMsg {
  id: number;
  title: string;
  text: string;
}

/** Всплывающие уведомления внизу справа: toast.show('Готово', 'Описание') */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly items = signal<ToastMsg[]>([]);
  private seq = 0;

  show(title: string, text = ''): void {
    const id = ++this.seq;
    this.items.update((l) => [...l, { id, title, text }]);
    setTimeout(() => this.items.update((l) => l.filter((t) => t.id !== id)), 4000);
  }
}
