import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BLD_MOD_KINDS, BLD_MOD_KIND_LIST, bldBlockIcon, bldBlockLabel, bldBlockName } from '../../../data/builder.data';
import { BldBlock, BldModKind, BldModTemplate, BldModule, BldSection } from '../../../interface/builder';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { BldTpl } from '../builder-tpl/builder-tpl';
import { BuilderState } from '../builder.state';

/** что перетаскивают: раздел, модуль или блок (один уровень) */
type Drag = { sec: BldSection } | { mod: BldModule } | BldBlock;

/**
 * Структура материала (слева, как на странице прохождения): шапка «Структура курса» и число модулей (настройки прохождения — в форме материала, шаг «Общая информация»);
 * разделы — название правится прямо в строке, корзина и стрелка «свернуть» — справа; модули — номер, иконка вида (курс), название (клик — открыть модуль), по наведению — дублировать и удалить (с подтверждением),
 * «+ Добавить модуль» в разделе, «+ Добавить раздел» внизу. Без разделов — модули одним списком.
 * Разделы и модули перетаскиваются за ручку (модуль — и в другой раздел).
 * Курс: «+ Добавить модуль» — меню видов (Модуль, Задание, Тестирование, Опрос) и «Из шаблонов» (окно bld-tpl: поиск и таблица);
 * у каждого модуля — иконка вида перед названием.
 * Один уровень (пульс-опрос): вместо модулей — список блоков (иконка, текст вопроса, номер); клик — выбрать блок, ручка — переставить.
 */
