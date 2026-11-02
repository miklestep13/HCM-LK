import { ChangeDetectionStrategy, Component } from '@angular/core';
import { A360_COMPS } from '../../../data/a360.data';

/** порог заметного разрыва, п. п. */
const WARN = 20;

/**
 * «Разрыв самооценки»: по каждой компетенции — самооценка минус среднее окружения (руководители, коллеги, подчиненные).
 * Плюс (вправо) — слепая зона, минус (влево) — скрытый потенциал; от 20 п. п. — оранжевым. Шкала −60…+60.
 */
@Component({
  selector: '[a360-gap]',
  template: `
    <div class="ch"><h3>Разрыв самооценки</h3></div>
    <div class="cb">
      @for (r of rows; track r.name) {
        <div class="gap">
          <span class="gn">{{ r.name }}</span>
          <span class="gtr"
            ><span class="gv" [class.warn]="r.warn" [style.left.%]="r.left" [style.width.%]="r.width">{{ r.label }}</span></span
          >
        </div>
      }
      <div class="gax">
        <span>−60<br />скрытый потенциал</span>
        <span>+60<br />слепая зона</span>
      </div>
    </div>
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360Gap {
  protected readonly rows = A360_COMPS.map((c) => {
    const d = c.v[0] - Math.round((c.v[1] + c.v[2] + c.v[3]) / 3);
    const w = Math.min(Math.abs(d) / 60, 1) * 50;
    return { name: c.name, d, warn: Math.abs(d) >= WARN, left: d >= 0 ? 50 : 50 - w, width: w, label: (d > 0 ? '+' : '') + d };
  }).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
}
