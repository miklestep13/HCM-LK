import { AudGroup } from './audience';
import { Member } from './member';

/** Опрос в разделе HR «Управление персоналом → Опросы» */
export interface Poll {
  /** номер опроса (у копий и новых — следующий свободный) */
  idx: number;
  n: string;
  /** описание */
  d?: string;
  /** опрос или тест */
  kind?: PollKind;
  /** вид: вопрос за вопросом (на экране один вопрос) или по модулям */
  view?: PollView;
  /** тест: проходной балл, % */
  pass?: number;
  /** шаблон (POLL_TEMPLATES): вопросы, пока опрос не сохраняли из формы */
  tpl: number;
  /** разделы и вопросы, сохраненные из формы */
  sec?: PollSection[];
  /** процедуры (волны) опроса: у каждой своя дата назначения и участники; итоги — по всем волнам или по одной */
  waves?: PollWave[];
  /** условия отбора участников (widgets/audience) — опрос без процедур (старые данные) */
  rules?: AudGroup[];
  /** участники, добавленные вручную, и убранные из подобранных по условиям */
  man?: Member[];
  excl?: string[];
  anon: boolean;
  /** участников всего и прошли */
  total: number;
  done: number;
  start: string;
  end: string;
  /** вкладка: активные, завершенные, архив */
  st: 'act' | 'done' | 'arch';
  sts: PollStatus;
  /** сдвиг в списке сотрудников — у опросов разные участники */
  off: number;
}

/** процедура (волна) опроса: дата назначения и участники — опрос назначается им в эту дату */
export interface PollWave {
  id: string;
  /** название: «Процедура 1» или свое («Сеть отделений») */
  n: string;
  /** дата и время назначения (дд.мм.гггг, чч:мм) — участники получают опрос и уведомление */
  date: string;
  time: string;
  /** дата и время окончания — после них пройти нельзя (необязательно) */
  end: string;
  endTime: string;
  /** условия отбора, добавленные вручную и убранные из подобранных */
  rules: AudGroup[];
  man: Member[];
  excl: string[];
  /** итоги: назначено и прошли (демо) */
  total: number;
  done: number;
}

/** тип: опрос или тест */
export type PollKind = 'Опрос' | 'Пульс-опрос' | 'Тест';

/** вид опроса: step — вопрос за вопросом (без модулей, на экране один вопрос), mods — по модулям (в модуле сколько угодно вопросов) */
export type PollView = 'step' | 'mods';

export type PollStatus = 'Активен' | 'Запланирован' | 'Черновик' | 'Завершен' | 'В архиве';

/** шаблон опроса: название, описание, категория, разделы с вопросами */
export interface PollTemplate {
  n: string;
  d: string;
  cat: string;
  sec: PollSection[];
  /** системный (9-box) — в выборе шаблонов не показываем */
  sys?: boolean;
}

/** тип вопроса в конструкторе опроса */
export type PollQType = 'rating' | 'single' | 'multi' | 'long' | 'enps' | 'short' | 'drop' | 'yesno' | 'date' | 'matrix' | 'rank' | 'slider' | 'file';

/** вопрос конструктора: текст, описание, обязательный и настройки ответа по типу */
export interface PollQuestion {
  t: PollQType;
  n: string;
  d: string;
  req: boolean;
  /** варианты: single, multi, drop, rank; подписи кнопок — yesno; столбцы шкалы — matrix */
  opts: string[];
  /** утверждения (строки): matrix */
  rows: string[];
  /** единица значения ползунка («%»): slider */
  unit: string;
  /** «Другое» с полем ввода: single, multi */
  other: boolean;
  /** рейтинг: шкала 3, 5, 10 или 11 (0–10) и вид — звезды или числа */
  scale: number;
  view: 'star' | 'num';
  /** подписи краев шкалы: rating, enps, slider */
  lo: string;
  hi: string;
  /** подсказка в поле и максимум символов: long, short; типы файлов и размер, МБ: file */
  ph: string;
  max: string;
  /** формат строки: short */
  fmt: string;
  /** тест: номера верных вариантов (single, multi, yesno, drop); у ранжирования верный порядок — порядок opts */
  ok?: number[];
  /** минимум и максимум выбранных: multi; границы шкалы: slider */
  mn: string;
  mx: string;
  /** поиск по списку: drop */
  srch: boolean;
  /** под ответом — поле «Комментарий» */
  cmt?: boolean;
}

/** раздел опроса: название и описание (подзаголовок блока у сотрудника) */
export interface PollSection {
  name: string;
  d?: string;
  q: PollQuestion[];
}

/** участник: ФИО, должность, подразделение, номер аватарки */
export type PollPerson = [string, string, string, number];
