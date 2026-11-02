import { AbsDayCount, AbsEntry, AbsKind, AbsPerson, AbsStatus, AbsTrip } from '../interface/absence';
import { AttachFile } from '../interface/attach';
import { ME, PEOPLE } from './people.data';

/** виды отсутствий: подпись и цвет полосы на диаграмме (класс .ab-<kind>) — легенда, фильтр, карточка */
export const ABS_KINDS: { k: AbsKind; label: string }[] = [
  { k: 'vac', label: 'Основной отпуск' },
  { k: 'add', label: 'Дополнительный отпуск' },
  { k: 'unp', label: 'Отпуск за свой счет' },
  { k: 'study', label: 'Учебный отпуск' },
  { k: 'mat', label: 'Отпуск по уходу за ребенком' },
  { k: 'off', label: 'Отгул' },
  { k: 'sick', label: 'Больничный' },
  { k: 'trip', label: 'Командировка' },
];
/** «Отпуск» в заявке: тип отпуска выбирается вторым полем */
export const ABS_VAC_TYPES: { k: AbsKind; label: string }[] = [
  { k: 'add', label: 'Отпуск дополнительный' },
  { k: 'unp', label: 'Отпуск за свой счет' },
  { k: 'study', label: 'Учебный отпуск' },
  { k: 'mat', label: 'Отпуск по уходу за ребенком' },
];
/** виды отпуска — у всех есть заместитель */
export const ABS_LEAVE_KINDS: AbsKind[] = ['vac', 'add', 'unp', 'study', 'mat'];
/** «Оформить ▾» и «Вид отсутствия» в заявке: основной отпуск — только в период планирования; «Отпуск» — с типом */
export const ABS_APPLY: { k: AbsKind; label: string; plan?: boolean }[] = [
  { k: 'vac', label: 'Основной отпуск', plan: true },
  { k: 'add', label: 'Отпуск' },
  { k: 'off', label: 'Отгул' },
  { k: 'sick', label: 'Больничный' },
  { k: 'trip', label: 'Командировка' },
];
/** способ подсчета дней по виду: отгул — в рабочих днях, остальное — в календарных */
export const ABS_DAY_COUNT: Record<AbsKind, AbsDayCount> = { vac: 'cal', add: 'cal', unp: 'cal', off: 'work', sick: 'cal', trip: 'cal', study: 'cal', mat: 'cal' };
export const ABS_DAY_COUNT_LABEL: Record<AbsDayCount, string> = { cal: 'Календарные дни', work: 'Рабочие дни' };
export const ABS_KIND_LABEL: Record<AbsKind, string> = Object.fromEntries(ABS_KINDS.map((x) => [x.k, x.label])) as Record<AbsKind, string>;
export const ABS_STATUSES: AbsStatus[] = ['Черновик', 'Согласование', 'Согласовано', 'Отклонено', 'Использовано'];
export const ABS_STATUS_TONE: Record<AbsStatus, string> = { Черновик: '', Согласование: 'warn', Согласовано: 'ok', Отклонено: 'dg', Использовано: '' };
/** причина дополнительного отпуска; при донорстве — дата сдачи и обязательный документ */
export const ABS_ADD_REASONS = ['Донорство крови', 'Выполнение гос. обязанностей', 'Компенсация ЧАЭС'];
export const ABS_DONOR = 'Донорство крови';
/** организации для командировки (список с поиском) */
export const ABS_ORGS = [
  'Головной офис',
  'Северо-Западный филиал',
  'Приволжский филиал',
  'Уральский филиал',
  'Сибирский филиал',
  'Южный филиал',
  'Офис «Тверской»',
  'АО «Национальное бюро кредитных историй»',
  'ООО «ФинТех Решения»',
  'Банк России, Главное управление',
];
/** транспорт в командировку */
export const ABS_TRANSPORT = ['Самолет', 'Поезд', 'Автомобиль', 'Без проезда'];
/** период планирования отпусков на следующий год */
export const ABS_PLAN = { year: 2027, till: '15.11.2026', days: 35 };

