import { AttachFile } from './attach';

/** Готовый период расчетного листка: ключи дат «ГГГГММДД» */
export interface BenefPeriod {
  name: string;
  a: string;
  b: string;
}

/** Строка расчетного листка. when: месяц листка или предыдущий */
export interface SlipRow {
  name: string;
  when: 'm' | 'prev';
  days?: string;
  hours?: string;
  /** когда было, если это не весь месяц: «12.10–18.10» */
  dates?: string;
  /** оплачено, например «21,00 дн.» */
  paid?: string;
  /** сумма, ₽ */
  amt: number;
}

/** Расчетный листок: шапка, начисления, удержания, выплаты, долг */
export interface PaySlip {
  name: string;
  org: string;
  unit: string;
  role: string;
  /** оклад (тариф), ₽ */
  tariff: number;
  /** долг предприятия на начало, ₽ */
  debtStart: number;
  /** общий облагаемый доход, ₽ */
  taxable: number;
  accrued: SlipRow[];
  withheld: SlipRow[];
  paidOut: SlipRow[];
}

/** Строка бланка «как в расчетке»: пустые клетки остаются пустыми, суммы — строки бланка */
export interface SlipFormLine {
  /** подпись группы: «Начислено:» */
  group?: string;
  total?: string;
  name?: string;
  /** месяц листка или предыдущий; если пусто — берется period как есть */
  when?: 'm' | 'prev';
  /** фиксированный период, например «12.08-18.08» */
  period?: string;
  days?: string;
  hours?: string;
  paid?: string;
  amt?: string;
}

/** Бланк расчетного листка */
export interface SlipForm {
  debtStart: string;
  debtEnd: string;
  left: SlipFormLine[];
  right: SlipFormLine[];
}

/** Предложение кафетерия льгот и карточка «Льгота» */
export interface BenefOffer {
  id: string;
  title: string;
  text: string;
  /** картинка со макета — эмодзи в плитке строки */
  emoji: string;
  date: string;
  tags: string[];
  lead: string;
  body: { h: string; p: string }[];
  cover?: string;
  files: AttachFile[];
}
