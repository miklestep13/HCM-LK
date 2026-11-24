import { Injectable, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { PEOPLE } from '../../data/people.data';
import { AdaptTemplateRow } from '../../interface/adapt-template';
import { PickPerson } from '../../shared/ui/emp-pick/emp-pick';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AdapttplState } from '../adapttpl/adapttpl.state';

/** Правила назначения шаблона плана адаптации (демо). */
export const ADAPT_TPL_RULES = [
  'Без правила',
  'Все новые сотрудники',
  'Новые сотрудники подразделения',
  'По должности',
  'По условиям отбора',
];

/** Ответственные: сотрудники из демо-пула (аватар + ФИО + должность). */
export const ADAPT_TPL_OWNERS: PickPerson[] = PEOPLE.map(([name, post, , av]) => ({ name, post, av: +av || 1 }));

/**
 * Форма «Добавление шаблона плана адаптации»: наименование, описание, ответственный, правило назначения.
 * Задачи и цели правятся через AdaptStore на странице.
 */
@Injectable()
export class AdapttplnewState {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly list = inject(AdapttplState);

  readonly name = signal('');
  readonly desc = signal('');
  /** один ответственный — EmpPick с ограничением до одного */
  readonly owner = signal<string[]>([]);
  readonly rule = signal(ADAPT_TPL_RULES[0]);
  readonly bad = signal(false);

  readonly people = ADAPT_TPL_OWNERS;
  readonly rules = ADAPT_TPL_RULES;

  /** EmpPick — мультивыбор; оставляем только последнего выбранного. */
  setOwner(names: string[]): void {
    this.owner.set(names.length ? [names[names.length - 1]] : []);
  }

  cancel(): void {
    this.nav.go('adapttpl');
  }

  save(): void {
    const name = this.name().trim();
    const ownerName = this.owner()[0] || '';
    if (!name) {
      this.bad.set(true);
      this.toast.show('Шаблон плана адаптации', 'Укажите наименование.');
      return;
    }
    if (!ownerName) {
      this.bad.set(true);
      this.toast.show('Шаблон плана адаптации', 'Выберите ответственного.');
      return;
    }
    const p = this.people.find((x) => x.name === ownerName);
    const row: AdaptTemplateRow = {
      id: 'at' + (Date.now() % 100000),
      name,
      ownerName,
      ownerPos: p?.post || '—',
      ownerAv: p?.av || 1,
      created: '30.09.2026',
      updated: '30.09.2026',
    };
    this.list.list.update((L) => [row, ...L]);
    this.toast.show('Шаблон сохранен', '«' + name + '» добавлен в реестр шаблонов.');
    this.nav.go('adapttpl');
  }
}
