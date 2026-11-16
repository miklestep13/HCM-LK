import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AttestStore } from '../../../core/demo/attest-store.service';
import { ATT_PERSON_ROLES } from '../../../data/attest.data';
import { ChipSelect } from '../../../shared/ui/chip-select/chip-select';
import { PickPerson } from '../../../shared/ui/emp-pick/emp-pick';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AttPerson } from '../../../interface/attest';
import { ATT_RESP, attAddPeople, attBusy, attPeoplePick, attRolesOf, attSavePerson, avFor } from '../attncard.utils';

/**
 * Строка добавления участника в таблице «Участники» (как в виджете участников): «Добавить» в строке поиска открывает ее наверху таблицы.
 * Поля в ряд: выбор сотрудника (список с поиском, фото, ФИО и должностью; открыт сразу; уже участвующие и аттестуемый недоступны),
 * роли (несколько), справа иконки — галочка «Добавить» / «Сохранить» и крестик «Отменить».
 * person — изменение участника строкой на его месте: сотрудник показан без выбора, роли — текущие, галочка — «Сохранить».
 */
@Component({
  selector: '[attncard-person-add]',
  imports: [ChipSelect, Icon, Float],
  template: `
    <button #who class="afadp" [class.act]="open()" [class.err]="err() === 'name'" [class.ro]="!!person()" [disabled]="!!person()" aria-label="Сотрудник" (click)="toggle($event)">
      @if (sel(); as p) {
        <span class="av" [class]="av(p.name, p.av)"></span><span class="cnm"><b>{{ p.name }}</b><small>{{ p.post }}</small></span>
      } @else {
        <span class="ph">Выберите сотрудника</span>
      }
      @if (!person()) {
        <app-icon name="chevDown" />
      }
    </button>
    <div class="fld afadr" [class.err]="err() === 'role'">
      <app-chip-select [options]="roleOpts" [value]="roles()" (valueChange)="roles.set($event); err.set('')" placeholder="Выберите роли" />
    </div>
    <span class="afada">
      <button class="actb afok" [title]="person() ? 'Сохранить' : 'Добавить'" [attr.aria-label]="person() ? 'Сохранить' : 'Добавить'" (click)="add()"><app-icon name="check" /></button>
      <button class="actb" title="Отменить" aria-label="Отменить" (click)="done.emit()"><app-icon name="closeSm" /></button>
    </span>
    @if (open()) {
      <div class="fpop selpop cupop mbpick" [appFloat]="who" [style.width.px]="w()" (click)="$event.stopPropagation()">
        <input class="fin fsq" placeholder="Поиск по ФИО или должности" [value]="q()" (input)="q.set($any($event.target).value)" />
        <div class="folist cul">
          @for (p of found(); track p.name) {
            <button class="mbko" [class.on]="p.name === sel()?.name" (click)="choose(p)">
              <span class="av" [class]="av(p.name, p.av)"></span><span class="cnm"><b>{{ p.name }}</b><small>{{ p.post }}</small></span>
              @if (p.name === sel()?.name) {
                <app-icon name="checkSm" />
              }
            </button>
          } @empty {
            <div class="foe">Ничего не нашли. Проверьте написание.</div>
          }
        </div>
      </div>
    }
  `,
  host: { class: 'afadd', '(document:click)': 'open.set(false)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttncardPersonAdd implements OnInit, AfterViewInit {
  private readonly s = inject(AttestStore);
  private readonly toast = inject(ToastService);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  /** изменяемый участник; нет — добавление */
  readonly person = input<AttPerson | null>(null);
  readonly done = output<void>();
  protected readonly av = avFor;
  protected readonly roleOpts = [...ATT_PERSON_ROLES, ATT_RESP];
  protected readonly sel = signal<PickPerson | null>(null);
  protected readonly roles = signal<string[]>([]);
  protected readonly open = signal(false);
  protected readonly q = signal('');
  /** ширина списка — по полю, не уже 360 */
  protected readonly w = signal(360);
  /** незаполненное поле после «Добавить» */
  protected readonly err = signal<'' | 'name' | 'role'>('');
  /** кого можно добавить: не участвует и не аттестуемый; поиск по ФИО и должности */
  protected readonly found = computed(() => {
    const q = this.q().trim().toLowerCase();
    return attPeoplePick().filter((p) => !attBusy(this.s, p.name) && (!q || (p.name + ' ' + p.post).toLowerCase().includes(q)));
  });

  /** строка — в поле зрения (плавно), затем открыт список выбора */
  ngOnInit(): void {
    const x = this.person();
    if (x) {
      this.sel.set({ name: x.name, post: x.post, av: x.av });
      this.roles.set(attRolesOf(this.s, x));
    }
  }
  ngAfterViewInit(): void {
    // изменение: строка на месте участника, список сотрудников не нужен
    if (this.person()) return void this.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    // строка видна целиком — список выбора сразу
    const r = this.el.getBoundingClientRect();
    // пауза — пока таблица перестроит колонки под новую строку, иначе список встанет не у поля
    if (r.top >= 0 && r.bottom <= innerHeight) return void setTimeout(() => this.show(), 80);
    // иначе плавно прокручиваем к строке и открываем список, когда прокрутка затихла:
    // у поля, а не там, где оно было до прокрутки (прокрутка начинается не сразу — запасной таймер подольше)
    let t = setTimeout(() => done(), 1000);
    const moving = () => {
      clearTimeout(t);
      t = setTimeout(() => done(), 120);
    };
    const done = () => {
      document.removeEventListener('scroll', moving, true);
      this.show();
    };
    document.addEventListener('scroll', moving, true);
    this.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  protected toggle(e: Event): void {
    e.stopPropagation();
    if (this.open()) this.open.set(false);
    else this.show();
  }
  private show(): void {
    this.w.set(Math.max(360, this.el.querySelector<HTMLElement>('.afadp')?.offsetWidth ?? 0));
    this.q.set('');
    this.open.set(true);
    setTimeout(() => document.querySelector<HTMLInputElement>('.mbpick .fsq')?.focus());
  }
  protected choose(p: PickPerson): void {
    this.sel.set(p);
    this.open.set(false);
    this.err.set('');
  }
  protected add(): void {
    const p = this.sel();
    if (!p) {
      this.err.set('name');
      return this.toast.show('Проверьте строку', 'Выберите сотрудника.');
    }
    if (!this.roles().length) {
      this.err.set('role');
      return this.toast.show('Проверьте строку', 'Выберите хотя бы одну роль.');
    }
    const x = this.person();
    this.toast.show('Готово', x ? attSavePerson(this.s, x, this.roles()) : attAddPeople(this.s, [p.name], this.roles()));
    this.done.emit();
  }
}
