/* Конструктор заявки: виды инфоблоков (неизменные наборы полей), рабочие процессы, иконки типов заявок */
import { RqBlock, RqBlockKind, RqField, RqFieldType, RqWidth } from '../interface/req-builder';
import { REQ_DEPS, REQ_CHANNELS } from './req.data';

const F = (k: string, l: string, t: RqFieldType, o: Partial<RqField> = {}): RqField => ({
  k,
  l,
  t,
  on: true,
  req: false,
  w: t === 'textarea' || t === 'files' ? 100 : t === 'date' || t === 'number' ? 25 : 50,
  ...o,
});

/** виды инфоблоков: набор полей у вида неизменный — в конструкторе их только включают, переставляют и настраивают */
export const RQ_BLOCK_KINDS: RqBlockKind[] = [
  {
    /** все поля заявки типа «Тест» (форма «Добавление заявки»), в том же порядке и той же ширины */
    k: 'full',
    name: 'Полная заявка',
    icon: 'docLines',
    hint: 'Все поля заявки типа «Тест»',
    fields: [
      F('code', 'Код', 'text'),
      F('name', 'Наименование', 'text'),
      F('from', 'Дата с', 'date', { req: true }),
      F('to', 'Дата по', 'date'),
      F('procEnd', 'Дата завершения обработки', 'date'),
      F('chan', 'Канал поступления', 'select', { opts: REQ_CHANNELS }),
      F('dep', 'Подразделение', 'select', { opts: REQ_DEPS, w: 100 }),
      F('text', 'Текст обращения', 'textarea', { req: true }),
    ],
  },
  {
    k: 'docs',
    name: 'Связанные документы',
    icon: 'clip',
    hint: 'Загрузка документов к заявке',
    fields: [F('files', 'Документы', 'files', { formats: ['PDF', 'DOCX', 'XLSX', 'JPG', 'PNG'] })],
  },
];

let seq = 0;
/** новый инфоблок вида k — копия неизменного набора полей */
export const rqNewBlock = (k: string): RqBlock => {
  const K = RQ_BLOCK_KINDS.find((x) => x.k === k)!;
  return {
    id: 'rqb' + Date.now().toString(36) + seq++,
    kind: k,
    t: K.name,
    fields: K.fields.map((f) => ({ ...f, opts: f.opts ? [...f.opts] : undefined, formats: f.formats ? [...f.formats] : undefined })),
  };
};

/** инфоблоки нового типа заявки по умолчанию */
export const rqDefaultBlocks = (): RqBlock[] => [rqNewBlock('full'), rqNewBlock('docs')];

/** рабочие процессы заявки (справочник «Процесс заявки» — пока список) */
export const REQ_FLOWS = ['Согласование руководителем', 'Согласование руководителем и HR', 'Исполнение без согласования', 'Согласование и исполнение бухгалтерией'];

/** иконки типа заявки — выбор в «Общей информации» */
export const REQ_TYPE_ICONS = ['docLines', 'calendar', 'clock', 'userSm', 'monitor', 'lock', 'download', 'coin', 'gift', 'book', 'pin', 'target', 'group', 'mTask', 'clip', 'star'];

/** подписи видов поля — в настройках поля */
export const RQ_FIELD_TYPE_NAME: Record<RqFieldType, string> = {
  text: 'Строка',
  textarea: 'Многострочный текст',
  date: 'Дата',
  number: 'Число',
  select: 'Список',
  employee: 'Сотрудник',
  files: 'Файлы',
};

/** ширина поля в форме заявки, % строки — переключатель в настройках поля и шаги растягивания плитки */
export const RQ_WIDTHS: { value: RqWidth; label: string }[] = [
  { value: 25, label: '25 %' },
  { value: 33, label: '33 %' },
  { value: 50, label: '50 %' },
  { value: 100, label: '100 %' },
];

/** форматы документов — выбор в настройках поля загрузки («Связанные документы») */
export const RQ_FILE_FORMATS = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPTX', 'TXT', 'CSV', 'JPG', 'PNG', 'ZIP'];

/** подпись под зоной загрузки: «PDF, DOCX или PNG, до 50 МБ каждый»; без форматов — «Любые форматы» */
export const rqFormatsHint = (f: string[] | undefined): string =>
  !f?.length ? 'Любые форматы, до 50 МБ каждый' : (f.length === 1 ? f[0] : f.slice(0, -1).join(', ') + ' или ' + f[f.length - 1]) + ', до 50 МБ каждый';
