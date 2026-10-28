import { Injectable, signal } from '@angular/core';

/** Окно подтверждения: заголовок, текст (можно выделить часть **жирным**), кнопки. */
export interface ConfirmOptions {
  title: string;
  /** текст; фрагмент в **двойных звездочках** выделяется жирным */
  text: string;
  ok?: string;
  cancel?: string;
  /** красная кнопка подтверждения (удаление) */
  danger?: boolean;
}

/**
 * Подтверждение действия в модальном окне прототипа (.mdlo):
 *   if (await confirm.ask({ title: 'Удалить новость?', text: 'Новость **…** будет удалена', ok: 'Удалить', danger: true })) …
 * Окно рисует <app-confirm /> в корне приложения.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  ask(o: ConfirmOptions): Promise<boolean> {
    this.current()?.resolve(false);
    return new Promise((resolve) => this.current.set({ ...o, resolve }));
  }
  close(v: boolean): void {
    this.current()?.resolve(v);
    this.current.set(null);
  }
}