let n = 0;
/** дата за d дней до «дд.мм.гггг» */
const before = (dmy: string, d: number): string => {
  const [dd, mm, yy] = dmy.split('.').map(Number), t = new Date(yy, mm - 1, dd - d);
  return String(t.getDate()).padStart(2, '0') + '.' + String(t.getMonth() + 1).padStart(2, '0') + '.' + t.getFullYear();
};
const file = (name: string, size: number, date: string, by?: string): AttachFile => ({ id: 'af' + ++n, name, size, st: 'ok', date, by });
/** демо-основание и документы по виду: заявление (и приказ, если согласовано), ЭЛН, приказ о командировке, свидетельство о рождении */
const docs = (kind: AbsKind, from: string, status: AbsStatus, basis?: string, reason?: string): Pick<AbsEntry, 'basis' | 'files'> => {
  const ok = status === 'Согласовано' || status === 'Использовано', d = before(from, 14), num = 30 + (n % 60);
  switch (kind) {
    case 'sick': {
      const eln = basis?.replace('ЭЛН ', '') || '9102345' + String(10000 + n * 37).slice(-5);
      return { basis: 'ЭЛН ' + eln, files: [file('ЭЛН_' + eln + '.pdf', 182_400, from, 'Социальный фонд')] };
    }
    case 'trip':
      return {
        basis: basis || 'Приказ ' + num + '-к от ' + d,
        files: [file('Приказ о командировке ' + num + '-к.pdf', 246_800, d, 'Кадровая служба'), file('Служебное задание.docx', 58_300, d)],
      };
    case 'mat':
      return {
        basis: basis || 'Приказ ' + num + '-о от ' + d,
        files: [file('Заявление на отпуск по уходу за ребенком.pdf', 131_500, d), file('Свидетельство о рождении.jpg', 1_284_000, d)],
      };
    default: {
      const what = kind === 'off' ? 'отгул' : kind === 'study' ? 'учебный отпуск' : kind === 'unp' ? 'отпуск без сохранения зарплаты' : kind === 'add' ? 'дополнительный отпуск' : 'отпуск';
      const f = [file('Заявление на ' + what + '.pdf', 96_200 + n * 113, d)];
      if (kind === 'study') f.push(file('Справка-вызов из вуза.pdf', 412_000, d));
      if (reason === ABS_DONOR) f.push(file('Справка о донорстве (форма 402у).pdf', 158_900, d));
      if (ok) f.push(file('Приказ ' + num + '-о.pdf', 214_700, before(from, 7), 'Кадровая служба'));
      return { basis: basis || (ok ? 'Приказ ' + num + '-о от ' + before(from, 7) : 'Заявление от ' + d), files: f };
    }
  }
};
const e = (kind: AbsKind, from: string, to: string, status: AbsStatus, note?: string, x?: Partial<AbsEntry>): AbsEntry => {
  const id = 'ab' + ++n;
  return { id, kind, from, to, status, note, ...x, ...docs(kind, from, status, x?.basis, x?.reason) };
};
const trip = (city: string, org: string, goal: string, transport = 'Поезд', hotel = true, x: Partial<AbsTrip> = {}): Partial<AbsEntry> => ({
  trip: { city, org, goal, transport, hotel, t1: '09:00', t2: '18:00', ...x },
});
const p = (name: string, lead = false): Pick<AbsPerson, 'n' | 'pos' | 'av' | 'lead'> => {
  const x = PEOPLE.find((q) => q[0] === name)!;
  return { n: x[0], pos: x[1], av: x[3], lead };
};

/** я (первая строка) */
export const ABS_ME: AbsPerson = {
  n: ME[0],
  pos: ME[1],
  av: 1,
  vacLeft: 14,
  vacTotal: 35,
  offLeft: 1,
  items: [
    e('vac', '04.05.2026', '17.05.2026', 'Использовано', '', { basis: 'Приказ 31-о от 20.04.2026' }),
    e('study', '11.03.2026', '13.03.2026', 'Использовано', '', { basis: 'Справка-вызов из вуза' }),
    e('sick', '03.06.2026', '06.06.2026', 'Использовано', '', { basis: 'ЭЛН 910234567812' }),
    e('off', '16.09.2026', '16.09.2026', 'Согласование', 'За работу в выходной 05.09', { basis: 'Заявление от 10.09.2026' }),
    e('vac', '12.10.2026', '18.10.2026', 'Согласовано', '', { basis: 'Заявление от 02.09.2026', deputy: 'Орлов Денис Викторович' }),
    e('trip', '24.11.2026', '29.11.2026', 'Согласовано', '', trip('Санкт-Петербург', 'Северо-Западный филиал', 'Обучение сотрудников филиала новому кредитному конвейеру', 'Поезд', true, { t1: '07:30', t2: '20:00', workDays: ['28.11.2026'] })),
    e('add', '14.09.2026', '14.09.2026', 'Использовано', '', { reason: 'Донорство крови', donorDate: '11.09.2026' }),
  ],
};

