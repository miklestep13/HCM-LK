import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, linkedSignal, model } from '@angular/core';
import { AttachFile } from '../../interface/attach';
import { Attach } from '../../shared/ui/attach/attach';
import { Icon } from '../../shared/ui/icon/icon';

/**
 * «Связанные документы» — карточка с файлами (shared/ui/attach):
 *   <div class="c" app-rel-docs edit [(files)]="docs"></div>  — один список: загрузка / просмотр
 *   <div class="c" app-rel-docs [incoming] [outgoing]></div>   — секции «Входящие» / «Исходящие»
 *   <div class="c" app-rel-docs [incoming] [(outgoing)] editOut></div> — исходящие с загрузкой (ответственный)
 *   fold / collapsed — шеврон слева от заголовка и счетчик файлов (как «Цели»)
 */
@Component({
  selector: '[app-rel-docs]',
  imports: [Attach, Icon],
  template: `
    @let inn = incoming() ?? [];
    @let out = outgoing() ?? [];
    <div class="ch" [title]="fold() ? (cold() ? 'Развернуть' : 'Свернуть') : null" (click)="onHead()">
      @if (fold()) {
        <span class="actb cfar"><app-icon name="chevSm" /></span>
      }
      <h3>{{ title() }}</h3>
      @if (fold()) {
        <span class="chip">{{ count() }}</span>
      }
    </div>
    @if (!cold()) {
      <div class="cb">
        @if (grouped()) {
          @if (showIn()) {
            <div class="rdsec">
              <h4>Входящие@if (inn.length) {<span class="pntc">{{ inn.length }}</span>}</h4>
              @if (inn.length) {
                <app-attach [files]="inn" />
              } @else {
                <div class="rdempty">Входящих документов нет</div>
              }
            </div>
          }
          @if (showOut()) {
            <div class="rdsec" [class.rdsec2]="showIn()">
              <h4>Исходящие@if (out.length) {<span class="pntc">{{ out.length }}</span>}</h4>
              @if (editOut()) {
                <app-attach edit [hint]="hint()" [files]="out" (filesChange)="onOut($event)" />
              } @else if (out.length) {
                <app-attach [files]="out" />
              } @else {
                <div class="rdempty">Исходящих документов нет</div>
              }
            </div>
          }
          @if (!showIn() && !showOut()) {
            <div class="rdempty">Документов нет</div>
          }
        } @else if (edit()) {
          <app-attach edit [hint]="hint()" [files]="files()" (filesChange)="files.set($event)" />
        } @else if (files().length) {
          <app-attach [files]="files()" />
        } @else {
          <div class="rdempty">Документов нет</div>
        }
      </div>
    }
  `,
  styleUrl: './rel-docs.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-reldocs', '[class.cfold]': 'fold()', '[class.cold]': 'cold()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelDocs {
  readonly title = input('Связанные документы');
  /** подпись под зоной загрузки (по умолчанию — форматы и размер из app-attach) */
  readonly hint = input('');
  readonly edit = input(false, { transform: booleanAttribute });
  readonly files = model<AttachFile[]>([]);
  /**
   * Секции: входящие (от сотрудника) и исходящие (по результату).
   * Если передан хотя бы один список — режим групп; пустую секцию скрываем, кроме editOut.
   */
  readonly incoming = input<AttachFile[] | undefined>(undefined);
  readonly outgoing = model<AttachFile[] | undefined>(undefined);
  /** загрузка в секции «Исходящие» (ответственный при обработке) */
  readonly editOut = input(false, { transform: booleanAttribute });
  /** в просмотре показывать пустые секции (по умолчанию — нет) */
  readonly showEmpty = input(false, { transform: booleanAttribute });
  /** сворачиваемый блок: шеврон слева от заголовка */
  readonly fold = input(false, { transform: booleanAttribute });
  /** свернут по умолчанию (только при fold) */
  readonly collapsed = input(false, { transform: booleanAttribute });

  protected readonly cold = linkedSignal(() => this.fold() && this.collapsed());
  protected readonly grouped = computed(() => this.incoming() !== undefined || this.outgoing() !== undefined || this.editOut());
  protected readonly showIn = computed(() => {
    const list = this.incoming();
    if (list === undefined) return false;
    return this.showEmpty() || list.length > 0;
  });
  protected readonly showOut = computed(() => {
    if (this.editOut()) return true;
    const list = this.outgoing();
    if (list === undefined) return false;
    return this.showEmpty() || list.length > 0;
  });
  /** число файлов в шапке (входящие + исходящие или один список) */
  protected readonly count = computed(() => {
    if (this.grouped()) return (this.incoming()?.length ?? 0) + (this.outgoing()?.length ?? 0);
    return this.files().length;
  });

  protected onHead(): void {
    if (!this.fold()) return;
    this.cold.update((v) => !v);
  }
  protected onOut(files: AttachFile[]): void {
    this.outgoing.set(files);
  }
}
