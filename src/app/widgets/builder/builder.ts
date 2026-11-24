import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, effect, inject, input, output, untracked } from '@angular/core';
import { BldMaterial, BldSurveyInfo } from '../../interface/builder';
import { Seg } from '../../shared/ui/seg/seg';
import { BldCanvas } from './builder-canvas/builder-canvas';
import { BldPreview } from './builder-preview/builder-preview';
import { BldSurvey } from './builder-survey/builder-survey';
import { BldTree } from './builder-tree/builder-tree';
import { BuilderState } from './builder.state';

/**
 * Конструктор учебных материалов — один виджет для курса, теста, опроса, задания и программы.
 * Уровни: раздел → модуль → блоки (курс), модуль → блоки (опрос, тест, задание, программа), только блоки (пульс-опрос: material.one).
 * Редактор — две колонки: структура слева (название раздела правится в строке),
 * открытый модуль справа: название и описание, блоки как увидит сотрудник, «+» между блоками; настройки блока — под выбранным блоком. «Предпросмотр» — то же в раскладке страницы прохождения, с ответами и переходами.
 *   <div app-builder [material]="m" (changed)="save($event)"></div>
 * Входы: [addMods]="false" — без добавления и дублирования модулей; [stats]="false" — без строки статистики; [tree]="false" — без структуры слева;
 * [survey]="{ t, d, end, dur, anon }" — «Предпросмотр» как страница прохождения опроса.
 * Материал — изменяемый объект: виджет правит его на месте и сообщает (changed) после каждой правки.
 * Настройки прохождения (order, paging, pass) задает страница-форма в «Общей информации» — виджет их только показывает в предпросмотре.
 */
@Component({
  selector: '[app-builder]',
  imports: [Seg, BldTree, BldCanvas, BldPreview, BldSurvey],
  providers: [BuilderState],
  template: `
    @let M = s.mat();
    @let _v = s.ver();
    <div class="c bldbar">
      <div class="bldbi">
        <span class="bdg info">{{ s.conf().name }}</span>
        @if (stats()) {
          <span class="bldsm">{{ summary() }}</span>
        }
      </div>
      <app-seg [options]="modes" [value]="s.mode()" (valueChange)="s.mode.set($event)" />
    </div>
    @if (s.mode() === 'edit') {
      <!-- опрос без структуры: колонка 760 px по центру — как #/survey?sv=s3 (svnarrow) и предпросмотр -->
      <div class="bldgrid" [class.notree]="!tree()" [class.narrow]="!tree() && !!survey()">
        @if (tree()) {
          <div bld-tree></div>
        }
        <div bld-canvas></div>
      </div>
    } @else if (survey()) {
      <div bld-survey></div>
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
  /** «+ Добавить модуль» и «Дублировать» в структуре; false — набор модулей задан (опрос) */
  readonly addMods = input(true, { transform: booleanAttribute });
  /** структура слева; false — только открытый модуль на всю ширину (опрос из одного модуля) */
  readonly tree = input(true, { transform: booleanAttribute });
  /** предпросмотр как страница прохождения опроса (pages/survey): шапка объекта и вопросы одной карточкой */
  readonly survey = input<BldSurveyInfo | null>(null);
  /** строка статистики «1 модуль · 3 блока · 3 вопроса» в верхней панели */
  readonly stats = input(true, { transform: booleanAttribute });
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
    effect(() => this.s.addMods.set(this.addMods()));
    effect(() => this.s.survey.set(this.survey()));
    effect(() => {
      const m = this.material();
      untracked(() => this.s.load(m));
    });
  }
}
