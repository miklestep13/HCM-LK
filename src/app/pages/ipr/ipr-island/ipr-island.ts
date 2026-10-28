import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';

/** Действия перевода плана на следующий этап */
export type IprIslandAct = 'newcancel' | 'newsave' | 'send' | 'recall' | 'approve' | 'back' | 'save' | 'wcancel' | 'wfinish' | 'attok' | 'towork';

/**
 * Остров внизу страницы (как виджет, но без шапки): кнопки перевода плана на следующий этап.
 * В итоговых статусах острова нет.
 */
@Component({
  selector: '[ipr-island]',
  imports: [Float, Icon],
  template: `
    <div class="ipff">
      @if (s.creating()) {
        <button class="btn raised" (click)="act.emit('newcancel')">Отменить</button><button class="btn pri" (click)="act.emit('newsave')">Создать</button>
      } @else {
        @switch (s.st()) {
          @case ('Черновик') {
            <button class="btn pri" (click)="act.emit('send')">Отправить на согласование</button>
          }
          @case ('Предложено') {
            <button class="btn raised" (click)="act.emit('recall')">Отменить</button>
            <span class="sbtn"
              ><button class="btn pri" (click)="act.emit('approve')">Согласовать</button
              ><button class="btn pri sbar" aria-label="Другие действия" (click)="toggle($event)"><app-icon name="chevSm" /></button
            ></span>
          }
          @case ('Утверждено') {
            <button class="btn pri" (click)="act.emit('save')">Сохранить</button>
          }
          @case ('В работе') {
            <span class="ipatn">Выполнено {{ s.doneN() }} из {{ s.plan().tasks.length }}</span>
            <button class="btn raised" (click)="act.emit('wcancel')">Отменить</button><button class="btn pri" (click)="act.emit('wfinish')">Завершить</button>
          }
          @case ('Аттестация') {
            @if (s.isMgr()) {
              <span class="ipatn">Оценено {{ s.attN() }} из {{ s.plan().tasks.length }}</span>
              <button class="btn raised" (click)="act.emit('wcancel')">Отменить</button>
              <span class="sbtn"
                ><button class="btn pri" [disabled]="s.attN() < s.plan().tasks.length" (click)="act.emit('attok')">Согласовать</button
                ><button class="btn pri sbar" aria-label="Другие действия" (click)="toggle($event)"><app-icon name="chevSm" /></button
              ></span>
            }
          }
        }
      }
    </div>
    @if (menu(); as m) {
      <div class="fpop selpop" [appFloat]="m" (click)="$event.stopPropagation()">
        <div class="folist">
          @if (s.st() === 'Предложено') {
            <div class="foi" (click)="pick('back')">Вернуть на доработку</div>
          } @else {
            <div class="foi" (click)="pick('towork')">Вернуть в работу</div>
          }
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
