import { Injectable, computed, inject, signal } from '@angular/core';
import { BldTemplatesStore } from '../../core/demo/bld-templates.store';
import { BLD_KINDS, BLD_MOD_KINDS, bldId, moduleFromTemplate, newBlock, newKindModule, newModule } from '../../data/builder.data';
import { newPollQuestion } from '../../data/polls.data';
import { BldBlock, BldBlockType, BldMaterial, BldModKind, BldModTemplate, BldModule, BldSection } from '../../interface/builder';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { PollQType, PollQuestion } from '../../interface/poll';

/** что выбрано в центре: модуль (ничего) или блок — у выбранного блока под ним раскрыты настройки */
export type BldSel = { lv: 'mod' } | { lv: 'blk'; b: BldBlock };

const deep = <T>(o: T): T => JSON.parse(JSON.stringify(o));

/**
 * Состояние конструктора (свое у каждого экземпляра виджета): материал (изменяемые объекты; после правки — touch()),
 * открытый модуль, выбранный блок, режим «Редактор / Предпросмотр». onChange — сообщить странице о правке.
 */
@Injectable()
export class BuilderState {
  readonly mat = signal<BldMaterial>({ kind: 'course', t: '', flat: false, paging: 'module', secs: [] });
  /** счетчик правок: шаблоны читают его, чтобы перерисоваться после изменения вложенных объектов */
  readonly ver = signal(0);
  readonly mod = signal<BldModule | null>(null);
  readonly sel = signal<BldSel>({ lv: 'mod' });
  readonly mode = signal<'edit' | 'view'>('edit');
  onChange: (m: BldMaterial) => void = () => {};
  private readonly tpls = inject(BldTemplatesStore);
  private readonly toast = inject(ToastService);

  readonly conf = computed(() => BLD_KINDS[this.mat().kind]);
  /** у курса модули разных видов (Модуль, Задание, Тестирование, Опрос) и шаблоны модулей */
  readonly kinded = computed(() => this.mat().kind === 'course');
  /** палитра блоков открытого модуля: у курса — по виду модуля, иначе — по виду материала */
  readonly groups = computed(() => {
    this.ver();
    const m = this.mod();
    return this.kinded() ? BLD_MOD_KINDS[m?.mk ?? 'mod'].groups : this.conf().groups;
  });
  /** название уровня модуля: у курса — вид модуля («Тестирование»), иначе — «Модуль» / «Этап» / «Шаг» */
  unit(m: BldModule): string {
    return this.kinded() ? BLD_MOD_KINDS[m.mk ?? 'mod'].name : this.conf().mod;
  }
  readonly mods = computed(() => {
    this.ver();
    return this.mat().secs.flatMap((s) => s.mods);
  });
  readonly blockN = computed(() => this.mods().reduce((a, m) => a + m.blocks.length, 0));
  /** сквозной номер вопроса в материале */
  readonly qnum = computed(() => {
    let n = 0;
    return new Map(this.mods().flatMap((m) => m.blocks.filter((b) => b.k === 'q').map((b) => [b, ++n] as const)));
  });

  /** открыть материал; уровни — по виду: два уровня — модули одним списком, три — по разделам */
  load(m: BldMaterial): void {
    const flat = BLD_KINDS[m.kind].levels === 2;
    if (flat && m.secs.length > 1) m.secs = [{ id: bldId('s'), t: '', mods: m.secs.flatMap((s) => s.mods) }];
    if (!flat && !m.secs[0]?.t && m.secs[0]) m.secs[0].t = 'Раздел 1';
    m.flat = flat;
    if (!BLD_KINDS[m.kind].one) m.one = false;
    this.mat.set(m);
    const first = m.secs.flatMap((s) => s.mods)[0] ?? null;
    this.mod.set(first);
    this.sel.set({ lv: 'mod' });
    this.bump(false);
  }
  touch(): void {
    this.bump(true);
  }
  private bump(notify: boolean): void {
    this.ver.update((v) => v + 1);
    this.mat.set({ ...this.mat() });
    if (notify) this.onChange(this.mat());
  }

