import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, input, model, signal } from '@angular/core';
import { REQ_DEPS } from '../../data/req.data';
import { PEOPLE } from '../../data/people.data';
import { RQ_BLOCK_KINDS, RQ_FIELD_TYPE_NAME, RQ_FILE_FORMATS, RQ_WIDTHS, rqFormatsHint, rqNewBlock } from '../../data/req-builder.data';
import { AttachFile } from '../../interface/attach';
import { RqBlock, RqField } from '../../interface/req-builder';
import { Attach } from '../../shared/ui/attach/attach';
import { ChipSelect } from '../../shared/ui/chip-select/chip-select';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { DateField } from '../../shared/ui/date-field/date-field';
import { Field } from '../../shared/ui/field/field';
import { Float } from '../../shared/ui/float/float';
import { Icon } from '../../shared/ui/icon/icon';
import { Seg } from '../../shared/ui/seg/seg';
import { Select } from '../../shared/ui/select/select';

/** что перетаскивают: инфоблок или поле внутри инфоблока */
type Drag = { b: RqBlock; f?: RqField };

/**
 * Конструктор заявки — инфоблоки с неизменным набором полей (виды — RQ_BLOCK_KINDS в data/req-builder.data.ts).
 * «Редактор» — как в Тильде: форма видна целиком, как у сотрудника; инфоблок — карточка с названием (правится на месте) и раскладкой полей в 4 колонки.
 * По наведению на инфоблок — панель: перетащить, выше / ниже, скрыть заголовок (в заявке инфоблок без названия), удалить; «+» между инфоблоками — вставить инфоблок.
 * Поле — настоящий контрол дизайн-системы (подпись внутри поля) шириной как в заявке, без ввода; плитку можно перетащить, растянуть за правый край и «скрыть»; щелчок — настройки поля под раскладкой
 * (подпись, подсказка, ширина, «Обязательное», «Скрыть поле»); скрытые поля — чипами под раскладкой. Внизу — «Добавить инфоблок» (каждый вид — один раз).
 * «Предпросмотр» — форма заявки, как ее увидит сотрудник: сверху «Тип заявки» (выбран этот тип), ниже включенные поля инфоблоков.
 *   <div app-req-builder [(blocks)]="blocks"></div>
 */
