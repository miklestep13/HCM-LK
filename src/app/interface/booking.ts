import { Person } from '../data/people.data';

export type BkMode = 'desk' | 'room';
export type BkStatus = 'free' | 'busy' | 'mine';

/** Контекст этажа: офис, этаж, дата «30.09.2026» */
export interface BkCtx { office: string; floor: number; date: string; }

/** Рабочее место на карте */
export interface BkSeat {
  id: string;
  /** зона: А, Б, Т */
  z: string;
  /** номер стола (кластера) */
  c: number;
  x: number;
  y: number;
  /** оснащение: [два монитора, док-станция, у окна, регулируемый стол] */
  f: boolean[];
  st: BkStatus;
  p?: Person;
  /** «весь день», «до 15:00», «каждый вт, ср, пт» */
  till: string;
}

/** Переговорная на карте */
export interface BkRoom {
  i: number;
  no: string;
  n: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cap: number;
  eq: string[];
  st: BkStatus;
  t?: string;
  till?: string;
  topic?: string;
  ppl?: Person[];
}

/** Бронь места: кто и на какой период */
export interface BkDeskBooking { emp: string; per: string; }
/** Бронь переговорной */
export interface BkRoomBooking { t: string; topic: string; ppl: string[]; }
