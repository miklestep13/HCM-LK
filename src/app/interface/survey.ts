import { AttachFile } from './attach';

/** Опрос или тест для сотрудника («Компания → Опросы») */
export interface Survey {
  id: string;
  kind: 'Опрос' | 'Тест';
  title: string;
  /** автор (ФИО полностью) */
  author: string;
  /** период прохождения «дд.мм.гггг»; конец пустой — без срока */
  start: string;
  end: string;
  status: SurveyStatus;
  /** вопросов всего и отвечено (для «В работе») */
  questions: number;
  answered?: number;
  /** примерное время прохождения, минут */
  minutes: number;
  /** анонимный опрос — ответы без ФИО */
  anon?: boolean;
  /** обязательный — назначен сотруднику */
  required?: boolean;
  /** результат теста: правильных ответов и порог прохождения, % */
  score?: number;
  pass?: number;
  /** когда пройден */
  doneAt?: string;
}

export type SurveyStatus = 'Ожидание' | 'Доступен' | 'В работе' | 'Завершен';

/** тип вопроса анкеты (как в Google Forms, Typeform, Qualtrics, Culture Amp) */
export type SurveyQType =
  | 'one' // один вариант (радиокнопки)
  | 'many' // несколько вариантов (чек-боксы), можно «Другое» и ограничение max
  | 'select' // выпадающий список
  | 'yesno' // да / нет
  | 'scale' // шкала согласия 1–5 с подписями по краям
  | 'nps' // eNPS 0–10: вероятность рекомендации
  | 'stars' // оценка звездами
  | 'matrix' // матрица: утверждения × шкала
  | 'rank' // ранжирование: расставить по порядку
  | 'slider' // ползунок 0–100
  | 'text' // короткий ответ
  | 'long' // развернутый ответ (со счетчиком символов)
  | 'date' // дата
  | 'file'; // загрузка файла

/** вопрос: номер считается по порядку, заголовок, описание (если нужно), поле ответа по типу */
export interface SurveyQuestion {
  id: string;
  type: SurveyQType;
  title: string;
  desc?: string;
  required?: boolean;
  /** варианты: one, many, select, rank; столбцы шкалы — matrix */
  options?: string[];
  /** many — «Другое» с полем ввода */
  other?: boolean;
  /** many — не больше N вариантов; long — не больше N символов; scale, stars — верх шкалы */
  max?: number;
  /** подписи краев шкалы: scale, nps, slider */
  minLabel?: string;
  maxLabel?: string;
  /** matrix — утверждения (строки) */
  rows?: string[];
  /** slider — единица («%») */
  unit?: string;
  placeholder?: string;
  /** scale — низ шкалы (по умолчанию 1; 9-box — 0) */
  from?: number;
  /** под ответом — поле «Комментарий к оценке (необязательно)» */
  comment?: boolean;
  /** 9-box — сотрудник, к которому относится вопрос (блок вопросов повторяется для каждого) */
  emp?: string;
}

/** сотрудник в опросе руководителя 9-box */
export interface SurveyNineEmp {
  id: string;
  name: string;
  pos: string;
  /** класс фото (.av.ph41) */
  av: string;
}

/** опрос руководителя 9-box: шапка, вводная, вопросы (повторяются для каждого сотрудника команды) */
export interface SurveyNineBox {
  title: string;
  /** команда (подразделение) */
  team: string;
  due: string;
  intro: string;
  questions: SurveyQuestion[];
  employees: SurveyNineEmp[];
}

/** блок вопросов анкеты */
export interface SurveySection {
  title: string;
  desc?: string;
  questions: SurveyQuestion[];
}

/** анкета опроса: вступление и блоки */
export interface SurveyForm {
  intro: string;
  sections: SurveySection[];
}

/** ответ: текст / вариант, число, несколько вариантов, матрица (строка → столбец), файлы */
export type SurveyAnswer = string | number | string[] | Record<string, string> | AttachFile[];
