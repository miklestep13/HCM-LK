import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CT_LEVELS, CT_LEVEL_DESC } from '../../data/career-track.data';
import { Icon } from '../../shared/ui/icon/icon';
import { CtLevel } from './ct-level';

/** Легенда уровней над таблицей. По умолчанию свернута, шеврон слева от заголовка */
@Component({
  selector: 'ct-legend',
  imports: [Icon, CtLevel],
  template: `
    <div class="ctleg" [class.open]="open()">
      <button type="button" class="ctlegh" [attr.aria-expanded]="open()" (click)="open.set(!open())">
        <span class="actb ctlegc" aria-hidden="true"><app-icon name="chevron" /></span>
        <b>Уровни компетенций</b>
        <small>что сотрудник умеет на каждом уровне</small>
      </button>
      @if (open()) {
        <div class="ctlegb">
          <table class="ctlegt">
            <tbody>
              @for (l of levels; track l) {
                <tr>
                  <td><ct-level [level]="l" /></td>
                  <td><b>{{ l }}</b></td>
                  <td>{{ desc[l] }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtLegend {
  protected readonly open = signal(false);
  protected readonly levels = CT_LEVELS;
  protected readonly desc = CT_LEVEL_DESC;
}
