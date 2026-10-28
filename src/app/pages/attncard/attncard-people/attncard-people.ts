import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { AttPerson } from '../../../interface/attest';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { avFor } from '../attncard.utils';

/**
 * Участники аттестации карточками (правая колонка): действующие сверху; недействующие — по переключателю (сотрудник их не видит).
 * Руководитель добавляет участников, меняет роли и исключает (меню «…»).
 */
@Component({
  selector: '[attncard-people]',
  imports: [Icon, Float],
  template: `
    <div class="ch">
      <h3>Участники</h3>
      <span class="chip">{{ act().length }}</span>
      @if (s.canEditPeople()) {
        <button class="btn pri afpadd" (click)="edit.emit(null)">Добавить</button>
      }
    </div>
    <div class="cb">
      @if (old().length) {
        <label class="swt afppsw"
          ><input type="checkbox" [checked]="showOff()" (change)="showOff.set($any($event.target).checked)" /><i></i
          ><span>Показать недействующих ({{ old().length }})</span></label
        >
      }
      @for (x of list(); track x.name + x.role) {
        @let menuOn = s.canEditPeople() && !x.till && x.role !== 'Руководитель';
        <div class="mem" [class.afoff]="!!x.till" (click)="card(x)">
          <span class="av" [class]="av(x.name, x.av)"></span>
          <div class="i">
            <div class="nm">{{ x.name }}</div>
            <div class="rl">{{ x.post }}</div>
            <div class="gltags">
              @for (r of roles(x); track r) {
                <span class="bdg">{{ r }}</span>
              }
              @if (!x.till && x.name === s.responsible()) {
                <span class="bdg">Ответственный за бланк</span>
              }
              @if (x.till) {
                <span class="bdg gry">Участвовал до {{ x.till }}</span>
              }
            </div>
          </div>
          @if (menuOn) {
            <button class="actb dots afpm" title="Действия" (click)="openMenu(x, $event)"><app-icon name="dots" /></button>
          }
        </div>
      }
    </div>
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m.a" (click)="$event.stopPropagation()">
        <button class="ami" (click)="menu.set(null); edit.emit(m.x)"><app-icon name="edit" />Редактировать</button>
        <button class="ami dg" (click)="menu.set(null); remove.emit(m.x)"><app-icon name="trashSm" />Исключить из аттестации</button>
      </div>
    }
  `,
  host: { '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardPeople {
  protected readonly s = inject(AttestStore);
  private readonly toast = inject(ToastService);
  readonly edit = output<AttPerson | null>();
  readonly remove = output<AttPerson>();
  protected readonly av = avFor;
  protected readonly showOff = signal(false);
  protected readonly menu = signal<{ x: AttPerson; a: HTMLElement } | null>(null);
  protected readonly act = computed(() => this.s.people().filter((x) => !x.till));
  protected readonly old = computed(() => (this.s.role() === 'emp' ? [] : this.s.people().filter((x) => x.till)));
  protected readonly list = computed(() => [...this.act(), ...(this.showOff() ? this.old() : [])]);
  protected roles(x: AttPerson): string[] {
    return x.role ? x.role.split(', ') : [];
  }
  protected card(x: AttPerson): void {
    this.toast.show('Участник аттестации', `Карточка сотрудника: ${x.name}.`);
  }
  protected openMenu(x: AttPerson, e: Event): void {
    e.stopPropagation();
    const a = e.currentTarget as HTMLElement;
    this.menu.set(this.menu()?.a === a ? null : { x, a });
  }
}
