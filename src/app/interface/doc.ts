/** Документ сотрудника («Мой кабинет → Документы») */
export interface MyDoc {
  id: string;
  name: string;
  /** тип — фильтр «Тип документа» */
  type: string;
  /** источник: КЭДО, отдел кадров, бухгалтерия… */
  src: string;
  /** дата, дд.мм.гггг */
  date: string;
  status: string;
}