@Component({
  selector: '[bld-tree]',
  imports: [Icon, Float, BldTpl],
  template: `
    @let M = s.mat();
    @let _v = s.ver();
    <div class="c">
      <div class="ch bldth">
        <h3>Структура {{ s.conf().gen }}</h3>
        <span class="pntc">{{ M.one ? s.blockN() : s.mods().length }}</span>
      </div>
      <div class="cb pltoc bldtoc">
        @if (M.one) {
          <!-- один уровень: только блоки — список блоков, клик — к блоку -->
          <div class="sect flat">
            @for (b of s.mod()?.blocks ?? []; track b.id; let i = $index) {
              <div class="cblk plrow" [class.on]="s.isSel(b)" [class.drag]="drag() === b" (click)="pick(b)" (dragover)="overBlk($event, i)">
                <span class="cdrag" title="Перетащите блок" draggable="true" (dragstart)="start($event, b)" (dragend)="drag.set(null)" (click)="$event.stopPropagation()"><app-icon name="grip" /></span>
                <span class="cico"><app-icon [name]="icon(b)" /></span>
                <div><b [class.ph]="!label(b)">{{ label(b) || name(b) }}</b></div>
                <span class="bmeta">{{ s.qnum().get(b) || '' }}</span>
              </div>
            } @empty {
              <div class="blph">Блоков пока нет — добавьте первый в центре</div>
            }
          </div>
        }
        @for (S of M.one ? [] : M.secs; track S.id; let si = $index) {
          <div class="sect" [class.closed]="closed().has(S.id)" [class.flat]="M.flat" [class.drag]="isDrag(S)" (dragover)="overSec($event, S)" (drop)="drop($event)">
            @if (!M.flat) {
              <div class="secth">
                <span class="cdrag" title="Перетащите раздел" draggable="true" (dragstart)="start($event, { sec: S })" (dragend)="drag.set(null)"><app-icon name="grip" /></span>
                <span class="secn">{{ si + 1 }}</span>
                <textarea class="secin" rows="1" placeholder="Название раздела" [value]="S.t" (input)="S.t = $any($event.target).value; s.touch()"></textarea>
                @if (M.secs.length > 1) {
                  <button class="actb dg secdel" title="Удалить раздел" (click)="s.delSection(S)"><app-icon name="trashSm" /></button>
                }
                <button class="accar" [title]="closed().has(S.id) ? 'Развернуть' : 'Свернуть'" (click)="flip(S.id)"><app-icon name="chevSm" /></button>
              </div>
            }
            @for (m of S.mods; track m.id) {
              <div class="cblk plrow" [class.on]="m === s.mod()" [class.drag]="isDrag(m)" (click)="s.openMod(m)" (dragover)="overMod($event, S, m)">
                <span class="cdrag" title="Перетащите {{ s.conf().mod.toLowerCase() }}" draggable="true" (dragstart)="start($event, { mod: m })" (dragend)="drag.set(null)" (click)="$event.stopPropagation()"><app-icon name="grip" /></span>
                <div class="cbi">{{ s.modNum(m) }}</div>
                @if (s.kinded()) {
                  <span class="bldmk" [title]="kinds[m.mk ?? 'mod'].name"><app-icon [name]="kinds[m.mk ?? 'mod'].icon" /></span>
                }
                <div><b [class.ph]="!m.t">{{ m.t || 'Без названия' }}</b></div>
                <!-- по наведению: дублировать и удалить модуль -->
                <span class="bldra" (click)="$event.stopPropagation()">
                  <button class="actb" title="Дублировать" (click)="s.dupModule(m)"><app-icon name="copy" /></button>
                  @if (s.mods().length > 1) {
                    <button class="actb dg" title="Удалить" (click)="del(m)"><app-icon name="trashSm" /></button>
                  }
                </span>
              </div>
            }
            <button class="lnk lnkadd bldaddm" (click)="add($event, S)"><app-icon name="plus" />Добавить {{ s.conf().mod.toLowerCase() }}</button>
          </div>
        }
        @if (!M.flat) {
          <button class="btn raised radd bldadds" (click)="s.addSection()"><app-icon name="plus" />Добавить раздел</button>
        }
      </div>
    </div>
    @if (menu(); as mn) {
      <div class="fpop amenu bldaddmenu" [appFloat]="mn.a" (click)="$event.stopPropagation()">
        @for (k of kindList; track k) {
          <button class="ami" (click)="addKind(k)"><app-icon [name]="kinds[k].icon" /><span>{{ kinds[k].name }}<small>{{ kinds[k].hint }}</small></span></button>
        }
        <div class="amsep"></div>
        <button class="ami" (click)="openTpl()"><app-icon name="bookmark" /><span>Из шаблонов<small>Готовый модуль любого вида</small></span></button>
      </div>
    }
    @if (tplFor()) {
      <div bld-tpl (picked)="pickTpl($event)" (closed)="tplFor.set(null)"></div>
    }
  `,
  host: { class: 'plside bldtree', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldTree {
  protected readonly s = inject(BuilderState);
  protected readonly closed = signal(new Set<string>());
  private readonly confirm = inject(ConfirmService);
  protected async del(m: BldModule): Promise<void> {
    const u = this.s.unit(m).toLowerCase();
    if (await this.confirm.ask({ title: 'Удалить ' + u + '?', text: '**' + (m.t || this.s.unit(m)) + '** и все его блоки будут удалены.', ok: 'Удалить', danger: true })) this.s.delModule(m);
  }
  protected readonly kinds = BLD_MOD_KINDS;
  protected readonly kindList = BLD_MOD_KIND_LIST;
  /** меню «Добавить модуль» (курс): у какой кнопки и в какой раздел */
  protected readonly menu = signal<{ a: HTMLElement; S: BldSection } | null>(null);
  /** окно «Шаблоны модулей»: в какой раздел добавить */
  protected readonly tplFor = signal<BldSection | null>(null);
  protected add(e: Event, S: BldSection): void {
    if (!this.s.kinded()) return this.s.addModule(S);
    e.stopPropagation();
    const a = e.currentTarget as HTMLElement;
    this.menu.set(this.menu()?.a === a ? null : { a, S });
  }
  protected addKind(mk: BldModKind): void {
    this.s.addModule(this.menu()!.S, mk);
    this.menu.set(null);
  }
  protected openTpl(): void {
    this.tplFor.set(this.menu()!.S);
    this.menu.set(null);
  }
  protected pickTpl(t: BldModTemplate): void {
    this.s.addModule(this.tplFor()!, t.mk, t);
    this.tplFor.set(null);
  }
  protected readonly drag = signal<Drag | null>(null);

  protected flip(id: string): void {
    this.closed.update((c) => {
      const n = new Set(c);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  protected readonly icon = bldBlockIcon;
  protected readonly name = bldBlockName;
  protected readonly label = bldBlockLabel;
  protected isDrag(x: BldSection | BldModule): boolean {
    const d = this.drag();
    return !!d && ('sec' in d ? d.sec === x : 'mod' in d ? d.mod === x : false);
  }
  /** блок в списке: выбрать и прокрутить к нему */
  protected pick(b: BldBlock): void {
    this.s.selBlock(b);
    setTimeout(() => document.getElementById('bld-' + b.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
  }
  protected overBlk(e: DragEvent, i: number): void {
    const d = this.drag();
    if (!d || 'sec' in d || 'mod' in d) return;
    e.preventDefault();
    this.s.moveBlock(d, i);
  }
  protected start(e: DragEvent, d: Drag): void {
    e.stopPropagation();
    e.dataTransfer?.setData('text/plain', '');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    const row = (e.target as HTMLElement).closest('sec' in d ? '.sect' : '.plrow');
    if (row && e.dataTransfer) e.dataTransfer.setDragImage(row, 20, 16);
    this.drag.set(d);
  }
  /** при наведении — сразу переставляем: раздел к разделу, модуль в пустой раздел или в конец раздела */
  protected overSec(e: DragEvent, S: BldSection): void {
    const d = this.drag();
    if (!d || !('sec' in d || 'mod' in d)) return;
    e.preventDefault();
    const secs = this.s.mat().secs;
    if ('sec' in d) {
      if (d.sec !== S) this.s.moveSection(secs.indexOf(d.sec), secs.indexOf(S));
      return;
    }
    if (!S.mods.includes(d.mod) && !S.mods.length) this.s.moveModule(d.mod, S, 0);
  }
  protected overMod(e: DragEvent, S: BldSection, m: BldModule): void {
    const d = this.drag();
    if (!d || !('mod' in d)) return;
    e.preventDefault();
    e.stopPropagation();
    if (d.mod !== m) this.s.moveModule(d.mod, S, S.mods.indexOf(m));
  }
  protected drop(e: DragEvent): void {
    e.preventDefault();
    this.drag.set(null);
  }
}
