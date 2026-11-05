import { AttachFile } from './attach';
import { Tone } from './common';

/** Доступно дней по виду отсутствия */
export interface AbsenceAvail {
  label: string;
  value: string;
  unit: string;
}

/** Ближайшее отсутствие (слайд в блоке «Мои отсутствия») */
export interface AbsenceItem {
  /** vac — отпуск, off — отгул */
  kind: 'vac' | 'off';
  type: string;
  dates: string;
  days: string;
  status: string;
  tone: Tone;
}

export interface Absences {
  available: AbsenceAvail[];
  items: AbsenceItem[];
}

/** Вид отсутствия в «Графике отсутствий» */
export type AbsKind = 'vac' | 'add' | 'unp' | 'off' | 'sick' | 'trip' | 'study' | 'mat';
/** статус отсутствия: план (черновик, согласование) → согласовано; прошедшее — использовано */
export type AbsStatus = 'Черновик' | 'Согласование' | 'Согласовано' | 'Отклонено' | 'Использовано';

/** Отсутствие сотрудника: вид, период (дд.мм.гггг, включительно), статус */
export interface AbsEntry {
  id: string;
  kind: AbsKind;
  from: string;
  to: string;
  status: AbsStatus;
  /** комментарий (причина) */
  note?: string;
  /** сведения о командировке */
  trip?: AbsTrip;
  /** основание (документ): «Приказ 45-к», «Заявление от 02.06.2026», «ЭЛН 1234567890123» */
  basis?: string;
  /** файлы основания */
  files?: AttachFile[];
  /** дополнительный отпуск: причина; при донорстве — дата сдачи крови */
  reason?: string;
  donorDate?: string;
  /** учебный отпуск: неоплачиваемый */
  unpaid?: boolean;
  /** отпуск: заместитель на время отсутствия (ФИО) */
  deputy?: string;
  /** больничный: листок нетрудоспособности еще открыт (дата окончания — сегодня, может сдвигаться) */
  open?: boolean;
}

/** способ подсчета дней: календарные или рабочие (без выходных) */
export type AbsDayCount = 'cal' | 'work';

/** Командировка: куда, к кому, зачем, проезд и проживание */
export interface AbsTrip {
  city: string;
  org: string;
  goal: string;
  transport: string;
  hotel: boolean;
  /** время начала и окончания «чч:мм» */
  t1?: string;
  t2?: string;
  /** выходные дни периода, в которые сотрудник работает «дд.мм.гггг» */
  workDays?: string[];
}

/** Сотрудник в графике: остатки отпуска и отгулов, отсутствия */
/** команда подразделения в графике отсутствий; admin — видна только руководителю (вторая и следующие команды) */
export interface AbsTeam {
  dep: string;
  people: AbsPerson[];
  admin?: boolean;
}

export interface AbsPerson {
  n: string;
  pos: string;
  av: number | string;
  /** руководитель команды */
  lead?: boolean;
  /** остаток ежегодного отпуска и всего дней за год */
  vacLeft: number;
  vacTotal: number;
  /** накоплено отгулов, дней */
  offLeft: number;
  items: AbsEntry[];
}
