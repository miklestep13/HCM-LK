import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, output, untracked } from '@angular/core';
import { BldMaterial } from '../../interface/builder';
import { Seg } from '../../shared/ui/seg/seg';
import { BldCanvas } from './builder-canvas/builder-canvas';
import { BldPreview } from './builder-preview/builder-preview';
import { BldTree } from './builder-tree/builder-tree';
import { BuilderState } from './builder.state';

/**
 * Конструктор учебных материалов — один виджет для курса, теста, опроса, задания и программы.
 * Уровни: раздел → модуль → блоки (курс), модуль → блоки (опрос, тест, задание, программа), только блоки (пульс-опрос: material.one).
 * Редактор — две колонки: структура слева (название раздела правится в строке),
 * открытый модуль справа: название и описание, блоки как увидит сотрудник, «+» между блоками; настройки блока — под выбранным блоком. «Предпросмотр» — то же в раскладке страницы прохождения, с ответами и переходами.
 *   <div app-builder [material]="m" (changed)="save($event)"></div>
 * Материал — изменяемый объект: виджет правит его на месте и сообщает (changed) после каждой правки.
 * Настройки прохождения (order, paging, pass) задает страница-форма в «Общей информации» — виджет их только показывает в предпросмотре.
 */
@Component({
  selector: '[app-builder]',
  imports: [Seg, BldTree, BldCanvas, BldPreview],
  providers: [BuilderState],
  template: `
    @let M = s.mat();
    @let _v = s.ver();
    <div class="c bldbar">
      <div class="bldbi">
        <span class="bdg info">{{ s.conf().name }}</span>
        <span class="bldsm">{{ summary() }}</span>
      </div>
      <app-seg [options]="modes" [value]="s.mode()" (valueChange)="s.mode.set($event)" />
    </div>
    @if (s.mode() === 'edit') {
      <div class="bldgrid">
        <div bld-tree></div>
        <div bld-canvas></div>
      </div>
    } @else {
      <div bld-preview></div>
    }
  `,
  styleUrl: './builder.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'bld pg-pass' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Builder {
  readonly material = input.required<BldMaterial>();
  readonly changed = output<BldMaterial>();
  protected readonly s = inject(BuilderState);
  protected readonly modes: { value: 'edit' | 'view'; label: string }[] = [
    { value: 'edit', label: 'Редактор' },
    { value: 'view', label: 'Предпросмотр' },
  ];
  protected readonly summary = computed(() => {
    const M = this.s.mat(), n = this.s.mods().length, b = this.s.blockN();
    const pl = (x: number, f: string[]) => x + ' ' + (x % 10 === 1 && x % 100 !== 11 ? f[0] : [2, 3, 4].includes(x % 10) && ![12, 13, 14].includes(x % 100) ? f[1] : f[2]);
    const parts = [];
    if (!M.flat) parts.push(pl(M.secs.length, ['раздел', 'раздела', 'разделов']));
    if (!M.one) parts.push(pl(n, ({ Модуль: ['модуль', 'модуля', 'модулей'], Этап: ['этап', 'этапа', 'этапов'], Шаг: ['шаг', 'шага', 'шагов'] } as Record<string, string[]>)[this.s.conf().mod]));
    parts.push(pl(b, ['блок', 'блока', 'блоков']));
    if (this.s.qnum().size) parts.push(pl(this.s.qnum().size, ['вопрос', 'вопроса', 'вопросов']));
    return parts.join(' · ');
  });

  constructor() {
    this.s.onChange = (m) => this.changed.emit(m);
    effect(() => {
      const m = this.material();
      untracked(() => this.s.load(m));
    });
  }
}
