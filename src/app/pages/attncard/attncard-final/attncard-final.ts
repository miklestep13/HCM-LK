import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_DECISIONS } from '../../../data/attest.data';
import { AttachFile } from '../../../interface/attach';
import { Attach } from '../../../shared/ui/attach/attach';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';

/**
 * Итог на заседании комиссии (роль «Комиссия»): решение, «Кандидат на повышение» (только при «Превосходит ожидания»),
 * комментарий и документы. «Завершить аттестацию» — внизу страницы.
 */
@Component({
  selector: '[attncard-final]',
  imports: [Field, Select, Attach],
  template: `
    <div class="ch"><h3>Итог</h3></div>
    <div class="cb">
      <div class="frm" style="grid-template-columns: 1fr">
        <app-field label="Решение по аттестации" required [filled]="!!f().dec" [error]="s.formErr().has('dec')">
          <app-select [options]="decisions" [value]="f().dec" (valueChange)="setDec($event)" placeholder="Выберите решение" />
        </app-field>
        @if (f().dec === 'Превосходит ожидания') {
          <label class="swt afck"
            ><input type="checkbox" [checked]="f().cand" (change)="patch({ cand: $any($event.target).checked })" /><i></i><span>Кандидат на повышение</span></label
          >
        }
        <app-field label="Комментарий" required [filled]="!!f().cm" [error]="s.formErr().has('cm')">
          <textarea class="fta" rows="3" placeholder="На чем основано решение комиссии" [value]="f().cm" (input)="patch({ cm: $any($event.target).value }); s.clearFormErr('cm')"></textarea>
        </app-field>
      </div>
      <div class="afdocs">
        <div class="afdh">Документы</div>
        <app-attach edit [files]="f().docs" (filesChange)="patch({ docs: $event })" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardFinal {
  protected readonly s = inject(AttestStore);
  protected readonly decisions = ATT_DECISIONS;
  protected readonly f = computed(() => this.s.form());
  protected patch(p: Partial<{ cand: boolean; cm: string; docs: AttachFile[] }>): void {
    this.s.form.update((f) => ({ ...f, ...p }));
  }
  protected setDec(dec: string): void {
    this.s.form.update((f) => ({ ...f, dec, cand: dec === 'Превосходит ожидания' ? f.cand : false }));
    this.s.clearFormErr('dec');
  }
}
