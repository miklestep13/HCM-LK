import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { KB_ARTICLES } from '../../../data/kb.data';
import { LEARN_COURSES } from '../../../data/learn.data';
import { AttachFile } from '../../../interface/attach';
import { BldBlock } from '../../../interface/builder';
import { Attach } from '../../../shared/ui/attach/attach';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { BldQset } from '../builder-qset/builder-qset';
import { BuilderState } from '../builder.state';

/**
 * Настройки блока — раскрываются прямо под выбранным блоком в центре (правой панели нет): у каждого типа свои
 * (видео — файл или ссылка, длительность определяется сама; документ, файлы, изображение, статья из базы знаний, задание, курс из каталога, вопрос — bld-qset). У текста настроек нет: «Врезка» — в панели редактора.
 */
@Component({
  selector: '[bld-bset]',
  imports: [Attach, Field, Select, BldQset],
  template: `
    @let b = blk();
    @let _v = s.ver();
    @switch (b.k) {
      @case ('video') {
        <div class="fld bldfull"><label class="flab">Источник</label>
          <div class="seg pnseg">
            <span [class.on]="b.src !== 'link'" (click)="b.src = 'file'; s.touch()">Файл</span>
            <span [class.on]="b.src === 'link'" (click)="b.src = 'link'; s.touch()">Ссылка</span>
          </div>
        </div>
        @if (b.src === 'link') {
          <app-field class="bldfull" label="Ссылка на видео" [filled]="!!b.url"><input class="fin" placeholder="https://" [value]="b.url" (input)="b.url = $any($event.target).value; s.touch()" /></app-field>
        } @else {
          <div class="fld bldfull"><label class="flab">Файл видео</label><app-attach edit single hint="MP4, MOV или WEBM — длительность определится автоматически" [files]="b.files || []" (filesChange)="setVideo(b, $event)" /></div>
        }
      }
      @case ('pdf') {
        <app-field class="bldfull" label="Название" [filled]="!!b.title"><input class="fin" placeholder="Например: Регламент" [value]="b.title" (input)="b.title = $any($event.target).value; s.touch()" /></app-field>
        <div class="fld bldfull"><label class="flab">Источник</label>
          <div class="seg pnseg">
            <span [class.on]="b.src !== 'link'" (click)="b.src = 'file'; s.touch()">Файл</span>
            <span [class.on]="b.src === 'link'" (click)="b.src = 'link'; s.touch()">Ссылка</span>
          </div>
        </div>
        @if (b.src === 'link') {
          <app-field class="bldfull" label="Ссылка на документ" [filled]="!!b.url"><input class="fin" placeholder="https://" [value]="b.url" (input)="b.url = $any($event.target).value; s.touch()" /></app-field>
        } @else {
          <div class="fld bldfull"><label class="flab">Документ PDF</label><app-attach edit single hint="PDF до 50 МБ" [files]="b.files || []" (filesChange)="setFiles(b, $event)" /></div>
        }
      }
      @case ('files') {
        <app-field label="Заголовок" [filled]="!!b.title"><input class="fin" [value]="b.title" (input)="b.title = $any($event.target).value; s.touch()" /></app-field>
        <div class="fld bldfull"><label class="flab">Файлы</label><app-attach edit [files]="b.files || []" (filesChange)="setFiles(b, $event)" /></div>
      }
      @case ('image') {
        <div class="fld bldfull"><label class="flab">Изображение</label><app-attach edit single hint="JPG, PNG или WEBP до 10 МБ" [files]="b.files || []" (filesChange)="setImage(b, $event)" /></div>
        <app-field class="bldfull" label="Подпись" [filled]="!!b.title"><input class="fin" placeholder="Необязательно" [value]="b.title" (input)="b.title = $any($event.target).value; s.touch()" /></app-field>
      }
      @case ('kb') {
        <app-field class="bldfull" label="Статья" required [filled]="!!b.art">
          <app-select [search]="true" [options]="articles" placeholder="Выберите статью" [value]="b.art ? artTitle(b.art) : ''" (valueChange)="b.art = artBy[$event]; s.touch()" />
        </app-field>
      }
      @case ('task') {
        <app-field label="Формулировка задания" required [filled]="!!b.html"><textarea class="fta" rows="5" placeholder="Что нужно сделать и по каким критериям проверят" [value]="b.html" (input)="b.html = $any($event.target).value; s.touch()"></textarea></app-field>
        <div class="fld"><label class="flab">Ответ</label>
          <div class="seg pnseg">
            <span [class.on]="b.ans === 'file'" (click)="b.ans = 'file'; s.touch()">Файл</span>
            <span [class.on]="b.ans === 'text'" (click)="b.ans = 'text'; s.touch()">Текст</span>
            <span [class.on]="b.ans === 'both'" (click)="b.ans = 'both'; s.touch()">Файл и текст</span>
          </div>
        </div>
      }
      @case ('course') {
        <app-field label="Курс" required [filled]="!!b.crs">
          <app-select [search]="true" [options]="courses" placeholder="Выберите курс" [value]="b.crs ? title(b.crs) : ''" (valueChange)="b.crs = idBy[$event]; s.touch()" />
        </app-field>
        <label class="ckb anon"><input type="checkbox" [checked]="b.req" (change)="b.req = $any($event.target).checked; s.touch()" /><i></i><span>Обязательный для завершения программы</span></label>
      }
      @case ('q') {
        <div bld-qset [q]="b.q!"></div>
      }
    }
  `,
  host: { class: 'bldbs pnf' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldBset {
  readonly blk = input.required<BldBlock>();
  protected readonly s = inject(BuilderState);
  protected readonly courses = Object.values(LEARN_COURSES).map((c) => c.t);
  protected readonly idBy = Object.fromEntries(Object.entries(LEARN_COURSES).map(([id, c]) => [c.t, id]));
  protected readonly articles = KB_ARTICLES.map((a) => a.title);
  protected readonly artBy = Object.fromEntries(KB_ARTICLES.map((a) => [a.title, a.id]));
  protected artTitle(id: string): string {
    return KB_ARTICLES.find((a) => a.id === id)?.title ?? '';
  }
  protected title(id: string): string {
    return LEARN_COURSES[id]?.t ?? '';
  }
  /** изображение: загруженный файл — сразу в блоке; удалили — блок пустой */
  protected setImage(b: BldBlock, f: AttachFile[]): void {
    b.img = f[0]?.url || '';
    this.setFiles(b, f);
  }
  /** видео: длительность — автоматически по файлу (в прототипе — оценка по размеру), название — имя файла */
  protected setVideo(b: BldBlock, f: AttachFile[]): void {
    const x = f[0];
    b.dur = x && x.st === 'ok' ? Math.max(1, Math.round(x.size / 8_000_000)) + ' мин' : '';
    b.title = x ? x.name.replace(/\.[^.]+$/, '') : '';
    this.setFiles(b, f);
  }
  protected setFiles(b: BldBlock, f: AttachFile[]): void {
    b.files = f;
    this.s.touch();
  }
}
