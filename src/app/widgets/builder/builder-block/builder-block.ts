import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { BLD_CHECKABLE, BLD_IMAGES } from '../../../data/builder.data';
import { KB_ARTICLES, KB_TYPES } from '../../../data/kb.data';
import { LEARN_COURSES } from '../../../data/learn.data';
import { BldBlock } from '../../../interface/builder';
import { Attach } from '../../../shared/ui/attach/attach';
import { Icon } from '../../../shared/ui/icon/icon';
import { RichText } from '../../../shared/ui/rich-text/rich-text';
import { BldQview } from '../builder-qview/builder-qview';
import { BuilderState } from '../builder.state';

/**
 * Блок «как увидит сотрудник» — одинаково в редакторе и в предпросмотре: текст (обычный или врезка), видео, документ, файлы,
 * изображение, статья из базы знаний, задание (ответ файлом и/или текстом), курс из каталога, вопрос (bld-qview).
 * edit — блок в редакторе: текст вопроса и описание правятся на месте, выбранный текстовый блок — с панелью форматирования
 * (жирный, курсив, списки и «Врезка»);
 * поля ответа — без ввода (ответы — в предпросмотре).
 */
@Component({
  selector: '[bld-block]',
  imports: [Attach, Icon, RichText, BldQview],
  template: `
    @let B = b();
    @let _v = s.ver();
    @switch (B.k) {
      @case ('text') {
        @if (edit() && s.isSel(B)) {
          <app-rich-text class="bltxed" [class.note]="B.view === 'note'" [value]="B.html || ''" (valueChange)="B.html = $event; s.touch()">
            <span rtbExtra class="rtbsep"></span>
            <button rtbExtra class="rtbb" [class.on]="B.view === 'note'" [title]="B.view === 'note' ? 'Убрать врезку' : 'Врезка — выделить текст'" (mousedown)="$event.preventDefault(); B.view = B.view === 'note' ? 'plain' : 'note'; s.touch()"><app-icon name="callout" /></button>
          </app-rich-text>
        } @else if (B.html) {
          <div class="bltext" [class.note]="B.view === 'note'" [innerHTML]="B.html"></div>
        } @else {
          <div class="blph"><app-icon name="mText" />Пустой текстовый блок — нажмите, чтобы написать текст</div>
        }
      }
      @case ('video') {
        <div class="plvid" [style.background-image]="'url(' + cover() + ')'">
          <span class="plvp"><app-icon name="playFill" /></span><span class="plvm">{{ B.title || (B.src === 'link' ? B.url : '') || 'Видео не добавлено' }}{{ B.dur && B.src !== 'link' ? ' · ' + B.dur : '' }}</span>
        </div>
      }
      @case ('pdf') {
        @let f = B.src === 'link' ? (B.url ? { name: B.url } : null) : B.files?.[0];
        @if (f) {
          <div class="plpdf">
            <div class="pltb top">
              <span><app-icon name="tkFile" />{{ f.name }}</span><span class="plpg">страница 1 из 8</span>
            </div>
            <div class="plpage"><b>{{ B.title || f.name }}</b><i></i><i></i><i class="s"></i><i></i><i></i><i></i><i class="s"></i><i></i></div>
          </div>
        } @else {
          <div class="blph"><app-icon name="mDoc" />Документ не добавлен — загрузите PDF или вставьте ссылку в настройках блока</div>
        }
      }
      @case ('files') {
        @if (B.title) {
          <div class="blttl">{{ B.title }}</div>
        }
        @if (B.files?.length) {
          <app-attach [files]="B.files!" />
        } @else {
          <div class="blph"><app-icon name="clip" />Файлов нет — загрузите их в настройках блока</div>
        }
      }
      @case ('image') {
        @if (B.img) {
          <figure class="blimg">
            <img [src]="B.img" alt="" />
            @if (B.title) {
              <figcaption>{{ B.title }}</figcaption>
            }
          </figure>
        } @else {
          <div class="blph"><app-icon name="fileImg" />Изображение не загружено — загрузите файл в настройках блока</div>
        }
      }
      @case ('kb') {
        @let a = article();
        @if (a) {
          <div class="blkb">
            @if (a.cover) {
              <span class="blkbi" [style.background-image]="'url(' + a.cover + ')'"></span>
            }
            <div>
              <small><app-icon name="mKb" />База знаний · {{ kbType[a.type] }}</small>
              <b>{{ a.title }}</b>
              <p>{{ a.excerpt }}</p>
              <span class="lnk">Читать статью</span>
            </div>
          </div>
        } @else {
          <div class="blph"><app-icon name="mKb" />Статья не выбрана — выберите ее в настройках блока</div>
        }
      }
      @case ('task') {
        <div class="bltask">
          <div class="bltaskh"><span class="cico"><app-icon name="mTask" /></span><b>Задание</b></div>
          @if (B.html) {
            <p>{{ B.html }}</p>
          } @else {
            <p class="gr">Формулировка задания появится здесь</p>
          }
          @if (B.ans !== 'file') {
            <textarea class="fta" rows="3" placeholder="Ваш ответ" [readOnly]="!live()"></textarea>
          }
          @if (B.ans !== 'text') {
            <div class="pldrop"><app-icon name="uploadBig" /><b>Перетащите файл или <u>выберите</u></b><small>PDF, DOCX, XLSX до 20 МБ</small></div>
          }
        </div>
      }
      @case ('course') {
        @let c = course();
        @if (c) {
          <div class="blcrs">
            <span class="blcrsi" [style.background-image]="'url(' + cover() + ')'"></span>
            <div>
              <small>Курс · {{ c.dur }}</small>
              <b>{{ c.t }}</b>
              <span class="bdg" [class.info]="B.req">{{ B.req ? 'Обязательный' : 'По желанию' }}</span>
            </div>
          </div>
        } @else {
          <div class="blph"><app-icon name="course" />Курс не выбран — выберите его в настройках блока</div>
        }
      }
      @case ('q') {
        <div bld-qview [edit]="edit()" [correct]="correct()" [graded]="!!s.conf().correct" [q]="B.q!" [num]="s.qnum().get(B) || ''" [ver]="_v" (edited)="s.touch()"></div>
      }
    }
  `,
  host: { class: 'blk', '[class.ro]': '!live() && !(edit() && s.isSel(b()) && b().k === "text")' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldBlockView {
  readonly b = input.required<BldBlock>();
  /** редактор: выбранный текст — с панелью форматирования */
  readonly edit = input(false, { transform: booleanAttribute });
  /** предпросмотр: можно отвечать */
  readonly live = input(false, { transform: booleanAttribute });
  protected readonly s = inject(BuilderState);
  /** тест и курс: верный ответ у вопросов с вариантами */
  protected readonly correct = computed(() => !!this.s.conf().correct && this.b().k === 'q' && BLD_CHECKABLE.includes(this.b().q!.t));
  protected readonly article = computed(() => (this.b().art ? KB_ARTICLES.find((x) => x.id === this.b().art) ?? null : null));
  protected readonly kbType = KB_TYPES;
  protected readonly course = computed(() => (this.b().crs ? LEARN_COURSES[this.b().crs!] : null));
  /** обложка видео и курса — одна из картинок библиотеки, по блоку */
  protected readonly cover = computed(() => {
    const id = this.b().crs || this.b().id;
    let h = 0;
    for (const ch of id) h = (h + ch.charCodeAt(0)) % BLD_IMAGES.length;
    return BLD_IMAGES[h];
  });
}
