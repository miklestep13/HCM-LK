/** Тон бейджа / статуса — классы .bdg.ok/.warn/.dg/.info из дизайн-системы */
export type Tone = '' | 'ok' | 'warn' | 'dg' | 'info';

/** Бейдж: текст + тон */
export interface BadgeData {
  text: string;
  tone: Tone;
  /** пульсирующая точка «Идет сейчас» */ live?: boolean;
}

/** Элемент мета-строки: иконка + текст, danger — красный (просрочено) */
export interface MetaData {
  text: string;
  icon?: string;
  danger?: boolean;
}
