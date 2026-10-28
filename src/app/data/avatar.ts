import { ORG } from './org.data';
import { ME_PHOTO, avCls } from './people.data';

/** Портрет человека: фото (img) или класс портрета .av1–.av8 */
export interface Avatar {
  photo?: string;
  cls: string;
}
const ME_NAME = 'Иванов Павел Сергеевич';

/**
 * Портрет по ФИО: я — свое фото; сотрудник из оргструктуры — его фото или портрет;
 * остальные — портрет из справочника страницы (extra) или первый.
 */
export function personAvatar(name: string, extra: Record<string, number> = {}): Avatar {
  if (name === ME_NAME) return { photo: ME_PHOTO, cls: '' };
  const n = ORG.find((x) => x.name === name);
  if (n?.photo) return { photo: n.photo, cls: '' };
  if (n?.av) return { cls: avCls(name, n.av) };
  return { cls: avCls(name, extra[name] || 1) };
}
