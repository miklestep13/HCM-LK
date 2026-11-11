import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { AttachFile } from '../../../interface/attach';
import { Attach } from '../../../shared/ui/attach/attach';

/** Документы итогов — подраздел в конце блока «Итог»: карточки файлов как в виджете загрузки (app-attach); HR загружает, остальные смотрят */
@Component({
  selector: '[attncard-docs]',
  imports: [Attach],
  template: `
    <h4 class="afdh">Документы<span class="pntc">{{ docs().length }}</span></h4>
    @if (up()) {
      <app-attach edit [files]="docs()" (filesChange)="set($event)" />
    } @else {
      <app-attach class="attv" [files]="docs()" />
    }
  `,
  host: { class: 'afdocs' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardDocs {
  protected readonly s = inject(AttestStore);
  protected readonly up = computed(() => ['hr', 'var'].includes(this.s.role()));
  protected readonly docs = computed(() => this.s.res().docs);
  protected set(docs: AttachFile[]): void {
    this.s.result.update((r) => ({ ...r, docs }));
  }
}
