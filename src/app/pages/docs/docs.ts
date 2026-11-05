import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { DOC_TYPES, MY_DOCS } from '../../data/docs.data';
import { MyDoc } from '../../interface/doc';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { DocsTable } from './docs-table/docs-table';

/**
 * «Мой кабинет → Документы» (ключ прототипа: docs): поиск, фильтры (тип, источник, статус), «Скачать все», таблица документов.
 * Клик по документу — просмотр (страница прототипа doccard; у документа «Ждет подписи» там же подписание).
 */
@Component({
  selector: 'app-docs',
  imports: [PageHead, FilterBar, Select, DocsTable],
  template: `
    <app-page-head title="Мои документы" />
    <div class="c full">
      <app-filter-bar placeholder="Поиск по документам" [(query)]="q">
        <button ftAction class="btn pri" (click)="downloadAll()">Скачать все</button>
        <app-select label="Тип документа" allLabel="Все" [options]="types" [(value)]="type" />
        <app-select label="Источник" allLabel="Все" [options]="sources" [(value)]="src" />
        <app-select label="Статус" allLabel="Все" [options]="statuses" [(value)]="status" />
      </app-filter-bar>
      <div class="cb" style="padding-top: 4px" docs-table [list]="shown()" (open)="open($event)"></div>
    </div>
  `,
  styleUrl: './docs.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-docs' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Docs {
  private readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly q = signal('');
  protected readonly type = signal('');
  protected readonly src = signal('');
  protected readonly status = signal('');

  protected readonly types = DOC_TYPES;
  protected readonly sources = [...new Set(MY_DOCS.map((d) => d.src))];
  protected readonly statuses = [...new Set(MY_DOCS.map((d) => d.status))];

  protected readonly shown = computed(() => {
    const q = this.q().trim().toLowerCase();
    return MY_DOCS.filter(
      (d) =>
        (!this.type() || d.type === this.type()) &&
        (!this.src() || d.src === this.src()) &&
        (!this.status() || d.status === this.status()) &&
        (!q || [d.name, d.src].join(' ').toLowerCase().includes(q)),
    );
  });

  protected downloadAll(): void {
    this.toast.show('Документы скачаны', 'Все документы собраны в архив и скачаны одним файлом.');
  }
  /** просмотр документа — страница прототипа (мост: OPEN.doccard) */
  protected open(d: MyDoc): void {
    this.nav.go('doccard', { doc: d.name, src: d.src, date: d.date, st: d.status });
  }
}
