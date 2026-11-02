import { ChangeDetectionStrategy, Component, booleanAttribute, input, model, output } from '@angular/core';

/**
 * Боковая панель (сайдбар) прототипа: затемнение, заголовок с крестиком, тело формы, кнопки внизу.
 *   <app-drawer title="Предложить идею" okLabel="Отправить" [(open)]="isOpen" (ok)="send()">
 *     …поля формы (app-field)…
 *   </app-drawer>
 * Над кнопками можно положить итог: <div drwFoot class="ctsum">…</div>.
 * okDanger — красная основная кнопка (удаление); cancelLabel — «Отменить» / «Закрыть».
 * Своя кнопка в подвале (например, сплит-кнопка): okLabel="" и <span drwBtn class="sbtn">…</span>.
 */
@Component({
  selector: 'app-drawer',
  template: `
    @if (open()) {
      <div class="drwo" (click)="close()"></div>
      <div class="drw" [class.wide]="wide()" [class.xl]="xl()" [class]="panel()">
        <div class="drwh">
          <b>{{ title() }}</b>
          <button class="drwx" title="Закрыть" (click)="close()">
            <svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          </button>
        </div>
        <div class="drwb"><ng-content /></div>
        <ng-content select="[drwFoot]" />
        <div class="drwf">
          <button class="btn raised" (click)="close()">{{ cancelLabel() }}</button>
          @if (okLabel()) {
            <button class="btn" [class.pri]="!okDanger()" [class.dng]="okDanger()" (click)="ok.emit()">{{ okLabel() }}</button>
          }
          <ng-content select="[drwBtn]" />
        </div>
      </div>
    }
  `,
  // title — вход компонента: браузер не должен показывать его подсказкой над всем сайдбаром
  host: { '(document:keydown.escape)': 'open() ? close() : null', '[attr.title]': 'null' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drawer {
  readonly title = input.required<string>();
  readonly open = model(false);
  readonly okLabel = input('Сохранить');
  readonly cancelLabel = input('Отменить');
  readonly okDanger = input(false, { transform: booleanAttribute });
  readonly wide = input(false, { transform: booleanAttribute });
  /** очень широкая панель (форма встречи) */
  readonly xl = input(false, { transform: booleanAttribute });
  /** доп. классы панели (например, «ipw glsrw» — форма оценки по шкале, 760) */
  readonly panel = input('');
  readonly ok = output<void>();
  readonly cancel = output<void>();
  close(): void {
    this.open.set(false);
    this.cancel.emit();
  }
}
