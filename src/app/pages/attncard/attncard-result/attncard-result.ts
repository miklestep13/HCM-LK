import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../../../shared/ui/icon/icon';

/** решение → цвет плашки и значок */
const DEC: Record<string, [string, string]> = {
  Пройдена: ['ok', '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10.5l3.2 3.2L15 6.8"/></svg>'],
  'Превосходит ожидания': ['bl', '<svg viewBox="0 0 16 16"><path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.6Z" fill="currentColor"/></svg>'],
  'Пройдена с условиями': ['wr', '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.5v5.5M10 14.2v.3"/></svg>'],
  'Не пройдена': ['dg', '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l8 8M14 6l-8 8"/></svg>'],
};
interface Dec {
  lbl: string;
  d: string;
  dt: string;
  cm: string;
  cmLbl: string;
}

/**
 * Итог аттестации: решение крупно (плашка в цвете решения, дата решения) и комментарий.
 * «Пройден с ИПР» — сверху решение по итогам ИПР, решение комиссии — под «Показать предыдущие решения».
 */
@Component({
  selector: '[attncard-result]',
  imports: [Icon, NgTemplateOutlet],
  template: `
    <div class="ch"><h3>Итог</h3></div>
    <div class="cb">
      @if (two()) {
        <ng-container *ngTemplateOutlet="dec; context: { $implicit: iprDec }" />
        <button class="lnk afprev" [class.open]="prev()" (click)="prev.set(!prev())">
          {{ prev() ? 'Скрыть предыдущие решения' : 'Показать предыдущие решения' }}<app-icon name="chevDown" />
        </button>
        <div class="afprevb" [class.hidden]="!prev()"><ng-container *ngTemplateOutlet="dec; context: { $implicit: comm() }" /></div>
      } @else {
        <ng-container *ngTemplateOutlet="dec; context: { $implicit: comm() }" />
      }
    </div>
    <ng-template #dec let-x>
      <div [class]="'afhero ' + tone(x.d)">
        <span class="afhic" [innerHTML]="icon(x.d)"></span>
        <div class="afhtx">
          <small>{{ x.lbl }}</small>
          <div class="afhdv"><b>{{ x.d }}</b></div>
          <span>Дата решения {{ x.dt }}</span>
        </div>
      </div>
      <div class="afresc">
        <small>{{ x.cmLbl }}</small>
        <p>{{ x.cm }}</p>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardResult {
  private readonly s = inject(AttestStore);
  private readonly san = inject(DomSanitizer);
  protected readonly prev = signal(false);
  protected readonly two = computed(() => this.s.stage() === 'iprok');
  protected readonly comm = computed<Dec>(() => {
    const r = this.s.res();
    return { lbl: 'Решение комиссии', d: r.dec, dt: r.d, cm: r.cm, cmLbl: 'Комментарий комиссии' };
  });
  protected readonly iprDec: Dec = {
    lbl: 'Решение по итогам ИПР',
    d: 'Пройдена',
    dt: '15.12.2026',
    cm: 'Разрывы по коммуникации с клиентом и управлению сроками закрыты: задачи ИПР выполнены, наставник подтвердил результат. Аттестация пройдена.',
    cmLbl: 'Комментарий по итогам ИПР',
  };
  protected tone(d: string): string {
    return (DEC[d] || DEC['Пройдена'])[0];
  }
  protected icon(d: string) {
    return this.san.bypassSecurityTrustHtml((DEC[d] || DEC['Пройдена'])[1]);
  }
}
