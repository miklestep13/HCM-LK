import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ProgramHead } from './program-head/program-head';
import { ProgramModules } from './program-modules/program-modules';

/** «Обучение → Программа»: шапка с прогрессом и кнопкой, состав по модулям. Параметры адреса: prog — программа, lt — раздел «Обучения». */
@Component({
  selector: 'app-program',
  imports: [PageHead, ProgramHead, ProgramModules],
  template: `
    <app-page-head title="Программа" />
    @if (prog()) {
      <div program-head [id]="prog()" [lt]="lt()"></div>
      <div program-modules [id]="prog()" [lt]="lt()"></div>
    }
  `,
  styleUrl: './program.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-program' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Program {
  readonly prog = input('');
  readonly lt = input('');
}