@Component({
  selector: '[app-req-builder]',
  imports: [Seg, Icon, Float, Field, Select, DateField, Attach, ChipSelect],
  templateUrl: './req-builder.html',
  styleUrl: './req-builder.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-rqb', '(document:click)': 'pal.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqBuilder {
  readonly blocks = model.required<RqBlock[]>();
  /** тип заявки в предпросмотре — выбранным в поле «Тип заявки», как в форме «Добавление заявки» */
  readonly title = input('');
  private readonly confirm = inject(ConfirmService);

  protected readonly kinds = RQ_BLOCK_KINDS;
  protected readonly typeName = RQ_FIELD_TYPE_NAME;
  protected readonly widths = RQ_WIDTHS;
  protected readonly fileFormats = RQ_FILE_FORMATS;
  protected readonly formatsHint = rqFormatsHint;
  protected readonly modes: { value: 'edit' | 'view'; label: string }[] = [
    { value: 'edit', label: 'Редактор' },
    { value: 'view', label: 'Предпросмотр' },
  ];
  protected readonly mode = signal<'edit' | 'view'>('edit');
  /** палитра «Добавить инфоблок»: у какой кнопки и на какое место вставить */
  protected readonly pal = signal<{ a: HTMLElement; at: number } | null>(null);
  /** выбранное: поле (настройки поля под раскладкой) или только что добавленный инфоблок (синяя рамка) */
  protected readonly sel = signal<{ b: string; f?: string } | null>(null);
  /** подсказка в контроле плитки и иконка справа — как поле выглядит у сотрудника */
  protected readonly ph: Record<string, string> = { text: 'Строка', textarea: 'Многострочный текст', date: 'дд.мм.гггг', number: '0', select: 'Выберите значение', employee: 'Выберите сотрудника', files: 'Перетащите файлы или выберите' };
  protected readonly ctlIcon: Record<string, string> = { date: 'calendar', select: 'chevDown', employee: 'chevDown', files: 'upload' };
  protected readonly drag = signal<Drag | null>(null);
  /** виды, которые уже есть в заявке (каждый — один раз) */
  protected readonly used = computed(() => new Set(this.blocks().map((b) => b.kind)));
  protected readonly fieldsOn = (b: RqBlock) => b.fields.filter((f) => f.on).length;
  protected icon(b: RqBlock): string {
    return this.kinds.find((k) => k.k === b.kind)?.icon ?? 'docLines';
  }

  // ——— предпросмотр: ответы в полях (только для показа) ———
  protected readonly people = PEOPLE.map((p) => p[0]);
  protected readonly deps = REQ_DEPS;
  protected readonly vals = signal<Record<string, string>>({});
  protected readonly files = signal<Record<string, AttachFile[] | undefined>>({});
  protected val(b: RqBlock, f: RqField): string {
    return this.vals()[b.id + f.k] ?? '';
  }
  protected setVal(b: RqBlock, f: RqField, v: string): void {
    this.vals.update((m) => ({ ...m, [b.id + f.k]: v }));
  }
  protected setFiles(b: RqBlock, f: RqField, l: AttachFile[]): void {
    this.files.update((m) => ({ ...m, [b.id + f.k]: l }));
  }
  /** число — только цифры */
  protected setNum(b: RqBlock, f: RqField, el: HTMLInputElement): void {
    el.value = el.value.replace(/\D/g, '');
    this.setVal(b, f, el.value);
  }
  /** класс ширины: сетка из 12 колонок — 25 % = 3, 33 % = 4, 50 % = 6, 100 % = 12 */
  protected wcls(f: RqField): string {
    return 'rqbw' + f.w;
  }

  // ——— растягивание плитки за правый край: ширина прилипает к ближайшему шагу (25, 33, 50, 100 %) ———
  protected readonly sizing = signal('');
  protected resize(e: PointerEvent, b: RqBlock, f: RqField): void {
    e.preventDefault();
    e.stopPropagation();
    const tile = (e.currentTarget as HTMLElement).closest('.rqbt') as HTMLElement;
    const grid = tile.parentElement as HTMLElement;
    const left = tile.getBoundingClientRect().left, total = grid.getBoundingClientRect().width;
    this.sizing.set(this.cfgKeyOf(b, f));
    const move = (ev: PointerEvent) => {
      const pct = ((ev.clientX - left) / total) * 100;
      const w = RQ_WIDTHS.reduce((a, x) => (Math.abs(x.value - pct) < Math.abs(a.value - pct) ? x : a)).value;
      const cur = this.blocks().find((v) => v.id === b.id)?.fields.find((x) => x.k === f.k);
      if (cur && cur.w !== w) this.patchField(b, f, { w });
    };
    const up = () => {
      this.sizing.set('');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  protected cfgKeyOf(b: RqBlock, f: RqField): string {
    return b.id + ':' + f.k;
  }

  // ——— правка: инфоблоки и поля меняются копией списка ———
  private patchBlock(b: RqBlock, x: Partial<RqBlock>): void {
    this.blocks.update((l) => l.map((v) => (v.id === b.id ? { ...v, ...x } : v)));
  }
  protected patchField(b: RqBlock, f: RqField, x: Partial<RqField>): void {
    const cur = this.blocks().find((v) => v.id === b.id)!;
    this.patchBlock(cur, { fields: cur.fields.map((v) => (v.k === f.k ? { ...v, ...x } : v)) });
  }
  /** скрыть / показать заголовок инфоблока */
  protected toggleTitle(b: RqBlock): void {
    this.patchBlock(b, { noTitle: !b.noTitle });
  }
  protected rename(b: RqBlock, t: string): void {
    this.patchBlock(b, { t });
  }
  /** выключенное поле не может быть обязательным */
  protected setOn(b: RqBlock, f: RqField, on: boolean): void {
    this.patchField(b, f, on ? { on } : { on, req: false });
  }
  private readonly host = inject(ElementRef<HTMLElement>);
  /** щелчок по полю — выбрать и сразу поставить курсор в «Подпись» (переименовать) */
  protected pickField(b: RqBlock, f: RqField): void {
    const off = this.isSel(b, f);
    this.sel.set(off ? null : { b: b.id, f: f.k });
    if (!off) setTimeout(() => (this.host.nativeElement.querySelector('.rqbname') as HTMLInputElement | null)?.focus(), 30);
  }
  protected isSel(b: RqBlock, f: RqField): boolean {
    const s = this.sel();
    return s?.b === b.id && s.f === f.k;
  }
  /** что выбрано в инфоблоке: 'block' — сам инфоблок, 'field' — поле, '' — ничего */
  protected blockSel(b: RqBlock): '' | 'block' | 'field' {
    const s = this.sel();
    return s?.b !== b.id ? '' : s.f ? 'field' : 'block';
  }
  /** выбранное поле инфоблока (если оно не скрыто) */
  protected selField(b: RqBlock): RqField | null {
    const s = this.sel();
    return s?.b === b.id && s.f ? (b.fields.find((f) => f.k === s.f && f.on) ?? null) : null;
  }
  /** инфоблок выше / ниже */
  protected move(b: RqBlock, d: -1 | 1): void {
    const l = [...this.blocks()], i = l.findIndex((v) => v.id === b.id), j = i + d;
    if (j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j], l[i]];
    this.blocks.set(l);
  }
  protected openPal(e: Event, at: number): void {
    e.stopPropagation();
    const a = e.currentTarget as HTMLElement;
    this.pal.set(this.pal()?.a === a ? null : { a, at });
  }
  protected add(k: string, at: number): void {
    if (this.used().has(k)) return;
    const nb = rqNewBlock(k);
    this.blocks.update((l) => [...l.slice(0, at), nb, ...l.slice(at)]);
    this.sel.set({ b: nb.id });
    this.pal.set(null);
  }
  protected async del(b: RqBlock): Promise<void> {
    if (await this.confirm.ask({ title: 'Удалить инфоблок?', text: 'Инфоблок **' + b.t + '** и настройки его полей будут удалены из заявки.', ok: 'Удалить', danger: true }))
      this.blocks.update((l) => l.filter((v) => v.id !== b.id));
  }

  // ——— перетаскивание: инфоблок — среди инфоблоков, поле — внутри своего инфоблока ———
  protected start(e: DragEvent, d: Drag): void {
    e.stopPropagation();
    e.dataTransfer?.setData('text/plain', '');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    const row = (e.target as HTMLElement).closest(d.f ? '.rqbf' : '.rqbblk');
    if (row && e.dataTransfer) e.dataTransfer.setDragImage(row, 20, 16);
    this.drag.set(d);
  }
  protected overBlock(e: DragEvent, b: RqBlock): void {
    const d = this.drag();
    if (!d || d.f) return;
    e.preventDefault();
    if (d.b.id === b.id) return;
    const l = [...this.blocks()];
    const from = l.findIndex((v) => v.id === d.b.id), to = l.findIndex((v) => v.id === b.id);
    l.splice(to, 0, l.splice(from, 1)[0]);
    this.blocks.set(l);
  }
  protected overField(e: DragEvent, b: RqBlock, f: RqField): void {
    const d = this.drag();
    if (!d?.f || d.b.id !== b.id) return;
    e.preventDefault();
    e.stopPropagation();
    if (d.f.k === f.k) return;
    const cur = this.blocks().find((v) => v.id === b.id)!;
    const l = [...cur.fields];
    const from = l.findIndex((v) => v.k === d.f!.k), to = l.findIndex((v) => v.k === f.k);
    l.splice(to, 0, l.splice(from, 1)[0]);
    this.patchBlock(cur, { fields: l });
  }
  protected drop(e: DragEvent): void {
    e.preventDefault();
    this.drag.set(null);
  }
  protected isDrag(b: RqBlock, f?: RqField): boolean {
    const d = this.drag();
    return !!d && d.b.id === b.id && (f ? d.f?.k === f.k : !d.f);
  }
}
