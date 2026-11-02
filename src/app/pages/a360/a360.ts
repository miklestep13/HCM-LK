import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, inject } from '@angular/core';
import { DemoState } from '../../core/demo/demo-state.service';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { A360Block } from './a360-360/a360-360';
import { A360Comps } from './a360-comps/a360-comps';
import { A360Conc } from './a360-conc/a360-conc';
import { A360Gap } from './a360-gap/a360-gap';
import { A360Head } from './a360-head/a360-head';
import { A360Ppl } from './a360-ppl/a360-ppl';

/**
 * «Мой кабинет → Оценка 360»: «Выгрузить отчет» в заголовке; шапка с сотрудником; «Итоги оценки»;
 * «Сравнение оценок» (радар) и «Разрыв самооценки» 50/50; «Оценка по каждой компетенции».
 * Показываем опубликованный итог (этапов цикла на странице нет). Роль (dev-панель): сотрудник — комментарии анонимно,
 * без числа оценивающих; HR — с ФИО в комментариях и блоком «Участники оценки» внизу.
 */
@Component({
  selector: 'app-a360',
  imports: [PageHead, A360Head, A360Conc, A360Block, A360Comps, A360Gap, A360Ppl],
  template: `
    <app-page-head title="Оценка 360">
      <button class="btn pri a3rep" (click)="report()">Выгрузить отчет</button>
    </app-page-head>
    <div a360-head [full]="adm()"></div>
    <div a360-conc></div>
    <div class="a3row">
      <div class="c" a360-360></div>
      <div a360-gap></div>
    </div>
    <div class="mb" a360-comps [anon]="!adm()"></div>
    @if (adm()) {
      <div a360-ppl></div>
    }
  `,
  styleUrl: './a360.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-a360' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360 implements OnDestroy {
  private readonly toast = inject(ToastService);
  private readonly demo = inject(DemoState);
  protected readonly adm = computed(() => this.demo.a360Role() === 'adm');
  private readonly off = inject(DevPanelService).register({
    id: 'a360Role',
    label: 'Роль',
    options: [
      { value: 'emp', label: 'Сотрудник' },
      { value: 'adm', label: 'HR' },
    ],
    value: this.demo.a360Role,
  });
  ngOnDestroy(): void {
    this.off();
  }

  protected report(): void {
    this.toast.show('Готово', 'Полный отчет 360 выгружается в PDF: итоги, сравнение оценок, разрыв самооценки, таблица по компетенциям и комментарии оценивающих.');
  }
}
