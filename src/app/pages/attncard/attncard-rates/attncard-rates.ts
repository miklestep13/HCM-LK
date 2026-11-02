import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_SCALE } from '../../../data/attest.data';
import { ME_PHOTO } from '../../../data/people.data';
import { AttachFile } from '../../../interface/attach';
import { AttRate } from '../../../interface/attest';
import { AttachPreviewService } from '../../../shared/ui/attach/attach-preview.service';
import { attachKind, attachSize } from '../../../shared/ui/attach/attach.utils';
import { Chips } from '../../../shared/ui/chips/chips';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { AttncardCol } from '../attncard-col/attncard-col';
import { AttncardRateForm } from '../attncard-rate-form/attncard-rate-form';
import { avFor, isLetter, rateMethod } from '../attncard.utils';

/**
 * Требуемые оценки этапа: способ, оценивающий, дата, значение, статус; «Оценить» — тому, чья оценка (и правка своей на своем шаге).
 * Проставленная с комментарием или документами раскрывается.
 */
@Component({
  selector: '[attncard-rates]',
  imports: [AttncardCol, FilterBar, Chips, Select, Icon, AttncardRateForm],
  template: `
    <div class="ch">
      <button attncard-col="Требуемые оценки"></button>
      <h3>Требуемые оценки</h3>
      <span class="chip">{{ man().length }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по способу оценки или оценивающему" [(query)]="q">
      <app-chips label="Статус" [options]="statuses" [(value)]="st" />
      <app-select label="Способ" [options]="types()" allLabel="Все способы" placeholder="Все способы" [(value)]="t" />
    </app-filter-bar>
    <div class="cb">
      <div class="tw">
        <table class="tbl clbtbl asttbl">
          <thead>
            <tr>
              <th style="width: 130px">Способ оценки</th>
              <th style="width: 190px">Оценивающий</th>
              <th style="width: 104px">Дата оценки</th>
              <th style="width: 84px">Значение</th>
              <th style="width: 124px">Статус</th>
              <th style="width: 56px"></th>
            </tr>
          </thead>
          <tbody>
            @for (a of rows(); track a.k) {
              @let d = a.st === 'done';
              @let docs = d ? okDocs(a) : [];
              @let x = d && (!!a.cr || !!docs.length);
              <tr class="afrow" [class.afexp]="x" [class.open]="x && opened().has(a.k)" (click)="x ? toggle(a.k) : null">
                <td>
                  <span class="afcell"
                    ><span class="afchev">
                      @if (x) {
                        <app-icon name="chevDown" />
                      } </span
                    ><b class="asttp">{{ method(a) }}</b></span
                  >
                </td>
                <td>
                  <span class="pcell2 clbper astper">
                    @if (a.av === 'me') {
                      <img class="av astav" [src]="me" alt="" />
                    } @else if (isNum(a.av)) {
                      <span class="av astav" [class]="avFor(a.who, a.av)"></span>
                    } @else {
                      <span class="av astav astico"><app-icon [name]="a.av === 'grp' ? 'group' : 'monitor'" /></span>
                    }
                    <span class="cnm"><b>{{ a.who }}</b><small>{{ a.role }}</small></span>
                  </span>
                </td>
                <td>
                  @if (d) {
                    {{ a.d }}
                  } @else {
                    <span class="gr">—</span>
                  }
                </td>
                <td>
                  @if (!d) {
                    <span class="gr">—</span>
                  } @else if (letter(a.r)) {
                    <span [class]="'clbg g' + a.r" [title]="a.r + ' — ' + scale[a.r!]">{{ a.r }}</span>
                  } @else if (a.rm === 'num') {
                    <span class="clbg gS astsq" [title]="a.r + ' из 100'">{{ a.r }}</span>
                  } @else {
                    <span class="astrtx" [title]="a.r">{{ a.r }}</span>
                  }
                </td>
                <td>
                  @switch (a.st) {
                    @case ('wait') {
                      <span class="bdg gry">Ждет оценки</span>
                    }
                    @case ('todo') {
                      <span class="bdg info">Ждет оценки</span>
                    }
                    @default {
                      <span class="bdg ok">Проставлена</span>
                    }
                  }
                </td>
                <td>
                  <span class="acts">
                    @if (a.st === 'todo' || (d && s.own(a))) {
                      <button class="actb" [title]="d ? 'Изменить оценку' : 'Оценить'" (click)="$event.stopPropagation(); rate.set(a)"><app-icon name="edit" /></button>
                    }
                  </span>
                </td>
              </tr>
              @if (x) {
                <tr class="afacc" [class.hidden]="!opened().has(a.k)">
                  <td colspan="6">
                    <div class="afaccb">
                      @if (a.cr) {
                        <small>Комментарий</small>
                        <p>{{ a.cr }}</p>
                      }
                      @if (docs.length) {
                        <small class="afaccd">Документы</small>
                        <div class="afdcs">
                          @for (f of docs; track f.id) {
                            <button class="afdch" title="Открыть предпросмотр" (click)="pv.open(f)">
                              <span [class]="'atti k-' + kind(f.name)"><app-icon [name]="kind(f.name) === 'img' ? 'fileImg' : 'fileDoc'" /></span>
                              <span class="afdcn"><b>{{ f.name }}</b><small>{{ size(f.size) }}</small></span>
                              <span class="afdcd" title="Скачать" (click)="$event.stopPropagation(); pv.download(f)"><app-icon name="download" /></span>
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              }
            } @empty {
              <tr><td colspan="6" class="gr curnone">Оценки не найдены. Измените запрос или фильтры.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    @if (rate(); as a) {
      <app-attncard-rate-form [rate]="a" (closed)="rate.set(null)" />
    }
  `,
  host: { class: 'afsect', '[class.afcold]': 's.isCold("Требуемые оценки")' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardRates {
  protected readonly s = inject(AttestStore);
  protected readonly pv = inject(AttachPreviewService);
  protected readonly me = ME_PHOTO;
  protected readonly scale = ATT_SCALE;
  protected readonly method = rateMethod;
  protected readonly letter = isLetter;
  protected readonly avFor = avFor;
  protected readonly kind = attachKind;
  protected readonly size = attachSize;
  protected readonly isNum = (v: unknown) => typeof v === 'number';
  protected readonly statuses = ['Проставлена', 'Ждет оценки'];
  protected readonly q = signal('');
  protected readonly t = signal('');
  protected readonly st = signal('');
  protected readonly opened = signal(new Set<string>());
  protected readonly rate = signal<AttRate | null>(null);

  /** оценки людей (360 и цели — в «Пройденных оценках») */
  protected readonly man = computed(() => this.s.list().filter((a) => a.kind === 'man'));
  protected readonly types = computed(() => [...new Set(this.man().map((a) => a.t))]);
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.man().filter(
      (a) =>
        (!q || (a.t + ' ' + a.who + ' ' + a.role).toLowerCase().includes(q)) &&
        (!this.t() || a.t === this.t()) &&
        (!this.st() || (this.st() === 'Проставлена' ? a.st === 'done' : a.st !== 'done')),
    );
  });
  protected okDocs(a: AttRate): AttachFile[] {
    return (a.docs || []).filter((f) => f.st !== 'load');
  }
  protected toggle(k: string): void {
    const s = new Set(this.opened());
    s.has(k) ? s.delete(k) : s.add(k);
    this.opened.set(s);
  }
}
