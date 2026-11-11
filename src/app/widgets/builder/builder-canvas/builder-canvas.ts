import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { bldBlockIcon, bldBlockName } from '../../../data/builder.data';
import { BldBlock, BldPaletteItem } from '../../../interface/builder';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { BldBlockView } from '../builder-block/builder-block';
import { BldBset } from '../builder-bset/builder-bset';
import { BldMset } from '../builder-mset/builder-mset';
import { BuilderState } from '../builder.state';

/**
 * Открытый модуль (в центре): «Раздел · Модуль 1.2», название и описание модуля (правятся прямо здесь; у материала из одних блоков их нет),
 * блоки друг под другом в том виде, как их увидит сотрудник. Наведение — рамка и панель блока (тип, вверх / вниз, дублировать, удалить),
 * клик — выбрать блок, ручка — перетащить. Текст, описание и варианты ответа правятся прямо в блоке; вид блока (и тип вопроса) — список в панели блока;
 * дополнительные настройки — в выбранном блоке под ответами (⚙ в панели блока скрывает и показывает их).
 * Справа от «Модуль 1.2» — сохранить в шаблоны (курс), дублировать и удалить модуль. У курса вместо «Модуль» — вид модуля («Тестирование 1.2»),
 * палитра блоков — по виду модуля, у «Тестирования» и «Задания» под описанием — их настройки (bld-mset, скрываемый блок). Между блоками — «+» (вставить блок в это место),
 * внизу — «Добавить блок»; в пустом модуле палитра открыта плитками.
 * Без модулей (material.one: опрос «Вопрос за вопросом», пульс-опрос) один блок = одна страница прохождения: каждый блок в своей рамке
 * с подписью «Страница 2 из 5», между страницами — отступ, кнопки — «Вставить страницу» и «Добавить страницу».
 */
