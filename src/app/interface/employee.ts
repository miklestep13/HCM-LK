/** Сотрудник (карточка коллеги, профиль, участник) */
export interface Employee {
  name: string;
  role: string;
  photo: string;
  tags?: { text: string; tone: '' | 'ok' | 'warn' | 'dg' | 'info' }[];
}

export interface ProfileRow {
  label: string;
  value: string;
  link?: boolean;
}

export interface Profile {
  name: string;
  role: string;
  photo: string;
  rows: ProfileRow[];
}
