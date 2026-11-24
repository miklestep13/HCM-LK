/** Строка реестра шаблонов плана адаптации. */
export interface AdaptTemplateRow {
  id: string;
  /** наименование шаблона */
  name: string;
  /** ответственный */
  ownerName: string;
  ownerPos: string;
  /** портрет .avN */
  ownerAv: number;
  created: string;
  updated: string;
}
