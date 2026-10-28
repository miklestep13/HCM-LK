/** Операция кошелька (CUR_HIST прототипа) */
export interface WalletOp {
  n: number;
  /** «30.09.2026 19:10» */
  d: string;
  type: 'Бонус' | 'Перевод' | 'Покупка' | 'Возврат' | string;
  /** комментарий */
  t: string;
  /** «От: …», «Кому: …», «Компания», «Корпоративный магазин» */
  who: string;
  /** сумма: + пришло, − ушло */
  amt: number;
  st: 'Выполнено' | 'В обработке' | 'Отменено' | string;
}

/** Коллега в списке «Перечислить валюту» */
export interface WalletEmployee {
  name: string;
  post: string;
  unit: string;
  /** номер портрета .av1–.av8 */
  av: number;
}
