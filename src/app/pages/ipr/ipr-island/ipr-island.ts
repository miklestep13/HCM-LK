import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';

/** Действия перевода плана на следующий этап */
export type IprIslandAct = 'newsave' | 'send' | 'approve' | 'back' | 'finish';

/**
 * Остров внизу страницы (как виджет, но без шапки): кнопки перевода плана на следующий этап.
 * Черновик → «Отправить на согласование»; Предложено → «Согласовать» (в меню — «Вернуть на доработку»);
 * Утверждено → выполнение задач и «Завершить». В итоговых статусах острова нет.
 */
@Component({
  selector: '[ipr-island]',
  imports: [Float, Icon],
  template: `
    <div class="ipff">
      @if (s.creating()) {
        <button class="btn pri" (click)="act.emit('newsave')">Создать</button>
      } @else {
        @switch (s.st()) {
          @case ('Черновик') {
            <button class="btn pri" (click)="act.emit('send')">Отправить на согласование</button>
          }
          @case ('Предложено') {
            <span class="sbtn"
              ><button class="btn pri" (click)="act.emit('approve')">Согласовать</button
              ><button class="btn pri sbar" aria-label="Другие действия" (click)="toggle($event)"><app-icon name="chevSm" /></button
            ></span>
          }
          @case ('Утверждено') {
            <span class="ipatn">Выполнено {{ s.doneN() }} из {{ s.plan().tasks.length }}</span>
            <button class="btn pri" (click)="act.emit('finish')">Завершить</button>
          }
        }
      }
    </div>
    @if (menu(); as m) {
      <div class="fpop selpop" [appFloat]="m" (click)="$event.stopPropagation()">
        <div class="folist">
          <div class="foi" (click)="pick('back')">Вернуть на доработку</div>
        </div>
      </div>
    }
  `,
  host: { class: 'c mt ipisl', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprIsland {
  protected readonly s = inject(IprStore);
  readonly act = output<IprIslandAct>();
  protected readonly menu = signal<HTMLElement | null>(null);

  protected toggle(e: Event): void {
    e.stopPropagation();
    const b = e.currentTarget as HTMLElement;
    this.menu.set(this.menu() === b ? null : b);
  }
  protected pick(a: IprIslandAct): void {
    this.menu.set(null);
    this.act.emit(a);
  }
}
