import { Injectable, effect, signal, untracked } from '@angular/core';
import { GoalStage, GoalStatus, goalStatusOf } from '../../interface/goal';
import { devValue } from '../layout/dev-panel/dev-panel.service';

/**
 * Демо-состояния прототипа (переключаются в dev-панели). Общие для всех страниц.
 */
@Injectable({ providedIn: 'root' })
export class DemoState {
  /** этап карты целей: влияет на виджет «Карта целей», баннер самооценки и т. д. */
  readonly goalStage = signal<GoalStage>('draft');
  /** роль на карте целей: сотрудник смотрит свою карту, руководитель — карту сотрудника (в шапке — карточка сотрудника) */
  readonly goalRole = signal<'emp' | 'mgr'>('emp');
  /**
   * Статус карты для dev-панели: «Заведение целей», «Утверждено», «Период оценки», «Завершена».
   * В «Периоде оценки» оценки ставят все сразу, а что именно делает пользователь, решает роль:
   * сотрудник — самооценка, руководитель — оценка участника цели.
   */
  readonly goalStatus = devValue<GoalStatus>(
    () => goalStatusOf(this.goalStage()),
    (v) => this.goalStage.set(v === 'eval' ? this.evalStage() : v),
  );
  private readonly evalStage = (): GoalStage => (this.goalRole() === 'mgr' ? 'cust' : 'self');

  constructor() {
    // в «Периоде оценки» смена роли меняет, какую оценку ставит пользователь
    effect(() => {
      const st = this.evalStage();
      untracked(() => goalStatusOf(this.goalStage()) === 'eval' && this.goalStage.set(st));
    });
  }
  /** этап «Итог» цикла оценки на странице «Развитие» (остальные этапы — из этапа карты целей) */
  readonly growthDone = signal(false);
  /** роль в разделе «Новости»: сотрудник читает, админ добавляет, редактирует и удаляет */
  readonly newsRole = signal<'emp' | 'adm'>('emp');
  /** роль в «Сообществах»: сотрудник вступает, админ сообщества управляет своими, админ добавляет и редактирует любые */
  readonly commRole = signal<'emp' | 'cadm' | 'adm'>('emp');
  /** роль на странице «Мероприятия»: сотрудник смотрит, админ добавляет, редактирует и удаляет */
  readonly eventsRole = signal<'emp' | 'adm'>('emp');
  /** роль на странице «Оценка 360»: сотрудник (комментарии анонимно, без статистики по оценивающим) или HR-администратор */
  readonly a360Role = signal<'emp' | 'adm'>('emp');
}
