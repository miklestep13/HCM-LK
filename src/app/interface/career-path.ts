import { Tone } from './common';

/** Статус требования к компетенции на выбранном грейде */
export type CpCompStatus = 'Достигнут' | 'Не хватает' | 'Не оценен' | 'На подтверждении';

/** Статус условия перехода */
export type CpCondStatus = 'Выполнено' | 'Не выполнено' | 'Нет данных' | 'Ждет итога';

/** Демо-сценарий страницы (dev-панель) */
export type CpScenario = 'normal' | 'noplan' | 'closed' | 'noassess' | 'norole' | 'unpublished' | 'top' | 'moved';

/** Ступень дорожной карты. Освоенный грейд — done; заявленный переход — aim; без перехода и дальнейшие — future */
export interface CpStep {
  grade: string;
  /** период на грейде: «01.2020 — 12.2022» или «с 01.2023» */
  period: string;
  /** где работал на этом грейде */
  place: string;
  state: 'done' | 'aim' | 'future';
}

/** Статус есть только у назначенного курса, мероприятия или задачи */
export type CpWayStatus = 'Назначен' | 'В процессе' | 'Завершен' | 'Вы записаны' | 'Просрочена';

/**
 * Способ развития для перехода на конкретный грейд.
 * Статья базы знаний и книга без статуса: прочтение не отслеживается.
 * Курс без назначения — кнопка «Подать заявку», статуса нет.
 */
export interface CpWay {
  title: string;
  icon: 'course' | 'video' | 'mTask' | 'mQuiz' | 'target' | 'book' | 'mKb' | 'mText';
  status?: CpWayStatus;
  /** курс из каталога, который сотруднику не назначали */
  apply?: boolean;
  meta: { icon: 'calendar' | 'clock' | 'pin'; text: string; warn?: boolean }[];
  /** грейды, для перехода на которые нужен этот способ */
  grades: string[];
  /** материал, который открывается по названию: курс или статья базы знаний */
  link?: { page: 'course' | 'kb'; id: string; ev?: boolean };
}

/** Текущий уровень сотрудника по компетенции и его источник */
export interface CpLevel {
  comp: string;
  level: string;
  /** откуда уровень: оценка или подтверждение эксперта */
  source: string;
}

/** Условие перехода на грейд */
export interface CpCondition {
  name: string;
  /** порог из профиля роли */
  need: string;
  /** факт по сотруднику; пусто — нет данных */
  fact: string;
  status: CpCondStatus;
  /** пояснение (подсказка) */
  hint?: string;
}

/** Строка требования к компетенции (вычисляется в хранилище) */
export interface CpReqRow {
  id: string;
  comp: string;
  group: string;
  /** текущий уровень; пусто — не оценен */
  cur: string;
  /** требуемый уровень на выбранном грейде */
  need: string;
  status: CpCompStatus;
  source: string;
  /** есть материалы в каталоге */
  hasLearn: boolean;
  /** запрос подтверждения: эксперт и дата */
  request?: { expert: string; date: string };
}

/** Эксперт роли, который подтверждает уровень */
export interface CpExpert {
  name: string;
  pos: string;
  tag: 'Лидер' | 'Эксперт';
}

/** Словарь тонов бейджей по статусу */
export type CpToneMap<K extends string> = Record<K, Tone>;