/** моя команда (Управление кредитования) */
export const ABS_TEAM: AbsPerson[] = [
  { ...p('Федорова Юлия Сергеевна', true), vacLeft: 9, vacTotal: 28, offLeft: 2, items: [
    e('vac', '13.04.2026', '26.04.2026', 'Использовано'), e('vac', '17.08.2026', '30.08.2026', 'Использовано'), e('trip', '05.10.2026', '07.10.2026', 'Согласовано', '', trip('Москва', 'Головной офис', 'Стратегическая сессия руководителей кредитования', 'Самолет')), e('add', '21.12.2026', '27.12.2026', 'Согласование', '', { deputy: 'Гусева Нина Павловна', reason: 'Компенсация ЧАЭС' }),
  ] },
  { ...p('Гусева Нина Павловна'), vacLeft: 14, vacTotal: 28, offLeft: 0, items: [
    e('vac', '01.07.2026', '14.07.2026', 'Использовано'), e('sick', '09.09.2026', '18.09.2026', 'Использовано', '', { basis: 'ЭЛН 910234561177' }), e('sick', '28.09.2026', '30.09.2026', 'Согласовано', '', { basis: 'ЭЛН 910234569021', open: true }), e('vac', '02.11.2026', '15.11.2026', 'Согласовано', '', { deputy: 'Волков Андрей Ильич' }),
  ] },
  { ...p('Орлов Денис Викторович'), vacLeft: 21, vacTotal: 28, offLeft: 3, items: [
    e('unp', '16.03.2026', '22.03.2026', 'Использовано', 'Семейные обстоятельства', { basis: 'Заявление от 10.03.2026' }), e('off', '28.09.2026', '30.09.2026', 'Согласовано'), e('vac', '07.12.2026', '20.12.2026', 'Согласование', '', { deputy: 'Иванов Павел Сергеевич' }),
  ] },
  { ...p('Попов Максим Андреевич'), vacLeft: 0, vacTotal: 28, offLeft: 1, items: [
    e('mat', '10.08.2026', '10.07.2028', 'Согласовано', 'Отпуск по уходу за ребенком до 1,5 лет'),
  ] },
  { ...p('Волков Андрей Ильич'), vacLeft: 7, vacTotal: 28, offLeft: 0, items: [
    e('vac', '18.05.2026', '31.05.2026', 'Использовано'), e('study', '21.09.2026', '02.10.2026', 'Согласовано', 'Сессия, магистратура', { deputy: 'Гусева Нина Павловна', unpaid: true }), e('vac', '16.11.2026', '22.11.2026', 'Черновик'),
  ] },
];

/** кого можно добавить в график (коллеги из других подразделений) */
export const ABS_POOL: AbsPerson[] = [
  { ...p('Ершов Никита Павлович'), vacLeft: 10, vacTotal: 28, offLeft: 0, items: [e('vac', '28.09.2026', '11.10.2026', 'Согласовано'), e('trip', '19.10.2026', '23.10.2026', 'Согласовано', '', trip('Казань', 'Приволжский филиал', 'Аудит кредитных досье', 'Самолет'))] },
  { ...p('Панова Алина Викторовна'), vacLeft: 18, vacTotal: 28, offLeft: 1, items: [e('vac', '03.08.2026', '16.08.2026', 'Использовано'), e('vac', '25.12.2026', '31.12.2026', 'Согласование')] },
  { ...p('Зотова Дарья Андреевна'), vacLeft: 4, vacTotal: 28, offLeft: 2, items: [e('sick', '24.09.2026', '30.09.2026', 'Согласовано', '', { basis: 'ЭЛН 910234560455', open: true }), e('vac', '09.11.2026', '22.11.2026', 'Согласовано')] },
  { ...p('Соколова Екатерина Дмитриевна'), vacLeft: 12, vacTotal: 28, offLeft: 0, items: [e('vac', '22.06.2026', '05.07.2026', 'Использовано'), e('trip', '14.10.2026', '16.10.2026', 'Согласовано', '', trip('Тверь', 'Офис «Тверской»', 'Запуск нового офиса', 'Автомобиль', false))] },
  { ...p('Громов Илья Сергеевич'), vacLeft: 20, vacTotal: 28, offLeft: 4, items: [e('off', '02.10.2026', '02.10.2026', 'Согласовано'), e('vac', '23.11.2026', '06.12.2026', 'Черновик')] },
];
