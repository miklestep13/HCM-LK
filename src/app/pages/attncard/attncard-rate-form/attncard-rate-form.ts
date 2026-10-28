import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_SCALE, ATT_SCALE_FULL, ATT_SCALE_POINTS, ATT_SCALE_TEXT } from '../../../data/attest.data';
import { AttachFile } from '../../../interface/attach';
import { AttRate } from '../../../interface/attest';
import { Attach, attachBusy } from '../../../shared/ui/attach/attach';
import { todayDmy } from '../../../shared/ui/attach/attach.utils';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const L = ['A', 'B', 'C', 'D', 'E'];

/**
 * Сайдбар «Оценить» (широкий, 760): шкала оценки (свернута), значение — способом ввода из dev-панели
 * (выбор A–E, выпадающий список, текст, баллы 0–100 со стрелками), комментарий и документы.
 */
@Component({
  selector: 'app-attncard-rate-form',
  imports: [Drawer, Field, Select, Icon, Attach],
  template: `
    <app-drawer [title]="title" panel="ipw glsrw" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="iprun">
        <div class="afrs afrsh" [class.cold]="cold()">
          <button class="actb glsrcol" [title]="cold() ? 'Развернуть' : 'Свернуть'" [attr.aria-label]="cold() ? 'Развернуть' : 'Свернуть'" (click)="cold.set(!cold())">
            <app-icon name="chevSm" /></button
          >Шкала оценки
        </div>
        <div class="glsct glsrsc afrst" [class.hidden]="cold()">
          <div class="tw">
            <table class="tbl">
              <thead>
                <tr>
                  <th [style.width.px]="mode === 'num' ? 110 : mode === 'text' ? 220 : 80">Значение</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                @for (l of letters; track l; let i = $index) {
                  <tr [class.on]="lv() === l">
                    @if (mode === 'num') {
                      <td><span [class]="'clbg g' + l + ' astsq'">{{ points[i] }}</span></td>
                      <td>{{ full[l] }}</td>
                    } @else if (mode === 'text') {
                      <td>{{ full[l] }}</td>
                      <td>{{ texts[i] }}</td>
                    } @else {
                      <td><span [class]="'clbg g' + l">{{ l }}</span></td>
                      <td>{{ full[l] }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="afrs">Оценка</div>
        @switch (mode) {
          @case ('list') {
            <app-field class="afrv" label="Значение" required full [filled]="!!r()" [error]="err()">
              <app-select [options]="listOpts" [value]="listVal()" (valueChange)="r.set($event.charAt(0)); err.set(false)" placeholder="Выберите значение" />
            </app-field>
          }
          @case ('text') {
            <app-field class="afrv" label="Значение" required full [filled]="!!r()" [error]="err()">
              <input class="fin" placeholder="Например: соответствует ожиданиям" [value]="r()" (input)="r.set($any($event.target).value.trim()); err.set(false)" />
            </app-field>
          }
          @case ('num') {
            <app-field class="afrv" label="Значение, баллы от 0 до 100" required full [filled]="r() !== ''" [error]="err()">
              <div class="numin afnumin">
                <input class="fin afnum" inputmode="numeric" maxlength="3" [value]="r()" (input)="num($event)" />
                <span class="nustep"
                  ><button type="button" class="nub" title="Больше" aria-label="Больше" (click)="step(1)"><app-icon name="stepUp" /></button
                  ><button type="button" class="nub" title="Меньше" aria-label="Меньше" (click)="step(-1)"><app-icon name="stepDown" /></button
                ></span>
              </div>
            </app-field>
          }
          @default {
            <div class="fld full afrv" [class.err]="err()">
              <div class="seg clbseg">
                @for (l of letters; track l) {
                  <span [class.on]="r() === l" (click)="r.set(l); err.set(false)">{{ l }}</span>
                }
              </div>
            </div>
          }
        }
        <div class="frm ipfrm">
          <app-field label="Комментарий" full [filled]="!!cm()">
            <textarea class="fta" rows="4" [value]="cm()" (input)="cm.set($any($event.target).value)"></textarea>
          </app-field>
        </div>
        <div class="afrs">Документы</div>
        <div><app-attach edit [(files)]="docs" /></div>
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardRateForm implements OnInit {
  private readonly s = inject(AttestStore);
  private readonly toast = inject(ToastService);
  readonly rate = input.required<AttRate>();
  readonly closed = output<void>();
  protected readonly letters = L;
  protected readonly full = ATT_SCALE_FULL;
  protected readonly points = ATT_SCALE_POINTS;
  protected readonly texts = ATT_SCALE_TEXT;
  protected readonly listOpts = L.map((l) => l + ' — ' + ATT_SCALE_FULL[l]);
  protected mode = this.s.inputMode();
  protected title = '';
  protected readonly cold = signal(true);
  protected readonly r = signal('');
  protected readonly cm = signal('');
  protected readonly docs = signal<AttachFile[]>([]);
  protected readonly err = signal(false);
  protected readonly listVal = computed(() => (ATT_SCALE[this.r()] ? this.r() + ' — ' + ATT_SCALE_FULL[this.r()] : ''));
  /** уровень шкалы для подсветки: баллы → буква */
  protected readonly lv = computed(() => {
    const r = this.r();
    if (this.mode !== 'num') return r;
    return r === '' ? '' : +r >= 90 ? 'A' : +r >= 75 ? 'B' : +r >= 60 ? 'C' : +r >= 40 ? 'D' : 'E';
  });

  ngOnInit(): void {
    const a = this.rate();
    this.title = a.t;
    if (a.st === 'done') {
      this.r.set(a.r || '');
      this.cm.set(a.cr || '');
    }
    this.docs.set((a.docs || []).map((f) => ({ ...f })));
  }
  protected num(e: Event): void {
    const i = e.target as HTMLInputElement;
    let v = i.value.replace(/\D/g, '');
    if (v !== '') v = String(Math.min(100, +v));
    i.value = v;
    this.r.set(v);
    this.err.set(false);
  }
  protected step(d: number): void {
    const cur = this.r();
    const v = cur === '' || isNaN(+cur) ? (d > 0 ? 0 : 100) : Math.max(0, Math.min(100, +cur + d));
    this.r.set(String(v));
    this.err.set(false);
  }
  protected save(): void {
    const r = this.r(),
      a = this.rate();
    if (!r) {
      this.err.set(true);
      return this.toast.show(
        'Нужно значение',
        this.mode === 'text' ? 'Опишите значение оценки.' : this.mode === 'num' ? 'Введите число от 0 до 100.' : 'Выберите значение оценки от A до E.',
      );
    }
    if (attachBusy(this.docs())) return this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
    const was = a.st === 'done';
    this.s.saveRate(a.k, {
      st: 'done',
      d: todayDmy(),
      r,
      rm: this.mode,
      cr: this.cm().trim(),
      docs: this.docs().map((f) => ({ ...f, by: f.by || a.who })),
    });
    this.closed.emit();
    this.toast.show(a.t + (was ? ' изменена' : ' сохранена'), 'Значение ' + r + (ATT_SCALE[r] ? ' — ' + ATT_SCALE[r] : this.mode === 'num' ? ' из 100' : '') + '.');
  }
}
