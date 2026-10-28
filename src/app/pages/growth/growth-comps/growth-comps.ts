import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { GROWTH_COMPS, GROWTH_LEVELS, GROWTH_POSITION } from '../../../data/growth.data';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Компетенции по профилю должности: уровень, нужный для должности, и текущий (точки 1–4 цветом уровня) */
@Component({
  selector: '[growth-comps]',
  template: `
    <div class="ch">
      <h3>Компетенции<span class="chip">{{ comps.length }}</span><small>Уровни по профилю должности «{{ position }}»</small></h3>
      <button class="lnk" (click)="dict()">Справочник</button>
    </div>
    <div class="tw">
      <table class="tbl grcmp">
        <thead>
          <tr>
            <th>Компетенция</th>
            <th style="width: 240px">Нужен для должности</th>
            <th style="width: 240px">Сейчас</th>
          </tr>
        </thead>
        <tbody>
          @for (c of comps; track c.name) {
            <tr class="clk" [attr.data-grc]="$index" (click)="open(c.name)">
              <td><b>{{ c.name }}</b></td>
              @for (n of [c.need, c.now]; track $index) {
                <td>
                  <span class="lvw" [class]="'lvw l' + n"
                    ><span class="lvd">
                      @for (i of dots; track i) {
                        <i [class]="i <= n ? 'l' + n : ''"></i>
                      } </span
                    >{{ levels[n] }}</span
                  >
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrowthComps {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly comps = GROWTH_COMPS;
  protected readonly levels = GROWTH_LEVELS;
  protected readonly position = GROWTH_POSITION;
  protected readonly dots = [1, 2, 3, 4];

  /** страница компетенции пока в разработке */
  protected open(name: string): void {
    this.nav.go('wip', { name: `Компетенция «${name}»`, sub: 'Страница компетенции с описанием — в разработке' });
  }
  protected dict(): void {
    this.toast.show('Готово', 'Справочник компетенций: библиотека с описанием уровней и индикаторов.');
  }
}
