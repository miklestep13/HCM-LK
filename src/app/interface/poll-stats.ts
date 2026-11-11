import { PollQuestion } from './poll';

/** статус участника опроса */
export type PollPartStatus = 'Ожидает' | 'В работе' | 'Завершен';

/** участник в итогах опроса */
export interface PollPart {
  n: string;
  pos: string;
  dep: string;
  st: PollPartStatus;
  /** тест: попыток и лучший результат, % */
  tries: number;
  score: number | null;
  /** когда завершил (дд.мм.гггг) и сколько минут проходил */
  doneAt: string;
  min: number;
  /** процедура (волна), в которой назначен опрос */
  wave?: string;
}

/** вопрос в итогах: номер «1.2», раздел, ответов и пропусков, доля верных (тест) */
export interface PollQStat {
  q: PollQuestion;
  num: string;
  sec: string;
  answered: number;
  skipped: number;
  /** тест: доля верных, %; null — у вопроса нет верного ответа */
  right: number | null;
  /** распределение: подпись → число ответов (варианты, значения шкалы, месяцы) */
  dist: [string, number][];
  /** матрица: строка → число ответов по столбцам */
  rows?: [string, number[]][];
  /** ранжирование: вариант → средняя позиция и доля первых мест, % */
  rank?: [string, number, number][];
  /** текстовые ответы и файлы; «Другое» у вариантов */
  texts?: string[];
  /** среднее значение (шкалы, ползунок) */
  avg?: number;
}

/** итоги опроса: участники, динамика по дням, этапы, подразделения, вопросы */
export interface PollStats {
  parts: PollPart[];
  /** динамика: день «дд.мм» → завершили нарастающим итогом */
  days: [string, number][];
  /** этапы: назначен, открыли, начали, завершили */
  funnel: [string, number][];
  /** подразделение → средний балл (тест) или доля завершивших, % и участников */
  deps: [string, number, number][];
  questions: PollQStat[];
}