@Component({
  selector: '[bld-canvas]',
  imports: [Float, Icon, BldBlockView, BldBset, BldMset],
  template: `
    @let m = s.mod();
    @let _v = s.ver();
    @if (m) {
      @let sec = s.secOf(m);
      @if (!s.mat().one) {
        <div class="bldcrumb">
          @if (!s.mat().flat && sec) {
            <span>{{ sec.t || 'Раздел' }}</span><span class="sep">·</span>
          }
          <span>{{ s.unit(m) }} {{ s.modNum(m) }}</span>
          <span class="bldma">
            @if (s.kinded()) {
              <button class="actb" title="Сохранить в шаблоны" (click)="s.saveTemplate(m)"><app-icon name="bookmark" /></button>
            }
            <button class="actb" title="Дублировать {{ s.conf().mod.toLowerCase() }}" (click)="s.dupModule(m)"><app-icon name="copy" /></button>
            @if (s.mods().length > 1) {
              <button class="actb dg" title="Удалить {{ s.conf().mod.toLowerCase() }}" (click)="s.delModule(m)"><app-icon name="trashSm" /></button>
            }
          </span>
        </div>
        <textarea class="bldmt" rows="1" placeholder="Название {{ s.conf().mod.toLowerCase() }}а" [value]="m.t" (input)="m.t = val($event); s.touch()" (focus)="s.sel.set({ lv: 'mod' })"></textarea>
        <textarea class="bldmd" rows="1" placeholder="Описание — о чем {{ s.conf().mod.toLowerCase() }} и что нужно сделать (необязательно)" [value]="m.d" (input)="m.d = val($event); s.touch()" (focus)="s.sel.set({ lv: 'mod' })"></textarea>
        @if (m.test || m.task) {
          <div bld-mset [m]="m"></div>
        }
      }
      <div class="bldblocks" [class.bldpages]="s.mat().one">
        @for (b of m.blocks; track b.id; let i = $index) {
          <div class="bldgap"><button class="bldgapb" [title]="s.mat().one ? 'Вставить страницу' : 'Вставить блок'" (click)="openPal($event, i)"><app-icon name="plus" /></button></div>
          <div class="bldb" [id]="'bld-' + b.id" [class.on]="s.isSel(b)" [class.drag]="drag() === b" (click)="s.selBlock(b)" (dragover)="over($event, b)" (drop)="drop($event)">
            <div class="bldbt" (click)="$event.stopPropagation()">
              <span class="cdrag" title="Перетащите блок" draggable="true" (dragstart)="start($event, b)" (dragend)="drag.set(null)"><app-icon name="grip" /></span>
              <!-- вид блока меняется здесь: палитра материала (контент, задание, типы вопросов) -->
              <button class="bldbn tg" title="Сменить вид блока" [class.on]="types()?.b === b" (click)="openTypes($event, b)"><app-icon [name]="icon(b)" />{{ name(b) }}<app-icon class="bldbnc" name="chevDown" /></button>
              @if (b.k !== 'text') {
                <button class="actb" title="Настройки блока" [class.on]="s.isSel(b) && !hide()" (click)="gear(b)"><app-icon name="settings" /></button>
              }
              <button class="actb" title="Выше" [disabled]="!i" (click)="s.moveBlock(b, i - 1)"><app-icon name="stepUp" /></button>
              <button class="actb" title="Ниже" [disabled]="i === m.blocks.length - 1" (click)="s.moveBlock(b, i + 1)"><app-icon name="stepDown" /></button>
              <button class="actb" title="Дублировать" (click)="s.dupBlock(b)"><app-icon name="copy" /></button>
              <button class="actb dg" title="Удалить" (click)="s.delBlock(b)"><app-icon name="trashSm" /></button>
            </div>
            @if (s.mat().one) {
              <div class="bldpgn">Страница {{ i + 1 }} из {{ m.blocks.length }}</div>
            }
            <div bld-block edit [b]="b"></div>
            @if (s.isSel(b) && !hide() && b.k !== 'text') {
              <!-- настройки блока — в нем же, под ответами (⚙ в панели блока — скрыть / показать) -->
              <div bld-bset [blk]="b" (click)="$event.stopPropagation()"></div>
            }
          </div>
        } @empty {
          <div class="bldempty">
            <b>{{ s.mat().one ? s.conf().name + ' пока пустой' : s.kinded() ? 'Блоков пока нет' : s.conf().mod + ' пока пустой' }}</b>
            <small>Выберите первый блок — дальше их можно добавлять между существующими кнопкой «+»</small>
            @for (g of s.groups(); track g.t) {
              <div class="bldtg">{{ g.t }}</div>
              <div class="bldtiles">
                @for (it of g.items; track it.name) {
                  <button class="bldtile" (click)="add(it, 0)"><span class="cico"><app-icon [name]="it.icon" /></span><b>{{ it.name }}</b></button>
                }
              </div>
            }
          </div>
        }
      </div>
      @if (m.blocks.length) {
        <button class="btn raised radd bldaddb" (click)="openPal($event, m.blocks.length)"><app-icon name="plus" />{{ s.mat().one ? 'Добавить страницу' : 'Добавить блок' }}</button>
      }
    } @else {
      <div class="bldempty"><b>{{ s.conf().mod }} не выбран</b><small>Добавьте {{ s.conf().mod.toLowerCase() }} в структуре слева</small></div>
    }
    @if (types(); as t) {
      <div class="fpop amenu bldtypes" [appFloat]="t.a" (click)="$event.stopPropagation()">
        @for (g of s.groups(); track g.t) {
          <div class="bldpg">{{ g.t }}</div>
          @for (it of g.items; track it.name) {
            <button class="ami" [class.on]="isKind(t.b, it)" (click)="setType(t.b, it)"><app-icon [name]="it.icon" />{{ it.name }}</button>
          }
        }
      </div>
    }
    @if (pal(); as p) {
      <div class="fpop bldpal" [appFloat]="p.a" (click)="$event.stopPropagation()">
        @for (g of s.groups(); track g.t) {
          <div class="bldpg">{{ g.t }}</div>
          @for (it of g.items; track it.name) {
            <button class="ami" (click)="add(it, p.at)"><app-icon [name]="it.icon" /><span>{{ it.name }}@if (it.hint) {<small>{{ it.hint }}</small>}</span></button>
          }
        }
      </div>
    }
  `,
  host: { class: 'c full plmain bldcv', '(document:click)': 'pal.set(null); types.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldCanvas {
  protected readonly s = inject(BuilderState);
  protected readonly pal = signal<{ a: HTMLElement; at: number } | null>(null);
  protected readonly drag = signal<BldBlock | null>(null);
  /** настройки выбранного блока скрыты (⚙ в панели блока) */
  protected readonly hide = signal(false);
  protected gear(b: BldBlock): void {
    if (!this.s.isSel(b)) {
      this.s.selBlock(b);
      this.hide.set(false);
    } else this.hide.update((h) => !h);
  }
  /** список «Сменить вид блока» */
  protected readonly types = signal<{ a: HTMLElement; b: BldBlock } | null>(null);
  protected isKind(b: BldBlock, it: BldPaletteItem): boolean {
    return b.k === it.k && (b.k !== 'q' || b.q!.t === it.qt);
  }
  protected openTypes(e: Event, b: BldBlock): void {
    e.stopPropagation();
    this.s.selBlock(b);
    const a = e.currentTarget as HTMLElement;
    this.types.set(this.types()?.a === a ? null : { a, b });
  }
  protected setType(b: BldBlock, it: BldPaletteItem): void {
    this.types.set(null);
    if (!this.isKind(b, it)) this.s.setKind(b, it.k, it.qt);
  }
  protected readonly name = bldBlockName;
  protected readonly icon = bldBlockIcon;
  protected val(e: Event): string {
    return (e.target as HTMLTextAreaElement).value;
  }
  protected openPal(e: Event, at: number): void {
    e.stopPropagation();
    const a = e.currentTarget as HTMLElement;
    this.pal.set(this.pal()?.a === a ? null : { a, at });
  }
  protected add(it: BldPaletteItem, at: number): void {
    this.pal.set(null);
    this.s.addBlock(it.k, it.qt, at);
  }
  protected start(e: DragEvent, b: BldBlock): void {
    e.dataTransfer?.setData('text/plain', '');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    const row = (e.target as HTMLElement).closest('.bldb');
    if (row && e.dataTransfer) e.dataTransfer.setDragImage(row, 24, 20);
    this.drag.set(b);
  }
  protected over(e: DragEvent, b: BldBlock): void {
    const d = this.drag();
    if (!d) return;
    e.preventDefault();
    if (d !== b) this.s.moveBlock(d, this.s.mod()!.blocks.indexOf(b));
  }
  protected drop(e: DragEvent): void {
    e.preventDefault();
    this.drag.set(null);
  }
}