  // ——— выбор ———
  openMod(m: BldModule): void {
    this.mod.set(m);
    this.sel.set({ lv: 'mod' });
  }
  selBlock(b: BldBlock): void {
    this.sel.set({ lv: 'blk', b });
  }
  isSel(b: BldBlock): boolean {
    const s = this.sel();
    return s.lv === 'blk' && s.b === b;
  }
  secOf(m: BldModule): BldSection | undefined {
    return this.mat().secs.find((s) => s.mods.includes(m));
  }
  /** «2.1» — раздел и модуль; без разделов — номер модуля */
  modNum(m: BldModule): string {
    const M = this.mat();
    if (M.flat) return String(this.mods().indexOf(m) + 1);
    const si = M.secs.findIndex((s) => s.mods.includes(m));
    return si < 0 ? '' : si + 1 + '.' + (M.secs[si].mods.indexOf(m) + 1);
  }

  // ——— разделы и модули ———
  /** один уровень (только блоки): модули сливаются в один; обратно — один модуль «Модуль 1» */
  setOne(one: boolean): void {
    const M = this.mat();
    const all = this.mods();
    const m = all[0] ?? newModule(1, this.conf().mod);
    if (one) {
      m.blocks = all.flatMap((x) => x.blocks);
      m.t = '';
      m.d = '';
    } else if (!m.t) m.t = this.conf().mod + ' 1';
    M.secs = [{ id: bldId('s'), t: '', mods: [m] }];
    M.one = one;
    this.mod.set(m);
    this.sel.set({ lv: 'mod' });
    this.touch();
  }
  addSection(): void {
    const M = this.mat();
    const n = this.mods().length + 1;
    const s: BldSection = { id: bldId('s'), t: 'Раздел ' + (M.secs.length + 1), mods: [this.kinded() ? newKindModule('mod', n) : newModule(n, this.conf().mod)] };
    M.secs.push(s);
    this.openMod(s.mods[0]);
    this.touch();
  }
  delSection(s: BldSection): void {
    const M = this.mat();
    if (M.secs.length < 2) return;
    M.secs.splice(M.secs.indexOf(s), 1);
    if (!this.mods().includes(this.mod()!) || s.mods.includes(this.mod()!)) this.mod.set(M.secs[0].mods[0] ?? null);
    this.sel.set({ lv: 'mod' });
    this.touch();
  }
  /** новый модуль в конец раздела: у курса — выбранного вида (mk) или из шаблона */
  addModule(s: BldSection, mk?: BldModKind, tpl?: BldModTemplate): void {
    // у курса номер в названии — по виду: «Тестирование 2» — второе тестирование в курсе
    const n = this.kinded() ? this.mods().filter((x) => (x.mk ?? 'mod') === (mk ?? 'mod')).length + 1 : this.mods().length + 1;
    const m = tpl ? moduleFromTemplate(tpl) : this.kinded() ? newKindModule(mk ?? 'mod', n) : newModule(n, this.conf().mod);
    s.mods.push(m);
    this.openMod(m);
    this.touch();
  }
  /** сохранить модуль в шаблоны — потом его можно добавить в любой курс */
  saveTemplate(m: BldModule): void {
    this.tpls.save(m);
    this.toast.show('Готово', 'Шаблон «' + (m.t || this.unit(m)) + '» сохранен — его можно выбрать при добавлении модуля.');
  }
  dupModule(m: BldModule): void {
    const s = this.secOf(m)!;
    const c: BldModule = { ...deep(m), id: bldId('m'), t: m.t + ' (копия)' };
    c.blocks.forEach((b) => (b.id = bldId()));
    s.mods.splice(s.mods.indexOf(m) + 1, 0, c);
    this.openMod(c);
    this.touch();
  }
  delModule(m: BldModule): void {
    if (this.mods().length < 2) return;
    const s = this.secOf(m)!;
    s.mods.splice(s.mods.indexOf(m), 1);
    if (this.mod() === m) this.mod.set(this.mods()[0] ?? null);
    this.sel.set({ lv: 'mod' });
    this.touch();
  }
  moveSection(a: number, b: number): void {
    const l = this.mat().secs;
    const [x] = l.splice(a, 1);
    l.splice(b, 0, x);
    this.touch();
  }
  moveModule(m: BldModule, to: BldSection, i: number): void {
    const from = this.secOf(m)!;
    from.mods.splice(from.mods.indexOf(m), 1);
    to.mods.splice(Math.min(i, to.mods.length), 0, m);
    this.touch();
  }

