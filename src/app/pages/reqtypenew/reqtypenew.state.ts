import { Injectable, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { rqDefaultBlocks } from '../../data/req-builder.data';
import { RqBlock } from '../../interface/req-builder';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { ReqTypesStore } from '../reqtypes/reqtypes.store';

export const REQTYPE_STEPS = ['Общая информация', 'Конструктор заявки'];
/** «сейчас» демо: дата и время создания */
const NOW = '13.11.2026, 12:00';

/**
 * Форма «Новый тип заявки» по шагам: 1 — общая информация (название, описание, префикс, ответственные, категория, иконка, рабочий процесс),
 * 2 — конструктор заявки (инфоблоки, widgets/req-builder). «Далее» проверяет обязательные поля шага, «Сохранить» — добавляет тип в справочник.
 */
@Injectable()
export class ReqtypenewState {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly store = inject(ReqTypesStore);

  /** id редактируемого типа; пусто — новый */
  readonly editId = signal('');
  readonly step = signal(0);
  readonly reached = signal(0);
  readonly n = signal('');
  readonly d = signal('');
  readonly prefix = signal('');
  readonly resp = signal<string[]>([]);
  readonly cat = signal('');
  readonly icon = signal('');
  readonly flow = signal('');
  readonly blocks = signal<RqBlock[]>(rqDefaultBlocks());
  /** подсвечиваем незаполненные обязательные поля после «Далее» / «Сохранить» */
  readonly tried = signal(false);
  /** открыть форму: id — редактирование типа из справочника (название — из него), пусто — новый тип */
  open(id: string): void {
    const t = id ? this.store.list().find((x) => x.id === id) : undefined;
    this.editId.set(t ? t.id : '');
    this.n.set(t?.n ?? '');
  }

  /** проверка шага: общая информация — название, префикс, процесс; конструктор — хотя бы одно включенное поле */
  private check(i: number): boolean {
    if (i === 0 && (!this.n().trim() || !this.prefix().trim() || !this.flow())) {
      this.tried.set(true);
      this.toast.show('Заполните обязательные поля', 'Укажите название, префикс и рабочий процесс заявки.');
      return false;
    }
    if (i === 1 && !this.blocks().some((b) => b.fields.some((f) => f.on))) {
      this.toast.show('Заявка пустая', 'Добавьте инфоблок и включите хотя бы одно поле.');
      return false;
    }
    return true;
  }
  go(i: number): void {
    if (i > this.step() && !this.check(this.step())) return;
    this.step.set(i);
    this.reached.set(Math.max(this.reached(), i));
  }
  next(): void {
    this.go(this.step() + 1);
  }
  back(): void {
    this.step.set(Math.max(0, this.step() - 1));
  }
  save(): void {
    for (const i of [0, 1])
      if (!this.check(i)) {
        this.step.set(i);
        return;
      }
    if (this.editId()) {
      this.store.update(this.editId(), this.n().trim(), NOW);
      this.toast.show('Тип заявки сохранен', this.n().trim());
    } else {
      this.store.add(this.n().trim(), NOW);
      this.toast.show('Тип заявки создан', this.n().trim());
    }
    this.nav.go('reqtypes');
  }
}
