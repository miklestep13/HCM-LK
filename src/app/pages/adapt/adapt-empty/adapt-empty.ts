import { ChangeDetectionStrategy, Component, output } from '@angular/core';

/** «Нет плана»: приглашение создать адаптацию */
@Component({
  selector: 'app-adapt-empty',
  template: `
    <div class="c">
      <div class="cb ipempty">
        <h2>Плана адаптации пока нет</h2>
        <p>
          Адаптация — это задания на первые недели в новой роли. Она может закончиться раньше испытательного срока: сам срок состоит из целей. План согласует руководитель, после этого задания можно отмечать
          выполненными.
        </p>
        <div class="hbtns">
          <button class="btn pri" type="button" (click)="ask.emit()">Запросить у руководителя</button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdaptEmpty {
  readonly ask = output<void>();
}