  // ——— блоки ———
  /** добавить блок в открытый модуль на позицию at (по умолчанию — в конец) и выбрать его */
  addBlock(k: BldBlockType, qt?: PollQType, at?: number): BldBlock | null {
    const m = this.mod();
    if (!m) return null;
    const b = newBlock(k, qt);
    m.blocks.splice(at ?? m.blocks.length, 0, b);
    this.selBlock(b);
    this.touch();
    return b;
  }
  dupBlock(b: BldBlock): void {
    const m = this.mod()!;
    const c: BldBlock = { ...deep(b), id: bldId() };
    m.blocks.splice(m.blocks.indexOf(b) + 1, 0, c);
    this.selBlock(c);
    this.touch();
  }
  delBlock(b: BldBlock): void {
    const m = this.mod()!;
    m.blocks.splice(m.blocks.indexOf(b), 1);
    if (this.isSel(b)) this.sel.set({ lv: 'mod' });
    this.touch();
  }
  moveBlock(b: BldBlock, to: number): void {
    const l = this.mod()!.blocks;
    const i = l.indexOf(b);
    if (to < 0 || to >= l.length || to === i) return;
    l.splice(i, 1);
    l.splice(to, 0, b);
    this.touch();
  }
  /**
   * Смена вида блока (список в панели блока): вопрос → другой тип вопроса (setQType), иначе — новый блок того же места
   * с перенесенным текстом: текст вопроса ↔ текст блока / формулировка задания, название ↔ подпись.
   */
  setKind(b: BldBlock, k: BldBlockType, qt?: PollQType): void {
    if (b.k === 'q' && k === 'q') return this.setQType(b.q!, qt!);
    const plain = (h = '') => h.replace(/<\/(p|li|div)>|<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const text = b.k === 'q' ? b.q!.n : b.k === 'text' || b.k === 'task' ? plain(b.html) : b.title || '';
    const n = newBlock(k, qt);
    if (k === 'q') n.q!.n = text;
    else if (k === 'text') n.html = text ? '<p>' + text + '</p>' : '';
    else if (k === 'task') n.html = text;
    else if (k !== 'course' && text && k !== 'files') n.title = text;
    // тот же блок на том же месте: меняем содержимое объекта, ссылки и выбор сохраняются
    for (const key of Object.keys(b) as (keyof BldBlock)[]) if (key !== 'id') delete b[key];
    Object.assign(b, { ...n, id: b.id });
    this.touch();
  }
  /** смена типа вопроса: настройки ответа — по умолчанию нового типа, текст и варианты сохраняются */
  setQType(q: PollQuestion, t: PollQType): void {
    const d = newPollQuestion(t);
    Object.assign(q, { t, scale: d.scale, view: d.view, lo: d.lo, hi: d.hi, ph: d.ph, max: d.max, unit: d.unit, mn: d.mn, mx: d.mx, ok: [] });
    if (t === 'enps' && !q.n) q.n = d.n;
    if (t === 'yesno' || t === 'matrix' || !q.opts?.length) q.opts = d.opts;
    if (t === 'matrix' && !q.rows?.length) q.rows = d.rows;
    this.touch();
  }
}
