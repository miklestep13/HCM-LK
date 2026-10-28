import { Injectable, signal } from '@angular/core';
import { GoalStage } from '../../interface/goal';

/**
 * Демо-состояния прототипа (переключаются в dev-панели). Общие для всех страниц.
 */
@Injectable({ providedIn: 'root' })
export class DemoState {
  /** этап карты целей: влияет на виджет «Карта целей», баннер самооценки и т. д. */
  readonly goalStage = signal<GoalStage>('draft');
  /** этап «Ожидание» карты целей: целей еще нет, руководитель их ставит (отдельный флаг, как GL_IDLE прототипа) */
  readonly goalIdle = signal(false);
  /** сценарий черновика карты: пустая карта (только добавленные цели) или заполненная */
  readonly goalFill = signal<'empty' | 'full'>('full');
  /** этап «Итог» цикла оценки на странице «Развитие» (остальные этапы — из этапа карты целей) */
  readonly growthDone = signal(false);
  /** роль в разделе «Новости»: сотрудник читает, админ добавляет, редактирует и удаляет */
  readonly newsRole = signal<'emp' | 'adm'>('emp');
  /** роль в «Сообществах»: сотрудник вступает, админ сообщества управляет своими, админ добавляет и редактирует любые */
  readonly commRole = signal<'emp' | 'cadm' | 'adm'>('emp');
}
