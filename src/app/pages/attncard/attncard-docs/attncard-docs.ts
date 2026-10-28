import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { AttachFile } from '../../../interface/attach';
import { Attach } from '../../../shared/ui/attach/attach';
import { AttncardCol } from '../attncard-col/attncard-col';

/** Документы итогов (под участниками): HR загружает, остальные смотрят */
@Component({
  selector: '[attncard-docs]',
  imports: [Attach, AttncardCol],
  template: `
    <div class="ch">
      <button attncard-col="Документы"></button>
      <h3>Документы</h3>
      @if (!up()) {
        <span class="chip">{{ docs().length }}</span>
      }
    </div>
    @if (up()) {
      <div class="cb"><app-attach edit [files]="docs()" (filesChange)="set($event)" /></div>
    } @else {
      <div class="cb attv"><app-attach [files]="docs()" /></div>
    }
  `,
  host: { class: 'afsect', '[class.afcold]': 's.isCold("Документы")' },
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
