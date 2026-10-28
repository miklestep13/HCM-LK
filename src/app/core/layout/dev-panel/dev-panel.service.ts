import { Injectable, WritableSignal, computed, signal } from '@angular/core';

/** Переключатель демо-состояния в dev-панели */
export interface DevControl<T = string> {
  id: string;
  label: string;
  options: { value: T; label: string }[];
  value: WritableSignal<T>;
}

/**
 * Dev-панель: страница регистрирует свои демо-переключатели (этап, роль, сценарий),
 * панель внизу справа их показывает. При уходе со страницы переключатели снимаются.
 */
@Injectable({ providedIn: 'root' })
export class DevPanelService {
  readonly controls = signal<DevControl<any>[]>([]);

  register(...c: DevControl<any>[]): () => void {
    this.controls.update((list) => [...list.filter((x) => !c.some((y) => y.id === x.id)), ...c]);
    return () => this.controls.update((list) => list.filter((x) => !c.includes(x)));
  }
}

/**
 * Переключатель, у которого значение собирается из нескольких состояний
 * (например, «Ожидание» — отдельный флаг, остальные этапы — общий этап карты целей).
 */
export function devValue<T>(get: () => T, set: (v: T) => void): WritableSignal<T> {
  const c = computed(get) as WritableSignal<T>;
  c.set = set;
  c.update = (fn: (v: T) => T) => set(fn(get()));
  c.asReadonly = () => c;
  return c;
}
