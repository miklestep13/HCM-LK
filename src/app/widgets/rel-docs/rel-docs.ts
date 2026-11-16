import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from '@angular/core';
import { AttachFile } from '../../interface/attach';
import { Attach } from '../../shared/ui/attach/attach';

/**
 * «Связанные документы» — карточка с файлами (shared/ui/attach):
 *   <div class="c" app-rel-docs edit [(files)]="docs"></div>  — загрузка: зона «Перетащите файлы сюда», переименовать, удалить
 *   <div class="c" app-rel-docs [files]="docs"></div>          — просмотр: скопировать ссылку, скачать
 * Используется: форма заявки (новая заявка), каталог «Виджеты».
 */
@Component({
  selector: '[app-rel-docs]',
  imports: [Attach],
  template: `
    <div class="ch"><h3>{{ title() }}</h3></div>
    <div class="cb">
      @if (edit()) {
        <app-attach edit [hint]="hint()" [files]="files()" (filesChange)="files.set($event)" />
      } @else if (files().length) {
        <app-attach [files]="files()" />
      } @else {
        <div class="rdempty">Документов нет</div>
      }
    </div>
  `,
  styleUrl: './rel-docs.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-reldocs' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelDocs {
  readonly title = input('Связанные документы');
  /** подпись под зоной загрузки (по умолчанию — форматы и размер из app-attach) */
  readonly hint = input('');
  readonly edit = input(false, { transform: booleanAttribute });
  readonly files = model<AttachFile[]>([]);
}
