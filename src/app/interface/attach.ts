/** Прикрепленный файл: st 'load' — еще загружается */
export interface AttachFile {
  id: string;
  name: string;
  /** байты */
  size: number;
  st: 'load' | 'ok';
  date?: string;
  /** кто загрузил */
  by?: string;
  /** адрес файла (выбран с компьютера) */
  url?: string;
}
